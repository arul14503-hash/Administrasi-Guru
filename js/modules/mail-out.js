/**
 * Mail Out Module
 */
window.modules['mail-out'] = {
    load: async function (container) {
        container.innerHTML = `
            <div class="table-container">
                <div class="table-actions">
                    <div class="search-bar">
                        <input type="text" id="mail-search" class="search-input" placeholder="Cari surat...">
                    </div>
                    <button id="add-mail-btn" class="btn btn-primary">
                        <i class="ph ph-plus"></i> Catat Surat Keluar
                    </button>
                </div>
                <div id="mail-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nomor Surat</th>
                                <th>Tanggal</th>
                                <th>Tujuan</th>
                                <th>Perihal</th>
                                <th>Link File</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="mail-tbody">
                            <tr><td colspan="6" class="text-center">Memuat data...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('add-mail-btn').addEventListener('click', () => this.openForm());
        document.getElementById('mail-search').addEventListener('input', this.debounce(this.renderTable.bind(this), 300));

        await this.renderTable();
    },

    renderTable: async function () {
        const tbody = document.getElementById('mail-tbody');
        const search = document.getElementById('mail-search').value.toLowerCase();

        try {
            let items = await window.db.getAll('mail_out');
            items.sort((a, b) => new Date(b.date) - new Date(a.date));

            const filtered = items.filter(i =>
                i.number.toLowerCase().includes(search) ||
                i.target.toLowerCase().includes(search) ||
                i.subject.toLowerCase().includes(search)
            );

            tbody.innerHTML = '';
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Tidak ada surat keluar.</td></tr>';
                return;
            }

            filtered.forEach(item => {
                const tr = document.createElement('tr');
                const linkHtml = item.link
                    ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color: var(--primary);"><i class="ph ph-link"></i> Buka</a>`
                    : '-';
                tr.innerHTML = `
                    <td>${item.number}</td>
                    <td>${item.date}</td>
                    <td>${item.target}</td>
                    <td>${item.subject}</td>
                    <td>${linkHtml}</td>
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
            tbody.innerHTML = '<tr><td colspan="6" class="text-danger">Gagal memuat data.</td></tr>';
        }
    },

    openForm: async function (id = null) {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalOverlay = document.getElementById('modal-overlay');

        let item = {
            number: '',
            date: new Date().toISOString().split('T')[0],
            target: '',
            subject: '',
            pic: '', // Penanggung jawab
            link: ''
        };

        if (id) {
            modalTitle.textContent = 'Edit Surat Keluar';
            item = await window.db.get('mail_out', id);
        } else {
            modalTitle.textContent = 'Catat Surat Keluar';
        }

        modalBody.innerHTML = `
            <form id="mail-form">
                <div class="form-group">
                    <label>Nomor Surat</label>
                    <input type="text" id="number" class="form-control" value="${item.number}" required>
                </div>
                <div class="form-group">
                    <label>Tanggal Surat</label>
                    <input type="date" id="date" class="form-control" value="${item.date}" required>
                </div>
                <div class="form-group">
                    <label>Tujuan</label>
                    <input type="text" id="target" class="form-control" value="${item.target}" required>
                </div>
                <div class="form-group">
                    <label>Perihal</label>
                    <input type="text" id="subject" class="form-control" value="${item.subject}" required>
                </div>
                <div class="form-group">
                    <label>Penanggung Jawab</label>
                    <input type="text" id="pic" class="form-control" value="${item.pic || ''}">
                </div>
                <div class="form-group">
                    <label>Link File (Google Drive / Dropbox, dll)</label>
                    <input type="url" id="link" class="form-control" value="${item.link || ''}" placeholder="https://...">
                </div>
            </form>
        `;

        modalOverlay.classList.remove('hidden');

        const saveBtn = document.getElementById('modal-save');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', async () => {
            const formData = {
                number: document.getElementById('number').value,
                date: document.getElementById('date').value,
                target: document.getElementById('target').value,
                subject: document.getElementById('subject').value,
                pic: document.getElementById('pic').value,
                link: document.getElementById('link').value
            };

            if (!formData.number || !formData.date) {
                alert('Nomor dan Tanggal wajib diisi!');
                return;
            }

            try {
                if (id) {
                    await window.db.update('mail_out', { ...formData, id });
                    app.showToast('Surat keluar berhasil diperbarui');
                } else {
                    await window.db.add('mail_out', formData);
                    app.showToast('Surat keluar berhasil dicatat');
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
        if (confirm('Hapus surat ini?')) {
            try {
                await window.db.delete('mail_out', id);
                app.showToast('Surat dihapus');
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
