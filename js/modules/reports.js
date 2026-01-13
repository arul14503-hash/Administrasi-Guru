/**
 * Reports Module
 */
window.modules.reports = {
    load: async function (container) {
        container.innerHTML = `
            <div class="stat-card" style="display:block; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">Cetak Laporan & Rekap</h3>
                <p class="text-muted" style="margin-bottom: 1.5rem;">
                    Pilih jenis laporan yang ingin dicetak. Sistem akan membuka tab baru dengan tampilan siap cetak (Print Friendly).
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.6rem;">
                    <!-- Students -->
                    <div class="report-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; transition: all 0.2s; box-shadow: var(--shadow-sm);">
                        <i class="ph ph-student" style="font-size: 2.5rem; color: var(--primary);"></i>
                        <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); text-align: center;">Rekap Data Siswa</span>
                        <div style="display: flex; gap: 0.4rem; width: 100%; margin-top: auto;">
                            <button id="print-students" class="btn btn-outline-primary btn-sm" style="flex: 1;"><i class="ph ph-printer"></i> Cetak</button>
                            <button id="export-students" class="btn btn-outline-secondary btn-sm" style="flex: 1;"><i class="ph ph-file-xls"></i> Export</button>
                        </div>
                    </div>

                    <!-- Grades -->
                    <div class="report-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; transition: all 0.2s; box-shadow: var(--shadow-sm);">
                        <i class="ph ph-exam" style="font-size: 2.5rem; color: var(--primary);"></i>
                        <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); text-align: center;">Rekap Data Nilai</span>
                        <div style="display: flex; gap: 0.4rem; width: 100%; margin-top: auto;">
                            <button id="print-grades" class="btn btn-outline-primary btn-sm" style="flex: 1;"><i class="ph ph-printer"></i> Cetak</button>
                            <button id="export-grades" class="btn btn-outline-secondary btn-sm" style="flex: 1;"><i class="ph ph-file-xls"></i> Export</button>
                        </div>
                    </div>

                    <!-- Teachers -->
                    <div class="report-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; transition: all 0.2s; box-shadow: var(--shadow-sm);">
                        <i class="ph ph-chalkboard-teacher" style="font-size: 2.5rem; color: var(--primary);"></i>
                        <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); text-align: center;">Rekap Data Guru</span>
                        <div style="display: flex; gap: 0.4rem; width: 100%; margin-top: auto;">
                            <button id="print-teachers" class="btn btn-outline-primary btn-sm" style="flex: 1;"><i class="ph ph-printer"></i> Cetak</button>
                            <button id="export-teachers" class="btn btn-outline-secondary btn-sm" style="flex: 1;"><i class="ph ph-file-xls"></i> Export</button>
                        </div>
                    </div>

                    <!-- Inventory -->
                    <div class="report-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; transition: all 0.2s; box-shadow: var(--shadow-sm);">
                        <i class="ph ph-package" style="font-size: 2.5rem; color: var(--primary);"></i>
                        <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); text-align: center;">Rekap Inventaris</span>
                        <div style="display: flex; gap: 0.4rem; width: 100%; margin-top: auto;">
                            <button id="print-inventory" class="btn btn-outline-primary btn-sm" style="flex: 1;"><i class="ph ph-printer"></i> Cetak</button>
                            <button id="export-inventory" class="btn btn-outline-secondary btn-sm" style="flex: 1;"><i class="ph ph-file-xls"></i> Export</button>
                        </div>
                    </div>

                    <!-- Mail In -->
                    <div class="report-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; transition: all 0.2s; box-shadow: var(--shadow-sm);">
                        <i class="ph ph-tray" style="font-size: 2.5rem; color: var(--primary);"></i>
                        <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); text-align: center;">Laporan Surat Masuk</span>
                        <div style="display: flex; gap: 0.4rem; width: 100%; margin-top: auto;">
                            <button id="print-mail-in" class="btn btn-outline-primary btn-sm" style="flex: 1;"><i class="ph ph-printer"></i> Cetak</button>
                            <button id="export-mail-in" class="btn btn-outline-secondary btn-sm" style="flex: 1;"><i class="ph ph-file-xls"></i> Export</button>
                        </div>
                    </div>

                    <!-- Mail Out -->
                    <div class="report-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; transition: all 0.2s; box-shadow: var(--shadow-sm);">
                        <i class="ph ph-paper-plane-right" style="font-size: 2.5rem; color: var(--primary);"></i>
                        <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); text-align: center;">Laporan Surat Keluar</span>
                        <div style="display: flex; gap: 0.4rem; width: 100%; margin-top: auto;">
                            <button id="print-mail-out" class="btn btn-outline-primary btn-sm" style="flex: 1;"><i class="ph ph-printer"></i> Cetak</button>
                            <button id="export-mail-out" class="btn btn-outline-secondary btn-sm" style="flex: 1;"><i class="ph ph-file-xls"></i> Export</button>
                        </div>
                    </div>

                    <!-- Documents -->
                    <div class="report-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; transition: all 0.2s; box-shadow: var(--shadow-sm);">
                        <i class="ph ph-files" style="font-size: 2.5rem; color: var(--primary);"></i>
                        <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); text-align: center;">Rekap Arsip Dokumen</span>
                        <div style="display: flex; gap: 0.4rem; width: 100%; margin-top: auto;">
                            <button id="print-documents" class="btn btn-outline-primary btn-sm" style="flex: 1;"><i class="ph ph-printer"></i> Cetak</button>
                            <button id="export-documents" class="btn btn-outline-secondary btn-sm" style="flex: 1;"><i class="ph ph-file-xls"></i> Export</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('print-students').addEventListener('click', () => this.generateReport('students', 'print'));
        document.getElementById('export-students').addEventListener('click', () => this.generateReport('students', 'excel'));

        document.getElementById('print-inventory').addEventListener('click', () => this.generateReport('inventory', 'print'));
        document.getElementById('export-inventory').addEventListener('click', () => this.generateReport('inventory', 'excel'));

        document.getElementById('print-mail-in').addEventListener('click', () => this.generateReport('mail_in', 'print'));
        document.getElementById('export-mail-in').addEventListener('click', () => this.generateReport('mail_in', 'excel'));

        document.getElementById('print-mail-out').addEventListener('click', () => this.generateReport('mail_out', 'print'));
        document.getElementById('export-mail-out').addEventListener('click', () => this.generateReport('mail_out', 'excel'));

        document.getElementById('print-grades').addEventListener('click', () => this.generateReport('grades', 'print'));
        document.getElementById('export-grades').addEventListener('click', () => this.generateReport('grades', 'excel'));

        document.getElementById('print-teachers').addEventListener('click', () => this.generateReport('teachers', 'print'));
        document.getElementById('export-teachers').addEventListener('click', () => this.generateReport('teachers', 'excel'));

        document.getElementById('print-documents').addEventListener('click', () => this.generateReport('documents', 'print'));
        document.getElementById('export-documents').addEventListener('click', () => this.generateReport('documents', 'excel'));
    },

    generateReport: async function (type, action = 'print') {
        let data = [];
        let title = '';
        let headers = [];
        let rows = [];

        try {
            data = await window.db.getAll(type);
        } catch (e) {
            console.error(e);
            alert('Gagal mengambil data.');
            return;
        }

        switch (type) {
            case 'students':
                title = 'Laporan Data Siswa';
                headers = ['NIS', 'Nama Lengkap', 'L/P', 'Kelas', 'Tahun Masuk', 'Status'];
                // Sort by class then name
                data.sort((a, b) => (a.class - b.class) || a.name.localeCompare(b.name));
                rows = data.map(d => [d.nis, d.name, d.gender, d.class, d.entryYear, d.status]);
                break;

            case 'inventory':
                title = 'Laporan Inventaris Sekolah';
                headers = ['Kode', 'Nama Barang', 'Jumlah', 'Kondisi', 'Lokasi', 'Tahun'];
                rows = data.map(d => [d.code, d.name, d.amount, d.condition, d.location, d.year]);
                break;

            case 'mail_in':
                title = 'Laporan Surat Masuk';
                headers = ['No. Surat', 'Tanggal', 'Pengirim', 'Perihal'];
                rows = data.map(d => [d.number, d.date, d.sender, d.subject]);
                break;

            case 'mail_out':
                title = 'Laporan Surat Keluar';
                headers = ['No. Surat', 'Tanggal', 'Tujuan', 'Perihal'];
                rows = data.map(d => [d.number, d.date, d.target, d.subject]);
                break;

            case 'teachers':
                title = 'Laporan Data Guru';
                headers = ['NIP', 'Nama Lengkap', 'Pangkat/Gol', 'Mata Pelajaran', 'Jabatan', 'No HP', 'Status'];
                data.sort((a, b) => a.name.localeCompare(b.name));
                rows = data.map(d => [d.nip, d.name, d.rank || '-', d.subject || '-', d.role, d.phone || '-', d.status]);
                break;

            case 'documents':
                title = 'Rekap Arsip Dokumen';
                headers = ['Kategori', 'Keterangan / Judul', 'Link File', 'Tanggal Arsip'];
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
                rows = data.map(d => {
                    const link = d.fileLink ? `<a href="${d.fileLink}" target="_blank" style="color: blue; text-decoration: underline;">Buka File</a>` : '-';
                    return [d.category, d.description, link, d.date];
                });
                break;

            case 'grades':
                title = 'Rekap Data Nilai Siswa';
                headers = ['NIS', 'Nama Siswa', 'Kelas', 'Jurusan', 'Rata-Rata Nilai'];

                // We need to join grades with student info
                try {
                    const students = await window.db.getAll('students');
                    const grades = await window.db.getAll('grades'); // data is actually grades here if we passed 'grades'

                    // Map students to rows
                    rows = students.map(s => {
                        // Find all grades for this student
                        const sGrades = grades.filter(g => g.studentId === s.id);

                        // Calculate global average across all class levels recorded
                        let totalScore = 0;
                        let subjectCount = 0;

                        sGrades.forEach(g => {
                            if (g.subjects && Array.isArray(g.subjects)) {
                                g.subjects.forEach(subj => {
                                    totalScore += Number(subj.score) || 0;
                                    subjectCount++;
                                });
                            }
                        });

                        const average = subjectCount > 0 ? (totalScore / subjectCount).toFixed(2) : '0.00';

                        return [s.nis, s.name, s.class, s.major || '-', average];
                    });

                    // Sort by class, then major, then name
                    rows.sort((a, b) => {
                        // Compare class (numeric if possible)
                        const classA = parseInt(a[2]) || 0;
                        const classB = parseInt(b[2]) || 0;
                        if (classA !== classB) return classA - classB;
                        // Compare major
                        if (String(a[3]) !== String(b[3])) return String(a[3]).localeCompare(String(b[3]));
                        // Compare name
                        return String(a[1]).localeCompare(String(b[1]));
                    });

                } catch (e) {
                    console.error("Error building grades report", e);
                }
                break;
        }

        if (action === 'print') {
            this.openPrintWindow(title, headers, rows);
        } else {
            this.exportToExcel(title, headers, rows);
        }
    },

    exportToExcel: function (title, headers, rows) {
        try {
            // Prepare data for SheetJS
            const exportData = rows.map((row, index) => {
                const item = { 'No': index + 1 };
                headers.forEach((h, i) => {
                    // Clean HTML tags from cells if any (like in documents link)
                    let value = row[i];
                    if (typeof value === 'string' && value.includes('<a')) {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = value;
                        value = tmp.textContent || tmp.innerText || value;
                    }
                    item[h] = value;
                });
                return item;
            });

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

            const dateStr = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${dateStr}.xlsx`);
            app.showToast('Laporan berhasil dieksport ke Excel');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Gagal mengeksport laporan ke Excel.');
        }
    },

    openPrintWindow: function (title, headers, rows) {
        const win = window.open('', '_blank');
        const schoolName = localStorage.getItem('schoolName') || 'Nama Sekolah Belum Diset';
        const schoolYear = localStorage.getItem('schoolYear') || '';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: sans-serif; padding: 2rem; }
                    h1, h2, h3 { text-align: center; margin: 0; }
                    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
                    h2 { font-size: 1.2rem; font-weight: normal; margin-bottom: 0.25rem; color: #555; }
                    h3 { font-size: 1rem; font-weight: normal; margin-bottom: 1.5rem; color: #777; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                    th { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #ecfdf5; } /* Light green tint for Emerald theme */
                    .footer { display: flex; justify-content: space-between; margin-top: 3rem; }
                    .sign { text-align: center; width: 200px; }
                    .sign p { margin-top: 4rem; text-decoration: underline; font-weight: bold; }
                    @media print {
                        button { display: none; }
                        th { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <h1>${schoolName}</h1>
                <h2>${title}</h2>
                ${schoolYear ? `<h3>Tahun Ajaran: ${schoolYear}</h3>` : ''}
                <button onclick="window.print()" style="margin-bottom: 1rem; padding: 0.5rem 1rem; cursor: pointer;">Cetak Laporan</button>
                
                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px;">No</th>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((row, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                ${row.map(cell => `<td>${cell}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <div class="sign">
                        Mengetahui,<br>Kepala Sekolah
                        <p>( ........................... )</p>
                    </div>
                    <div class="sign">
                        <br>Petugas Administrasi
                        <p>( ........................... )</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        win.document.write(html);
        win.document.close();
    }
};
