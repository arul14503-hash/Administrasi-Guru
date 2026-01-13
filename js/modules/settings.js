/**
 * Settings Module
 */
window.modules.settings = {
    load: async function (container) {
        container.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <!-- Tabs -->
                <div class="settings-tabs">
                    <button class="tab-link active" data-tab="general">Umum</button>
                    <button class="tab-link" data-tab="classes">Data Kelas</button>
                    <button class="tab-link" data-tab="subjects">Data Mata Pelajaran</button>
                    <button class="tab-link" data-tab="majors">Data Jurusan</button>
                    <button class="tab-link" data-tab="backup">Backup & Reset</button>
                </div>

                <!-- Tab Content: General -->
                <div id="tab-general" class="tab-content">
                    <div class="stat-card" style="display:block;">
                        <h3 style="margin-bottom: 1rem;">Identitas Sekolah</h3>
                        <div class="form-group">
                            <label>Nama Sekolah</label>
                            <input type="text" id="school-name" class="form-control" placeholder="Contoh: SD Negeri 1 Jakarta">
                        </div>
                        <div class="form-group">
                            <label>Tahun Ajaran Aktif</label>
                            <input type="text" id="school-year" class="form-control" placeholder="Contoh: 2025/2026">
                        </div>
                        <button id="save-config-btn" class="btn btn-primary">Simpan Pengaturan</button>
                    </div>
                </div>

                <!-- Tab Content: Classes -->
                <div id="tab-classes" class="tab-content hidden">
                    <div class="stat-card" style="display:block;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                            <h3>Daftar Kelas</h3>
                            <button id="add-class-btn" class="btn btn-primary btn-sm"><i class="ph ph-plus"></i> Tambah Kelas</button>
                        </div>
                        <div id="classes-list" style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                            <!-- Dynamic Content -->
                        </div>
                    </div>
                </div>

                <!-- Tab Content: Subjects -->
                <div id="tab-subjects" class="tab-content hidden">
                    <div class="stat-card" style="display:block;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                            <h3>Daftar Mata Pelajaran</h3>
                            <button id="add-subject-btn" class="btn btn-primary btn-sm"><i class="ph ph-plus"></i> Tambah Mapel</button>
                        </div>
                        <ul id="subjects-list" style="list-style:none;">
                            <!-- Dynamic Content -->
                        </ul>
                    </div>
                </div>

                <!-- Tab Content: Majors -->
                <div id="tab-majors" class="tab-content hidden">
                    <div class="stat-card" style="display:block;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                            <h3>Daftar Jurusan</h3>
                            <button id="add-major-btn" class="btn btn-primary btn-sm"><i class="ph ph-plus"></i> Tambah Jurusan</button>
                        </div>
                        <div id="majors-list" style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                            <!-- Dynamic Content -->
                        </div>
                    </div>
                </div>

                <!-- Tab Content: Backup -->
                <div id="tab-backup" class="tab-content hidden">
                    <div class="stat-card" style="display:block; margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1rem;">Backup & Restore Data</h3>
                        <p class="text-muted" style="margin-bottom: 1.5rem;">
                            Amankan data aplikasi secara berkala.
                        </p>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button id="backup-btn" class="btn btn-primary">
                                <i class="ph ph-download-simple"></i> Download Backup
                            </button>
                            <button id="trigger-restore-btn" class="btn btn-secondary">
                                <i class="ph ph-upload-simple"></i> Restore Data
                            </button>
                            <input type="file" id="restore-file" accept=".json" style="display: none;">
                        </div>
                    </div>

                    <div class="stat-card" style="display:block; border-color: var(--danger);">
                        <h3 style="margin-bottom: 1rem; color: var(--danger);">Zona Bahaya</h3>
                        <p class="text-muted" style="margin-bottom: 1rem;">
                            Tindakan ini akan menghapus SELURUH data aplikasi.
                        </p>
                        <button id="reset-btn" class="btn btn-danger">
                            <i class="ph ph-warning"></i> Reset Semua Data
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Tab Logic
        const tabBtns = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => {
                    b.classList.remove('active');
                    // Styles are handled by CSS class now
                });
                tabContents.forEach(c => c.classList.add('hidden'));

                btn.classList.add('active');
                document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');

                // Reload data if needed
                if (btn.dataset.tab === 'classes') this.loadClasses();
                if (btn.dataset.tab === 'subjects') this.loadSubjects();
                if (btn.dataset.tab === 'majors') this.loadMajors();
            });
        });

        // Initialize General Settings
        this.initGeneralSettings();
        this.initBackupSettings();
        this.initClassSettings();
        this.initSubjectSettings();
        this.initMajorSettings();
    },

    initGeneralSettings: function () {
        const savedName = localStorage.getItem('schoolName') || 'AdminSekolah';
        const savedYear = localStorage.getItem('schoolYear') || '';
        document.getElementById('school-name').value = savedName;
        document.getElementById('school-year').value = savedYear;

        document.getElementById('save-config-btn').addEventListener('click', () => {
            const name = document.getElementById('school-name').value;
            const year = document.getElementById('school-year').value;

            if (name) {
                localStorage.setItem('schoolName', name);
                localStorage.setItem('schoolYear', year);
                document.querySelector('.sidebar-header h1').textContent = name;
                document.title = name;
                app.showToast('Pengaturan disimpan');
            } else {
                alert('Nama sekolah tidak boleh kosong');
            }
        });
    },

    initBackupSettings: function () {
        document.getElementById('backup-btn').addEventListener('click', async () => {
            try {
                const data = {
                    students: await window.db.getAll('students'),
                    teachers: await window.db.getAll('teachers'),
                    inventory: await window.db.getAll('inventory'),
                    mail_in: await window.db.getAll('mail_in'),
                    mail_out: await window.db.getAll('mail_out'),
                    documents: await window.db.getAll('documents'),
                    grades: await window.db.getAll('grades'),
                    classes: await window.db.getAll('classes'),
                    subjects: await window.db.getAll('subjects'),
                    majors: await window.db.getAll('majors'),
                    schoolName: localStorage.getItem('schoolName'),
                    schoolYear: localStorage.getItem('schoolYear'),
                    backupDate: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup_sekolah_${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                app.showToast('Backup berhasil didownload');
            } catch (error) {
                console.error(error);
                app.showToast('Gagal backup', 'error');
            }
        });

        const restoreInput = document.getElementById('restore-file');
        document.getElementById('trigger-restore-btn').addEventListener('click', () => restoreInput.click());

        restoreInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm(`Restore data?`)) {
                        const stores = ['students', 'teachers', 'inventory', 'mail_in', 'mail_out', 'documents', 'grades', 'classes', 'subjects', 'majors'];
                        for (const store of stores) {
                            if (data[store]) {
                                for (const item of data[store]) {
                                    await window.db.update(store, item);
                                }
                            }
                        }
                        if (data.schoolName) localStorage.setItem('schoolName', data.schoolName);
                        if (data.schoolYear) localStorage.setItem('schoolYear', data.schoolYear);
                        alert('Restore berhasil.');
                        location.reload();
                    }
                } catch (error) {
                    console.error(error);
                    alert('Gagal restore.');
                }
            };
            reader.readAsText(file);
        });

        document.getElementById('reset-btn').addEventListener('click', async () => {
            const code = Math.floor(1000 + Math.random() * 9000);
            const input = prompt(`Ketik kode ${code} untuk reset data:`);
            if (input == code) {
                await window.db.clear(); // This might need implementation in db.js to iterate all stores
                // Since db.clear() was generic for one store, we need to clear all manually or upgrade db.js
                // For now let's assume specific clears or user accepts partial. 
                // Wait, db.js had clear(storeName). We need to loop.
                const stores = ['students', 'teachers', 'inventory', 'mail_in', 'mail_out', 'documents', 'grades', 'classes', 'subjects', 'majors'];
                for (const s of stores) await window.db.clear(s);

                localStorage.clear();
                alert('Data direset.');
                location.reload();
            }
        });
    },

    // --- CLASSES MANAGEMENT ---
    initClassSettings: function () {
        document.getElementById('add-class-btn').addEventListener('click', async () => {
            const name = prompt("Masukkan Nama Kelas (misal: 1A, 7B):");
            if (name) {
                try {
                    await window.db.add('classes', { name });
                    this.loadClasses();
                    app.showToast('Kelas ditambahkan');
                } catch (e) {
                    alert('Gagal menambah kelas. Mungkin duplikat.');
                }
            }
        });
    },

    loadClasses: async function () {
        const container = document.getElementById('classes-list');
        try {
            const classes = await window.db.getAll('classes');
            // Sort alphanumerically
            classes.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

            container.innerHTML = classes.map(c => `
                <div class="badge" style="background:#f1f5f9; color:#334155; padding:0.5rem 1rem; display:flex; align-items:center; gap:0.5rem; font-size:1rem;">
                    ${c.name}
                    <i class="ph ph-x" style="cursor:pointer; color:var(--danger);" onclick="modules.settings.deleteClass(${c.id}, '${c.name}')"></i>
                </div>
            `).join('');
        } catch (e) { console.error(e); }
    },

    deleteClass: async function (id, name) {
        if (confirm(`Hapus Kelas ${name}?`)) {
            await window.db.delete('classes', id);
            this.loadClasses();
        }
    },

    // --- SUBJECTS MANAGEMENT ---
    initSubjectSettings: function () {
        document.getElementById('add-subject-btn').addEventListener('click', async () => {
            const name = prompt("Nama Mata Pelajaran:");
            if (name) {
                try {
                    await window.db.add('subjects', { name });
                    this.loadSubjects();
                    app.showToast('Mapel ditambahkan');
                } catch (e) {
                    alert('Gagal menambah mapel.');
                }
            }
        });
    },

    loadSubjects: async function () {
        const container = document.getElementById('subjects-list');
        try {
            const subs = await window.db.getAll('subjects');
            subs.sort((a, b) => a.name.localeCompare(b.name));

            container.innerHTML = subs.map(s => `
                <li style="padding:0.5rem; border-bottom:1px solid #eee; display:flex; justify-content:space-between;">
                    <span>${s.name}</span>
                    <button class="icon-btn" onclick="modules.settings.deleteSubject(${s.id}, '${s.name}')">
                        <i class="ph ph-trash" style="color:var(--danger);"></i>
                    </button>
                </li>
            `).join('');
        } catch (e) { console.error(e); }
    },

    deleteSubject: async function (id, name) {
        if (confirm(`Hapus Mapel ${name}?`)) {
            await window.db.delete('subjects', id);
            this.loadSubjects();
        }
    },

    // --- MAJORS MANAGEMENT ---
    initMajorSettings: function () {
        document.getElementById('add-major-btn').addEventListener('click', async () => {
            const name = prompt("Masukkan Nama Jurusan (misal: IPA, IPS, TKJ):");
            if (name) {
                try {
                    await window.db.add('majors', { name });
                    this.loadMajors();
                    app.showToast('Jurusan ditambahkan');
                } catch (e) {
                    alert('Gagal menambah jurusan. Mungkin duplikat.');
                }
            }
        });
    },

    loadMajors: async function () {
        const container = document.getElementById('majors-list');
        try {
            const majors = await window.db.getAll('majors');
            majors.sort((a, b) => a.name.localeCompare(b.name));

            container.innerHTML = majors.map(m => `
                <div class="badge" style="background:#f1f5f9; color:#334155; padding:0.5rem 1rem; display:flex; align-items:center; gap:0.5rem; font-size:1rem;">
                    ${m.name}
                    <i class="ph ph-x" style="cursor:pointer; color:var(--danger);" onclick="modules.settings.deleteMajor(${m.id}, '${m.name}')"></i>
                </div>
            `).join('');
        } catch (e) { console.error(e); }
    },

    deleteMajor: async function (id, name) {
        if (confirm(`Hapus Jurusan ${name}?`)) {
            await window.db.delete('majors', id);
            this.loadMajors();
        }
    }
};
