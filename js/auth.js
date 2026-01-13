/**
 * Authentication Module
 */

const Auth = {
    // Default credentials (can be enhanced later to use indexedDB)
    credentials: {
        username: 'admin',
        password: 'admin123'
    },

    isLoggedIn: () => {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    login: (username, password) => {
        // Simple validation for now
        if (username === Auth.credentials.username && password === Auth.credentials.password) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userSession', JSON.stringify({
                username: username,
                loginTime: new Date().toISOString()
            }));
            return true;
        }
        return false;
    },

    logout: () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
    },

    checkAccess: () => {
        if (!Auth.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    }
};

// Export to window
window.Auth = Auth;
