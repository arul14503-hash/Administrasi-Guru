/**
 * Grades Module
 * "Data Induk Siswa & Nilai"
 */
window.modules.grades = {
    load: async function (container) {
        container.innerHTML = `
            <div class="table-container">
                <div class="table-actions">
                    <div class="search-bar">
                        <input type="text" id="grades-search" class="search-input" placeholder="Cari siswa...">
                    </div>
                    <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                        <input type="file" id="import-grade-excel" accept=".xlsx, .xls" style="display: none;">
                        <button id="btn-import-grade" class="btn btn-secondary" title="Import Nilai dari Excel">
                            <i class="ph ph-upload-simple"></i> Import Excel
                        </button>
                        <button id="add-grade-btn" class="btn btn-primary">
                            <i class="ph ph-plus"></i> Tambah Nilai
                        </button>
                    </div>
                </div>
                <div id="grades-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>NIS</th>
                                <th>Nama Siswa</th>
                                <th>Kelas Saat Ini</th>
                                <th>Jurusan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="grades-tbody">
                            <tr><td colspan="4" class="text-center">Memuat data...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('grades-search').addEventListener('input', this.debounce(this.renderTable.bind(this), 300));
        document.getElementById('add-grade-btn').addEventListener('click', () => this.openSelectStudentModal());

        document.getElementById('btn-import-grade').addEventListener('click', () => document.getElementById('import-grade-excel').click());
        document.getElementById('import-grade-excel').addEventListener('change', (e) => this.handleImport(e));

        await this.renderTable();
    },

    renderTable: async function () {
        const tbody = document.getElementById('grades-tbody');
        const search = document.getElementById('grades-search').value.toLowerCase();

        try {
            let students = await window.db.getAll('students');

            const filtered = students.filter(s =>
                s.name.toLowerCase().includes(search) ||
                s.nis.toString().includes(search)
            );

            tbody.innerHTML = '';
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Tidak ada data siswa.</td></tr>';
                return;
            }

            filtered.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${s.nis}</td>
                    <td>${s.name}</td>
                    <td>Kelas ${s.class}</td>
                    <td>${s.major || '-'}</td>
                    <td>
                        <button class="btn btn-primary btn-sm manage-grades-btn" data-id="${s.id}" data-name="${s.name}">
                            <i class="ph ph-exam"></i> Kelola Nilai
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.querySelectorAll('.manage-grades-btn').forEach(btn =>
                btn.addEventListener('click', () => this.openGradesModal(Number(btn.dataset.id), btn.dataset.name))
            );

        } catch (error) {
            console.error(error);
            tbody.innerHTML = '<tr><td colspan="4" class="text-danger">Gagal memuat data.</td></tr>';
        }
    },

    openSelectStudentModal: async function () {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalOverlay = document.getElementById('modal-overlay');
        const modalFooter = document.getElementById('modal-footer'); // We'll assume default footer is hidden/managed

        modalTitle.textContent = 'Pilih Siswa untuk Kelola Nilai';
        const students = await window.db.getAll('students');

        if (students.length === 0) {
            alert('Belum ada data siswa. Silakan tambah siswa terlebih dahulu.');
            return;
        }

        modalBody.innerHTML = `
            <div class="form-group">
                <label>Pilih Siswa</label>
                <select id="select-student-grade" class="form-control" style="width: 100%;">
                    <option value="">-- Pilih Siswa --</option>
                    ${students.map(s => `<option value="${s.id}" data-name="${s.name}">${s.nis} - ${s.name} (Kelas ${s.class} - ${s.major || 'Umum'})</option>`).join('')}
                </select>
            </div>
            <div style="margin-top: 1rem; text-align: right;">
                 <button id="btn-continue-grade" class="btn btn-primary">Lanjut</button>
            </div>
        `;

        // Hide default footer since we proceed to next modal
        modalFooter.style.display = 'none';
        modalOverlay.classList.remove('hidden');

        document.getElementById('btn-continue-grade').addEventListener('click', () => {
            const select = document.getElementById('select-student-grade');
            const studentId = select.value;

            if (!studentId) {
                alert('Silakan pilih siswa terlebih dahulu');
                return;
            }

            const studentName = select.options[select.selectedIndex].dataset.name;
            this.openGradesModal(Number(studentId), studentName);
        });

        // Close logic needs to restore footer if cancelled here
        const closeBtn = document.getElementById('modal-close');
        // We know openGradesModal also overrides close behavior, so it's tricky.
        // Let's just ensure if we close this specific modal state, we hide overlay.
    },

    openGradesModal: async function (studentId, studentName) {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalOverlay = document.getElementById('modal-overlay');
        const modalFooter = document.getElementById('modal-footer');

        modalTitle.textContent = `Nilai: ${studentName}`;

        // Hide default footer, we will use custom actions inside
        modalFooter.style.display = 'none';

        // Fetch existing grades
        const allGrades = await window.db.getAll('grades');
        const studentGrades = allGrades.filter(g => g.studentId === studentId);

        // Fetch classes from DB
        let classList = [];
        try {
            classList = await window.db.getAll('classes');
            classList.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        } catch (e) {
            console.error(e);
            classList = [{ name: '1' }, { name: '2' }, { name: '3' }, { name: '4' }, { name: '5' }, { name: '6' }];
        }

        // Fetch subjects from DB
        let subjectList = [];
        try {
            const subs = await window.db.getAll('subjects');
            subjectList = subs.map(s => s.name).sort();
        } catch (e) {
            console.error(e);
        }

        // Default subjects fallback if DB is empty for some reason (though we seeded it)
        if (subjectList.length === 0) {
            subjectList = [
                "Pendidikan Agama", "PPKn", "Bahasa Indonesia", "Matematika",
                "IPA", "IPS", "SBdP", "PJOK"
            ];
        }

        modalBody.innerHTML = `
            <div class="tabs" style="display:flex; gap:0.5rem; margin-bottom:1rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem; overflow-x:auto;">
                ${classList.map((c, index) => `
                    <button class="tab-btn ${index === 0 ? 'active' : ''}" data-level="${c.name}" 
                    style="padding:0.5rem 1rem; border:none; background:none; cursor:pointer; border-radius:0.375rem; font-weight:500;">
                        Kelas ${c.name}
                    </button>
                `).join('')}
            </div>
            
            <div id="grades-content">
                <!-- Content loaded via JS -->
            </div>
        `;

        // Render Tab Content
        const renderTab = (level) => {
            const gradeRecord = studentGrades.find(g => g.classLevel == level) || { subjects: [] };
            // Merge with defaults
            const subjects = subjectList.map(subjName => {
                const existing = gradeRecord.subjects.find(s => s.name === subjName);
                return existing || { name: subjName, score: 0, predicate: '-' };
            });

            const content = document.getElementById('grades-content');
            content.innerHTML = `
                <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <h4>Nilai Kelas ${level}</h4>
                    <button id="save-grades-btn" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Nilai Kelas ${level}</button>
                </div>
                <table class="data-table" style="font-size: 0.9rem;">
                    <thead>
                        <tr>
                            <th>Mata Pelajaran</th>
                            <th style="width:100px;">Nilai</th>
                            <th style="width:100px;">Predikat</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjects.map((subj, index) => `
                            <tr>
                                <td>${subj.name}</td>
                                <td><input type="number" class="form-control score-input" data-index="${index}" value="${subj.score}" min="0" max="100"></td>
                                <td><input type="text" class="form-control pred-input" data-index="${index}" value="${subj.predicate}" maxlength="2"></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Highlight active tab
            document.querySelectorAll('.tab-btn').forEach(btn => {
                if (btn.dataset.level == level) {
                    btn.style.backgroundColor = '#ecfdf5';
                    btn.style.color = '#059669';
                } else {
                    btn.style.backgroundColor = 'transparent';
                    btn.style.color = '#64748b';
                }
            });

            // Save Handlers
            document.getElementById('save-grades-btn').addEventListener('click', async () => {
                const scoreInputs = document.querySelectorAll('.score-input');
                const predInputs = document.querySelectorAll('.pred-input');

                const newSubjects = [];
                scoreInputs.forEach((input, i) => {
                    newSubjects.push({
                        name: subjects[i].name,
                        score: Number(input.value),
                        predicate: predInputs[i].value
                    });
                });

                const dataToSave = {
                    studentId,
                    classLevel: level,
                    subjects: newSubjects
                };

                // If ID exists, update. If not, add new but check if really new.
                const existingRecord = studentGrades.find(g => g.classLevel == level);

                try {
                    if (existingRecord) {
                        await window.db.update('grades', { ...dataToSave, id: existingRecord.id });
                    } else {
                        await window.db.add('grades', dataToSave);
                    }
                    app.showToast(`Nilai kelas ${level} tersimpan`);

                    // Update cache
                    const updatedAll = await window.db.getAll('grades');
                    const updatedStudent = updatedAll.filter(g => g.studentId === studentId);
                    studentGrades.splice(0, studentGrades.length, ...updatedStudent);

                } catch (err) {
                    console.error(err);
                    app.showToast('Gagal menyimpan nilai', 'error');
                }
            });
        };

        if (classList.length > 0) {
            renderTab(classList[0].name);
        }

        // Tab Click Event
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => renderTab(btn.dataset.level)); // level comes as string "1A" etc
        });

        modalOverlay.classList.remove('hidden');

        // Restore footer when closed
        const restoreFooter = () => { modalFooter.style.display = 'flex'; };
        const closeBtn = document.getElementById('modal-close');
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', () => {
            modalOverlay.classList.add('hidden');
            restoreFooter();
        });
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

                const students = await window.db.getAll('students');
                const allGrades = await window.db.getAll('grades');

                let successCount = 0;
                let failCount = 0;

                for (const row of jsonData) {
                    const nis = row['NIS'] || row['nis'];
                    const classLevel = (row['Kelas'] || row['kelas'] || '').toString();

                    if (!nis || !classLevel) {
                        failCount++;
                        continue;
                    }

                    // Find student
                    const student = students.find(s => s.nis.toString() === nis.toString());
                    if (!student) {
                        console.warn(`Student not found for NIS: ${nis}`);
                        failCount++;
                        continue;
                    }

                    // Map subjects
                    // Filter out non-subject columns
                    const subjects = [];
                    Object.keys(row).forEach(key => {
                        const lowKey = key.toLowerCase();
                        if (!['nis', 'nama', 'kelas', 'jurusan', 'status', 'nama lengkap'].includes(lowKey)) {
                            subjects.push({
                                name: key,
                                score: Number(row[key]) || 0,
                                predicate: this.calculatePredicate(Number(row[key]) || 0)
                            });
                        }
                    });

                    if (subjects.length === 0) {
                        failCount++;
                        continue;
                    }

                    const dataToSave = {
                        studentId: student.id,
                        classLevel: classLevel,
                        subjects: subjects
                    };

                    const existingRecord = allGrades.find(g => g.studentId === student.id && g.classLevel == classLevel);

                    try {
                        if (existingRecord) {
                            await window.db.update('grades', { ...dataToSave, id: existingRecord.id });
                        } else {
                            await window.db.add('grades', dataToSave);
                        }
                        successCount++;
                    } catch (err) {
                        console.error('Failed to save grade:', err);
                        failCount++;
                    }
                }

                alert(`Import Nilai Selesai!\nBerhasil: ${successCount}\nGagal: ${failCount}`);
                this.renderTable();
                event.target.value = '';

            } catch (error) {
                console.error('Error parsing Excel:', error);
                alert('Gagal memproses file Excel.');
            }
        };
        reader.readAsArrayBuffer(file);
    },

    calculatePredicate: function (score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'E';
    }
};
