/**
 * Main Application Logic
 */

const app = {
    currentModule: null,

    init: async () => {
        try {
            // Initialize Database
            await window.db.init();

            // Setup Navigation
            app.setupNavigation();

            // Setup Mobile Toggle
            app.setupMobileSidebar();

            // Setup Desktop Sidebar (Minimize)
            app.setupDesktopSidebar();

            // Load Default Module (Dashboard)
            app.loadModule('dashboard');

            // Set Date
            document.getElementById('current-date').textContent = new Date().toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });

            // Load Config (School Name)
            const schoolName = localStorage.getItem('schoolName');
            if (schoolName) {
                const schoolNameEl = document.querySelector('.logo-text h1');
                if (schoolNameEl) schoolNameEl.textContent = schoolName;
                document.title = schoolName;
            }

            // Setup User Actions (Logout)
            app.setupUserActions();

        } catch (error) {
            console.error("Initialization failed:", error);
            app.showToast("Gagal memuat aplikasi assets database.", "error");
        }
    },

    setupUserActions: () => {
        const avatar = document.querySelector('.avatar');
        if (avatar) {
            avatar.style.cursor = 'pointer';
            avatar.title = 'Logout';
            avatar.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin keluar?')) {
                    Auth.logout();
                }
            });
        }
    },

    setupNavigation: () => {
        const navLinks = document.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const moduleName = link.dataset.module;

                // Update Active State
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Load Module
                app.loadModule(moduleName);

                // Close sidebar on mobile if open
                if (window.innerWidth <= 768) {
                    document.querySelector('.sidebar').classList.remove('open');
                }
            });
        });
    },

    setupMobileSidebar: () => {
        const toggle = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        const appContainer = document.querySelector('.app-container');

        // Check local storage for desktop minimize state
        const isMinimized = localStorage.getItem('sidebarMinimized') === 'true';
        if (isMinimized && window.innerWidth > 768) {
            sidebar.classList.add('minimized');
            appContainer.classList.add('sidebar-minimized');
        }

        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing immediately on mobile
                if (window.innerWidth <= 768) {
                    // Mobile: Toggle open/close
                    sidebar.classList.toggle('open');
                } else {
                    // Desktop: Toggle minimize
                    sidebar.classList.toggle('minimized');
                    appContainer.classList.toggle('sidebar-minimized');

                    // Save state
                    const minimized = sidebar.classList.contains('minimized');
                    localStorage.setItem('sidebarMinimized', minimized);
                }
            });
        }

        // Close using overlay or x button for Modals
        const modalOverlay = document.getElementById('modal-overlay');
        const modalCloseBtn = document.getElementById('modal-close');
        const modalCancelBtn = document.getElementById('modal-cancel');

        const closeModal = () => {
            modalOverlay.classList.add('hidden');
        };

        if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

        // Close when clicking outside sidebar (Mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                !sidebar.contains(e.target) &&
                toggle && !toggle.contains(e.target) &&
                sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    },

    setupDesktopSidebar: () => {
        // Method kept for consistency with init() but functionality is merged above
    },

    loadModule: async (moduleName) => {
        const contentArea = document.getElementById('app-content');
        const pageTitle = document.getElementById('page-title');

        // Show loading
        contentArea.innerHTML = '<div class="loading-spinner">Loading...</div>';

        try {
            const module = window.modules[moduleName];

            if (module && module.load) {
                // Determine Title
                const titles = {
                    'dashboard': 'Dashboard',
                    'students': 'Data Siswa',
                    'teachers': 'Data Guru',
                    'inventory': 'Inventaris Sekolah',
                    'mail-in': 'Surat Masuk',
                    'mail-out': 'Surat Keluar',
                    'documents': 'Arsip Dokumen',
                    'grades': 'Data Induk Siswa & Nilai',
                    'reports': 'Laporan & Rekap',
                    'settings': 'Pengaturan'
                };

                pageTitle.textContent = titles[moduleName] || 'Aplikasi Sekolah';
                await module.load(contentArea);
                app.currentModule = moduleName;
            } else {
                throw new Error(`Module ${moduleName} not found or failed to load.`);
            }

        } catch (error) {
            console.error(`Error loading module ${moduleName}:`, error);
            contentArea.innerHTML = `<div style="text-align: center; padding: 2rem;">
                <h3>Modul Belum Tersedia</h3>
                <p>Fitur untuk <b>${moduleName}</b> sedang dalam pengembangan.</p>
                <p class="text-muted">${error.message}</p>
            </div>`;
        }
    },

    // Temporary Dashboard Loader (Will move to modules/dashboard.js later)
    loadDashboard: async (container) => {
        // Fetch counts
        const studentCount = await window.db.count('students');
        const teacherCount = await window.db.count('teachers');
        const inventoryCount = await window.db.count('inventory');
        const mailInCount = await window.db.count('mail_in');

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card card-blue">
                    <div class="stat-icon"><i class="ph ph-student"></i></div>
                    <div class="stat-info">
                        <h3>${studentCount}</h3>
                        <p>Total Siswa</p>
                    </div>
                </div>
                <div class="stat-card card-purple">
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
                        <p>Item Inventaris</p>
                    </div>
                </div>
                <div class="stat-card card-green">
                    <div class="stat-icon"><i class="ph ph-envelope"></i></div>
                    <div class="stat-info">
                        <h3>${mailInCount}</h3>
                        <p>Surat Masuk</p>
                    </div>
                </div>
            </div>
            
            <div class="recent-activity">
                <h3>Aktivitas Terbaru</h3>
                <p class="text-muted">Belum ada aktivitas tercatat.</p>
            </div>
        `;
    },

    showToast: (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="ph ${type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Start App
document.addEventListener('DOMContentLoaded', app.init);
