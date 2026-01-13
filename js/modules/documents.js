/**
 * Documents Module
 */
window.modules.documents = {
    load: async function (container) {
        container.innerHTML = `
            <div class="table-container">
                <div class="table-actions">
                    <div class="search-bar">
                        <input type="text" id="doc-search" class="search-input" placeholder="Cari dokumen...">
                    </div>
                    <button id="add-doc-btn" class="btn btn-primary">
                        <i class="ph ph-plus"></i> Arsipkan Dokumen
                    </button>
                </div>
                <div id="doc-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Kategori</th>
                                <th>Keterangan / Judul</th>
                                <th>Link File</th>
                                <th>Tanggal Arsip</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="doc-tbody">
                            <tr><td colspan="5" class="text-center">Memuat data...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('add-doc-btn').addEventListener('click', () => this.openForm());
        document.getElementById('doc-search').addEventListener('input', this.debounce(this.renderTable.bind(this), 300));

        await this.renderTable();
    },

    renderTable: async function () {
        const tbody = document.getElementById('doc-tbody');
        const search = document.getElementById('doc-search').value.toLowerCase();

        try {
            let items = await window.db.getAll('documents');
            items.sort((a, b) => new Date(b.date) - new Date(a.date));

            const filtered = items.filter(i =>
                i.category.toLowerCase().includes(search) ||
                i.description.toLowerCase().includes(search)
            );

            tbody.innerHTML = '';
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Tidak ada dokumen.</td></tr>';
                return;
            }

            filtered.forEach(item => {
                const tr = document.createElement('tr');
                const linkHtml = item.fileLink
                    ? `<a href="${item.fileLink}" target="_blank" rel="noopener noreferrer" style="color: var(--primary);"><i class="ph ph-link"></i> Buka</a>`
                    : '-';
                tr.innerHTML = `
                    <td><span class="badge" style="background-color: #e2e8f0;">${item.category}</span></td>
                    <td>${item.description}</td>
                    <td>${linkHtml}</td>
                    <td>${item.date}</td>
                    <td>
                        <button class="icon-btn edit-btn" data-id="${item.id}"><i class="ph ph-pencil"></i></button>
                        <button class="icon-btn delete-btn" data-id="${item.id}"><i class="ph ph-trash" style="color: var(--danger);"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.querySelectorAll('.edit-btn').forEach(btn =>
                btn.addEventListener('click', () => this.openForm(Number(btn.dataset.id)))
            );
            document.querySelectorAll('.delete-btn').forEach(btn =>
                btn.addEventListener('click', () => this.deleteItem(Number(btn.dataset.id)))
            );

        } catch (error) {
            console.error(error);
            tbody.innerHTML = '<tr><td colspan="5" class="text-danger">Gagal memuat data.</td></tr>';
        }
    },

    openForm: async function (id = null) {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalOverlay = document.getElementById('modal-overlay');

        let item = {
            category: 'Umum',
            description: '',
            fileLink: '',
            date: new Date().toISOString().split('T')[0]
        };

        if (id) {
            modalTitle.textContent = 'Edit Dokumen';
            item = await window.db.get('documents', id);
        } else {
            modalTitle.textContent = 'Arsipkan Baru';
        }

        modalBody.innerHTML = `
            <form id="doc-form">
                <div class="form-group">
                    <label>Kategori</label>
                    <select id="category" class="form-control">
                        <option value="Umum" ${item.category === 'Umum' ? 'selected' : ''}>Umum</option>
                        <option value="SK" ${item.category === 'SK' ? 'selected' : ''}>SK</option>
                        <option value="Rapor" ${item.category === 'Rapor' ? 'selected' : ''}>Rapor</option>
                        <option value="Keuangan" ${item.category === 'Keuangan' ? 'selected' : ''}>Keuangan</option>
                        <option value="Kurikulum" ${item.category === 'Kurikulum' ? 'selected' : ''}>Kurikulum</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Keterangan / Judul Dokumen</label>
                    <textarea id="description" class="form-control" rows="3" required>${item.description}</textarea>
                </div>
                <div class="form-group">
                    <label>Link File (Google Drive / Dropbox / dll)</label>
                    <input type="url" id="fileLink" class="form-control" value="${item.fileLink || ''}" placeholder="https://drive.google.com/...">
                </div>
                <div class="form-group">
                    <label>Tanggal Arsip</label>
                    <input type="date" id="date" class="form-control" value="${item.date}" required>
                </div>
            </form>
        `;

        modalOverlay.classList.remove('hidden');

        const saveBtn = document.getElementById('modal-save');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', async () => {
            const formData = {
                category: document.getElementById('category').value,
                description: document.getElementById('description').value,
                fileLink: document.getElementById('fileLink').value,
                date: document.getElementById('date').value
            };

            if (!formData.description) {
                alert('Keterangan wajib diisi!');
                return;
            }

            try {
                if (id) {
                    await window.db.update('documents', { ...formData, id });
                    app.showToast('Dokumen berhasil diperbarui');
                } else {
                    await window.db.add('documents', formData);
                    app.showToast('Dokumen berhasil diarsipkan');
                }
                modalOverlay.classList.add('hidden');
                this.renderTable();
            } catch (error) {
                console.error(error);
                alert('Gagal menyimpan data.');
            }
        });
    },

    deleteItem: async function (id) {
        if (confirm('Hapus dokumen ini?')) {
            try {
                await window.db.delete('documents', id);
                app.showToast('Dokumen dihapus');
                this.renderTable();
            } catch (error) {
                console.error(error);
                app.showToast('Gagal menghapus data', 'error');
            }
        }
    },

    debounce: function (func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};
