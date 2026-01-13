/**
 * Students Module
 */
window.modules.students = {
    load: async function (container) {
        // Fetch classes and majors
        let classList = [];
        let majorList = [];
        try {
            classList = await window.db.getAll('classes');
            classList.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

            majorList = await window.db.getAll('majors');
            majorList.sort((a, b) => a.name.localeCompare(b.name));
        } catch (e) {
            console.error("Failed to load metadata", e);
            classList = [{ name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, { name: '5' }, { name: '6' }]; // Fallback
            majorList = [{ name: 'Umum' }];
        }

        container.innerHTML = `
            <div class="table-container">
                <div class="table-actions">
                    <div class="search-bar">
                        <input type="text" id="student-search" class="search-input" placeholder="Cari nama atau NIS...">
                        <select id="class-filter" class="form-control" style="width: 150px;">
                            <option value="">Semua Kelas</option>
                            ${classList.map(c => `<option value="${c.name}">Kelas ${c.name}</option>`).join('')}
                        </select>
                        <select id="major-filter" class="form-control" style="width: 150px;">
                            <option value="">Semua Jurusan</option>
                            ${majorList.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="action-buttons" style="display: flex; gap: 10px;">
                        <input type="file" id="import-excel" accept=".xlsx, .xls" style="display: none;">
                        <button id="btn-import" class="btn btn-outline-primary">
                            <i class="ph ph-upload-simple"></i> Import Excel
                        </button>
                        <button id="add-student-btn" class="btn btn-primary">
                            <i class="ph ph-plus"></i> Tambah Siswa
                        </button>
                    </div>
                </div>
                <div id="students-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>NIS</th>
                                <th>Nama Lengkap</th>
                                <th>Kelas</th>
                                <th>Jurusan</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="students-tbody">
                            <tr><td colspan="6" class="text-center">Memuat data...</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="pagination-controls" style="padding: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.5rem;">
                    <span class="text-muted" style="font-size: 0.875rem;">Menampilkan semua data</span>
                </div>
            </div>
        `;

        // Event Listeners
        document.getElementById('btn-import').addEventListener('click', () => document.getElementById('import-excel').click());
        document.getElementById('import-excel').addEventListener('change', (e) => this.handleImport(e));
        document.getElementById('add-student-btn').addEventListener('click', () => this.openForm());
        document.getElementById('student-search').addEventListener('input', this.debounce(this.renderTable.bind(this), 300));
        document.getElementById('class-filter').addEventListener('change', this.renderTable.bind(this));
        document.getElementById('major-filter').addEventListener('change', this.renderTable.bind(this));

        // Initial Render
        await this.renderTable();
    },

    renderTable: async function () {
        const tbody = document.getElementById('students-tbody');
        const search = document.getElementById('student-search').value.toLowerCase();
        const filterClass = document.getElementById('class-filter').value;
        const filterMajor = document.getElementById('major-filter').value;

        try {
            let students = await window.db.getAll('students');

            // Filter
            students = students.filter(s => {
                const matchSearch = s.name.toLowerCase().includes(search) || s.nis.toString().includes(search);
                const matchClass = filterClass ? s.class === filterClass : true;
                const matchMajor = filterMajor ? s.major === filterMajor : true;
                return matchSearch && matchClass && matchMajor;
            });

            tbody.innerHTML = '';
            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">Tidak ada data siswa.</td></tr>';
                return;
            }

            students.forEach(student => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${student.nis}</td>
                    <td>${student.name}</td>
                    <td>Kelas ${student.class}</td>
                    <td>${student.major || '-'}</td>
                    <td><span class="badge ${student.status === 'Aktif' ? 'badge-success' : 'badge-warning'}">${student.status}</span></td>
                    <td>
                        <button class="icon-btn edit-btn" data-id="${student.id}"><i class="ph ph-pencil"></i></button>
                        <button class="icon-btn delete-btn" data-id="${student.id}"><i class="ph ph-trash" style="color: var(--danger);"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Attach Button Events
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => this.openForm(Number(btn.dataset.id)));
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => this.deleteStudent(Number(btn.dataset.id)));
            });

        } catch (error) {
            console.error('Error fetching students:', error);
            tbody.innerHTML = '<tr><td colspan="6" class="text-danger">Gagal memuat data.</td></tr>';
        }
    },

    openForm: async function (id = null) {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalOverlay = document.getElementById('modal-overlay');

        // Fetch classes and majors dynamically
        let classList = [];
        let majorList = [];
        try {
            classList = await window.db.getAll('classes');
            classList.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

            majorList = await window.db.getAll('majors');
            majorList.sort((a, b) => a.name.localeCompare(b.name));
        } catch (e) {
            classList = [{ name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, { name: '5' }, { name: '6' }];
            majorList = [{ name: 'Umum' }];
        }

        // Reset Logic inside modal
        let student = {
            nis: '',
            name: '',
            gender: 'L',
            birthDate: '',
            class: classList.length > 0 ? classList[0].name : '1',
            major: majorList.length > 0 ? majorList[0].name : 'Umum',
            entryYear: new Date().getFullYear(),
            status: 'Aktif'
        };

        if (id) {
            modalTitle.textContent = 'Edit Siswa';
            student = await window.db.get('students', id);
        } else {
            modalTitle.textContent = 'Tambah Siswa';
        }

        modalBody.innerHTML = `
            <form id="student-form">
                <div class="form-group">
                    <label>NIS / NISN</label>
                    <input type="text" id="nis" class="form-control" value="${student.nis}" required>
                </div>
                <div class="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" id="name" class="form-control" value="${student.name}" required>
                </div>
                <div class="form-group">
                    <label>Jenis Kelamin</label>
                    <select id="gender" class="form-control">
                        <option value="L" ${student.gender === 'L' ? 'selected' : ''}>Laki-laki</option>
                        <option value="P" ${student.gender === 'P' ? 'selected' : ''}>Perempuan</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Tanggal Lahir</label>
                    <input type="date" id="birthDate" class="form-control" value="${student.birthDate}">
                </div>
                <div class="form-group">
                    <label>Kelas</label>
                    <select id="class" class="form-control">
                        ${classList.map(c => `<option value="${c.name}" ${student.class == c.name ? 'selected' : ''}>Kelas ${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Jurusan</label>
                    <select id="major" class="form-control">
                        ${majorList.map(m => `<option value="${m.name}" ${student.major == m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tahun Masuk</label>
                    <input type="number" id="entryYear" class="form-control" value="${student.entryYear}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="status" class="form-control">
                        <option value="Aktif" ${student.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                        <option value="Lulus" ${student.status === 'Lulus' ? 'selected' : ''}>Lulus</option>
                        <option value="Pindah" ${student.status === 'Pindah' ? 'selected' : ''}>Pindah</option>
                        <option value="Keluar" ${student.status === 'Keluar' ? 'selected' : ''}>Keluar</option>
                    </select>
                </div>
            </form>
        `;

        modalOverlay.classList.remove('hidden');

        // Handle Save
        const saveBtn = document.getElementById('modal-save');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', async () => {
            const formData = {
                nis: document.getElementById('nis').value,
                name: document.getElementById('name').value,
                gender: document.getElementById('gender').value,
                birthDate: document.getElementById('birthDate').value,
                class: document.getElementById('class').value,
                major: document.getElementById('major').value,
                entryYear: document.getElementById('entryYear').value,
                status: document.getElementById('status').value
            };

            if (!formData.nis || !formData.name) {
                alert('NIS dan Nama wajib diisi!');
                return;
            }

            try {
                if (id) {
                    await window.db.update('students', { ...formData, id });
                    app.showToast('Data siswa berhasil diperbarui');
                } else {
                    await window.db.add('students', formData);
                    app.showToast('Siswa baru berhasil ditambahkan');
                }
                modalOverlay.classList.add('hidden');
                this.renderTable();
            } catch (error) {
                console.error(error);
                alert('Gagal menyimpan data. Pastikan NIS unik.');
            }
        });
    },

    deleteStudent: async function (id) {
        if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
            try {
                await window.db.delete('students', id);
                app.showToast('Data siswa dihapus');
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
                    // Map Excel columns to DB fields
                    // Assumes columns: NIS, Nama, Kelas, Jurusan, Jenis Kelamin, Status
                    const student = {
                        nis: row['NIS'] || row['nis'],
                        name: row['Nama'] || row['Nama Lengkap'] || row['nama'],
                        class: (row['Kelas'] || row['kelas'] || '1').toString(),
                        major: row['Jurusan'] || row['jurusan'] || 'Umum',
                        gender: (row['Jenis Kelamin'] || row['Gender'] || 'L').toUpperCase().charAt(0),
                        status: row['Status'] || 'Aktif',
                        birthDate: '', // Optional defaults
                        entryYear: new Date().getFullYear()
                    };

                    if (!student.nis || !student.name) {
                        console.warn('Skipping invalid row:', row);
                        failCount++;
                        continue;
                    }

                    try {
                        // Check if NIS already exists (optional, db might throw error due to unique constraint)
                        // But let's rely on DB constraint for now or try-catch
                        await window.db.add('students', student);
                        successCount++;
                    } catch (err) {
                        console.error('Failed to import student:', student.name, err);
                        failCount++;
                    }
                }

                alert(`Import selesai!\nBerhasil: ${successCount}\nGagal: ${failCount}`);
                this.renderTable();
                event.target.value = ''; // Reset file input

            } catch (error) {
                console.error('Error parsing Excel:', error);
                alert('Gagal memproses file Excel. Pastikan format benar.');
            }
        };
        reader.readAsArrayBuffer(file);
    }
};
