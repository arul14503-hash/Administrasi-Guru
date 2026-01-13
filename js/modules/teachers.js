/**
 * Teachers Module
 */
window.modules.teachers = {
    load: async function (container) {
        container.innerHTML = `
            <div class="table-container">
                <div class="table-actions">
                    <div class="search-bar">
                        <input type="text" id="teacher-search" class="search-input" placeholder="Cari nama atau NIP...">
                    </div>
                    <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                        <input type="file" id="import-teacher-excel" accept=".xlsx, .xls" style="display: none;">
                        <button id="btn-import-teacher" class="btn btn-secondary btn-sm" title="Import dari Excel">
                            <i class="ph ph-upload-simple"></i> Import
                        </button>
                        <button id="add-teacher-btn" class="btn btn-primary btn-sm">
                            <i class="ph ph-plus"></i> Tambah Guru
                        </button>
                    </div>
                </div>
                <div id="teachers-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>NIP</th>
                                <th>Nama Lengkap</th>
                                <th>Pangkat/Gol</th>
                                <th>Mata Pelajaran</th>
                                <th>Jabatan</th>
                                <th>No HP</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="teachers-tbody">
                            <tr><td colspan="8" class="text-center">Memuat data...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('add-teacher-btn').addEventListener('click', () => this.openForm());
        document.getElementById('teacher-search').addEventListener('input', this.debounce(this.renderTable.bind(this), 300));

        document.getElementById('btn-import-teacher').addEventListener('click', () => document.getElementById('import-teacher-excel').click());
        document.getElementById('import-teacher-excel').addEventListener('change', (e) => this.handleImport(e));

        await this.renderTable();
    },

    renderTable: async function () {
        const tbody = document.getElementById('teachers-tbody');
        const search = document.getElementById('teacher-search').value.toLowerCase();

        try {
            let teachers = await window.db.getAll('teachers');

            const filtered = teachers.filter(t =>
                t.name.toLowerCase().includes(search) ||
                t.nip.toString().includes(search)
            );

            tbody.innerHTML = '';
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Tidak ada data guru.</td></tr>';
                return;
            }

            filtered.forEach(t => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${t.nip}</td>
                    <td>${t.name}</td>
                    <td>${t.rank || '-'}</td>
                    <td>${t.subject}</td>
                    <td>${t.role}</td>
                    <td>${t.phone || '-'}</td>
                    <td><span class="badge ${t.status === 'Aktif' ? 'badge-success' : 'badge-danger'}">${t.status}</span></td>
                    <td>
                        <button class="icon-btn edit-btn" data-id="${t.id}"><i class="ph ph-pencil"></i></button>
                        <button class="icon-btn delete-btn" data-id="${t.id}"><i class="ph ph-trash" style="color: var(--danger);"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.querySelectorAll('.edit-btn').forEach(btn =>
                btn.addEventListener('click', () => this.openForm(Number(btn.dataset.id)))
            );
            document.querySelectorAll('.delete-btn').forEach(btn =>
                btn.addEventListener('click', () => this.deleteTeacher(Number(btn.dataset.id)))
            );

        } catch (error) {
            console.error(error);
            tbody.innerHTML = '<tr><td colspan="8" class="text-danger">Gagal memuat data.</td></tr>';
        }
    },

    openForm: async function (id = null) {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalOverlay = document.getElementById('modal-overlay');

        let teacher = {
            nip: '',
            name: '',
            rank: '',
            subject: '',
            role: 'Guru',
            address: '',
            phone: '',
            email: '',
            status: 'Aktif'
        };

        if (id) {
            modalTitle.textContent = 'Edit Guru';
            teacher = await window.db.get('teachers', id);
        } else {
            modalTitle.textContent = 'Tambah Guru';
        }

        modalBody.innerHTML = `
            <form id="teacher-form">
                <div class="form-group">
                    <label>NIP</label>
                    <input type="text" id="nip" class="form-control" value="${teacher.nip}" required>
                </div>
                <div class="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" id="name" class="form-control" value="${teacher.name}" required>
                </div>
                <div class="form-group">
                    <label>Pangkat / Golongan</label>
                    <input type="text" id="rank" class="form-control" value="${teacher.rank || ''}" placeholder="Contoh: III/a">
                </div>
                <div class="form-group">
                    <label>Mata Pelajaran</label>
                    <input type="text" id="subject" class="form-control" value="${teacher.subject}">
                </div>
                <div class="form-group">
                    <label>Jabatan</label>
                    <select id="role" class="form-control">
                        <option value="Guru" ${teacher.role === 'Guru' ? 'selected' : ''}>Guru</option>
                        <option value="Wali Kelas" ${teacher.role === 'Wali Kelas' ? 'selected' : ''}>Wali Kelas</option>
                        <option value="Kepala Sekolah" ${teacher.role === 'Kepala Sekolah' ? 'selected' : ''}>Kepala Sekolah</option>
                        <option value="Tata Usaha" ${teacher.role === 'Tata Usaha' ? 'selected' : ''}>Tata Usaha</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Alamat</label>
                    <textarea id="address" class="form-control" rows="2">${teacher.address || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>No HP</label>
                    <input type="tel" id="phone" class="form-control" value="${teacher.phone || ''}" placeholder="08xxxxxxxxxx">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" class="form-control" value="${teacher.email || ''}" placeholder="contoh@email.com">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="status" class="form-control">
                        <option value="Aktif" ${teacher.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                        <option value="Tidak Aktif" ${teacher.status === 'Tidak Aktif' ? 'selected' : ''}>Tidak Aktif</option>
                    </select>
                </div>
            </form>
        `;

        modalOverlay.classList.remove('hidden');

        const saveBtn = document.getElementById('modal-save');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', async () => {
            const formData = {
                nip: document.getElementById('nip').value,
                name: document.getElementById('name').value,
                rank: document.getElementById('rank').value,
                subject: document.getElementById('subject').value,
                role: document.getElementById('role').value,
                address: document.getElementById('address').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                status: document.getElementById('status').value
            };

            if (!formData.nip || !formData.name) {
                alert('NIP dan Nama wajib diisi!');
                return;
            }

            try {
                if (id) {
                    await window.db.update('teachers', { ...formData, id });
                    app.showToast('Data guru berhasil diperbarui');
                } else {
                    await window.db.add('teachers', formData);
                    app.showToast('Guru baru berhasil ditambahkan');
                }
                modalOverlay.classList.add('hidden');
                this.renderTable();
            } catch (error) {
                console.error(error);
                alert('Gagal menyimpan data.');
            }
        });
    },

    deleteTeacher: async function (id) {
        if (confirm('Hapus data guru ini?')) {
            try {
                await window.db.delete('teachers', id);
                app.showToast('Data guru dihapus');
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
                    const teacher = {
                        nip: (row['NIP'] || row['nip'] || '').toString(),
                        name: row['Nama Lengkap'] || row['Nama'] || row['nama'] || '',
                        rank: row['Pangkat/Gol'] || row['Pangkat'] || row['rank'] || '',
                        subject: row['Mata Pelajaran'] || row['Mapel'] || row['subject'] || '',
                        role: row['Jabatan'] || row['role'] || 'Guru',
                        address: row['Alamat'] || row['address'] || '',
                        phone: (row['No HP'] || row['HP'] || row['phone'] || '').toString(),
                        email: row['Email'] || row['email'] || '',
                        status: row['Status'] || 'Aktif'
                    };

                    if (!teacher.nip || !teacher.name) {
                        failCount++;
                        continue;
                    }

                    try {
                        await window.db.add('teachers', teacher);
                        successCount++;
                    } catch (err) {
                        console.error('Failed to import teacher:', teacher.name, err);
                        failCount++;
                    }
                }

                alert(`Import selesai!\nBerhasil: ${successCount}\nGagal: ${failCount} (Mungkin NIP ganda)`);
                this.renderTable();
                event.target.value = ''; // Reset

            } catch (error) {
                console.error('Error parsing Excel:', error);
                alert('Gagal memproses file Excel. Pastikan format benar.');
            }
        };
        reader.readAsArrayBuffer(file);
    }
};
