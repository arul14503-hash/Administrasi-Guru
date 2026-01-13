window.modules.dashboard = {
    load: async function (container) {
        try {
            const studentCount = await window.db.count('students');
            const teacherCount = await window.db.count('teachers');
            const inventoryCount = await window.db.count('inventory');
            const mailInCount = await window.db.count('mail_in');
            const mailOutCount = await window.db.count('mail_out');

            container.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card card-purple">
                        <div class="stat-icon"><i class="ph ph-student"></i></div>
                        <div class="stat-info">
                            <h3>${studentCount}</h3>
                            <p>Total Siswa</p>
                        </div>
                    </div>
                    <div class="stat-card card-green">
                        <div class="stat-icon"><i class="ph ph-chalkboard-teacher"></i></div>
                        <div class="stat-info">
                            <h3>${teacherCount}</h3>
                            <p>Total Guru</p>
                        </div>
                    </div>
                    <div class="stat-card card-orange">
                        <div class="stat-icon"><i class="ph ph-package"></i></div>
                        <div class="stat-info">
                            <h3>${inventoryCount}</h3>
                            <p>Inventaris</p>
                        </div>
                    </div>
                    <div class="stat-card card-blue">
                        <div class="stat-icon"><i class="ph ph-tray"></i></div>
                        <div class="stat-info">
                            <h3>${mailInCount}</h3>
                            <p>Surat Masuk</p>
                        </div>
                    </div>
                    <div class="stat-card card-teal">
                        <div class="stat-icon"><i class="ph ph-paper-plane-right"></i></div>
                        <div class="stat-info">
                            <h3>${mailOutCount}</h3>
                            <p>Surat Keluar</p>
                        </div>
                    </div>
                </div>
                
                <div class="recent-activity">
                    <h3>Aktivitas Terbaru</h3>
                    <p class="text-muted">Selamat datang di Aplikasi Administrasi Sekolah.</p>
                </div>
            `;
        } catch (error) {
            console.error('Error loading dashboard:', error);
            container.innerHTML = '<p class="text-danger">Gagal memuat dashboard.</p>';
        }
    }
};
