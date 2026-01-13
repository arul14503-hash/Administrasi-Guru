/**
 * Inventory Module
 */
window.modules.inventory = {
    load: async function (container) {
        container.innerHTML = `
            <div class="table-container">
                <div class="table-actions">
                    <div class="search-bar">
                        <input type="text" id="inventory-search" class="search-input" placeholder="Cari barang...">
                    </div>
                    <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                        <input type="file" id="import-inventory-excel" accept=".xlsx, .xls" style="display: none;">
                        <button id="btn-import-inventory" class="btn btn-secondary" title="Import Inventaris dari Excel">
                            <i class="ph ph-upload-simple"></i> Import Excel
                        </button>
                        <button id="add-inventory-btn" class="btn btn-primary">
                            <i class="ph ph-plus"></i> Tambah Barang
                        </button>
                    </div>
                </div>
                <div id="inventory-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Nama Barang</th>
                                <th>Jumlah</th>
                                <th>Kondisi</th>
                                <th>Lokasi</th>
                                <th>Tahun</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="inventory-tbody">
                            <tr><td colspan="7" class="text-center">Memuat data...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('add-inventory-btn').addEventListener('click', () => this.openForm());
        document.getElementById('inventory-search').addEventListener('input', this.debounce(this.renderTable.bind(this), 300));

        document.getElementById('btn-import-inventory').addEventListener('click', () => document.getElementById('import-inventory-excel').click());
        document.getElementById('import-inventory-excel').addEventListener('change', (e) => this.handleImport(e));

        await this.renderTable();
    },

    renderTable: async function () {
        const tbody = document.getElementById('inventory-tbody');
        const search = document.getElementById('inventory-search').value.toLowerCase();

        try {
            let items = await window.db.getAll('inventory');

            const filtered = items.filter(i =>
                i.name.toLowerCase().includes(search) ||
                i.code.toLowerCase().includes(search)
            );

            tbody.innerHTML = '';
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Tidak ada data inventaris.</td></tr>';
                return;
            }

            filtered.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.amount}</td>
                    <td><span class="badge ${item.condition === 'Baik' ? 'badge-success' : 'badge-danger'}">${item.condition}</span></td>
                    <td>${item.location}</td>
                    <td>${item.year}</td>
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
            tbody.innerHTML = '<tr><td colspan="7" class="text-danger">Gagal memuat data.</td></tr>';
        }
    },

    openForm: async function (id = null) {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalOverlay = document.getElementById('modal-overlay');

        let item = {
            code: '',
            name: '',
            amount: 0,
            condition: 'Baik',
            location: '',
            year: new Date().getFullYear()
        };

        if (id) {
            modalTitle.textContent = 'Edit Barang';
            item = await window.db.get('inventory', id);
        } else {
            modalTitle.textContent = 'Tambah Barang';
        }

        modalBody.innerHTML = `
            <form id="inventory-form">
                <div class="form-group">
                    <label>Kode Barang</label>
                    <input type="text" id="code" class="form-control" value="${item.code}" required>
                </div>
                <div class="form-group">
                    <label>Nama Barang</label>
                    <input type="text" id="name" class="form-control" value="${item.name}" required>
                </div>
                <div class="form-group">
                    <label>Jumlah</label>
                    <input type="number" id="amount" class="form-control" value="${item.amount}">
                </div>
                <div class="form-group">
                    <label>Kondisi</label>
                    <select id="condition" class="form-control">
                        <option value="Baik" ${item.condition === 'Baik' ? 'selected' : ''}>Baik</option>
                        <option value="Rusak Ringan" ${item.condition === 'Rusak Ringan' ? 'selected' : ''}>Rusak Ringan</option>
                        <option value="Rusak Berat" ${item.condition === 'Rusak Berat' ? 'selected' : ''}>Rusak Berat</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Lokasi</label>
                    <input type="text" id="location" class="form-control" value="${item.location}">
                </div>
                <div class="form-group">
                    <label>Tahun Pengadaan</label>
                    <input type="number" id="year" class="form-control" value="${item.year}">
                </div>
            </form>
        `;

        modalOverlay.classList.remove('hidden');

        const saveBtn = document.getElementById('modal-save');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', async () => {
            const formData = {
                code: document.getElementById('code').value,
                name: document.getElementById('name').value,
                amount: Number(document.getElementById('amount').value),
                condition: document.getElementById('condition').value,
                location: document.getElementById('location').value,
                year: document.getElementById('year').value
            };

            if (!formData.code || !formData.name) {
                alert('Kode dan Nama Barang wajib diisi!');
                return;
            }

            try {
                if (id) {
                    await window.db.update('inventory', { ...formData, id });
                    app.showToast('Data barang berhasil diperbarui');
                } else {
                    await window.db.add('inventory', formData);
                    app.showToast('Barang berhasil ditambahkan');
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
        if (confirm('Hapus barang ini?')) {
            try {
                await window.db.delete('inventory', id);
                app.showToast('Barang dihapus');
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
    },

    handleImport: async function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    alert('File Excel kosong!');
                    return;
                }

                let successCount = 0;
                let failCount = 0;

                for (const row of jsonData) {
                    const item = {
                        code: (row['Kode'] || row['kode'] || '').toString(),
                        name: row['Nama Barang'] || row['Nama'] || row['name'] || '',
                        amount: Number(row['Jumlah'] || row['jumlah'] || row['amount']) || 0,
                        condition: row['Kondisi'] || row['condition'] || 'Baik',
                        location: row['Lokasi'] || row['location'] || '',
                        year: Number(row['Tahun'] || row['tahun'] || row['year']) || new Date().getFullYear()
                    };

                    if (!item.code || !item.name) {
                        failCount++;
                        continue;
                    }

                    try {
                        // Check if code exists to decide between add or update (optional logic)
                        // For simplicity and matching user request of "importing data", let's prioritize adding.
                        await window.db.add('inventory', item);
                        successCount++;
                    } catch (err) {
                        console.error('Failed to import inventory item:', item.name, err);
                        failCount++;
                    }
                }

                alert(`Import Inventaris Selesai!\nBerhasil: ${successCount}\nGagal: ${failCount} (Mungkin Kode ganda)`);
                this.renderTable();
                event.target.value = '';

            } catch (error) {
                console.error('Error parsing Excel:', error);
                alert('Gagal memproses file Excel.');
            }
        };
        reader.readAsArrayBuffer(file);
    }
};
