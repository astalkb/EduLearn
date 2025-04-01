class AuthHandler {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.updateUI();
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async login(email, password) {
        try {
            const user = await ApiService.users.login(email, password);
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUI();
            return user;
        } catch (error) {
            throw new Error('Login failed: ' + error.message);
        }
    }

    async register(name, username, email, password) {
        try {
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(username)) {
                throw new Error('Username can only contain letters, numbers, and underscores');
            }

            const userData = { name, username, email, password };
            const user = await ApiService.users.register(userData);
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUI();
            return user;
        } catch (error) {
            throw new Error('Registration failed: ' + error.message);
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        window.location.href = '#home';
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        const username = document.getElementById('username');

        if (this.currentUser) {
            authButtons.classList.add('d-none');
            userProfile.classList.remove('d-none');
            username.textContent = this.currentUser.name || 'User';
        } else {
            authButtons.classList.remove('d-none');
            userProfile.classList.add('d-none');
        }
    }

    async updateProfile(userData) {
        try {
            const updatedUser = await ApiService.users.updateProfile({
                id: this.currentUser.id,
                ...userData
            });
            this.currentUser = updatedUser;
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.updateUI();
            return updatedUser;
        } catch (error) {
            throw new Error('Failed to update profile: ' + error.message);
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            await ApiService.users.changePassword(this.currentUser.id, currentPassword, newPassword);
            return true;
        } catch (error) {
            throw new Error('Failed to change password: ' + error.message);
        }
    }

    async requestPasswordReset(email) {
        try {
            await ApiService.users.requestPasswordReset(email);
            return true;
        } catch (error) {
            throw new Error('Failed to request password reset: ' + error.message);
        }
    }

    async resetPassword(email, resetCode, newPassword) {
        try {
            await ApiService.users.resetPassword(email, resetCode, newPassword);
            return true;
        } catch (error) {
            throw new Error('Failed to reset password: ' + error.message);
        }
    }
}


const auth = new AuthHandler();

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.login(email, password);
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        document.getElementById('loginForm').reset();
        showToast('Success', 'Logged in successfully!');
        window.location.href = '#home';
    } catch (error) {
        showToast('Error', error.message);
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        await auth.register(name, username, email, password);
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        registerModal.hide();
        document.getElementById('registerForm').reset();
        showToast('Success', 'Registered successfully!');
        window.location.href = '#home';
    } catch (error) {
        showToast('Error', error.message);
    }
});


function showLoginModal() {
    document.getElementById('loginForm').reset();
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

function showRegisterModal() {
    document.getElementById('registerForm').reset();
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
}

function logout() {
    auth.logout();
}

function showToast(title, message) {
    alert(`${title}: ${message}`);
}

document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;

    try {
        await auth.requestPasswordReset(email);
        document.getElementById('resetStep1').classList.add('d-none');
        document.getElementById('resetStep2').classList.remove('d-none');
        showToast('Success', 'Reset code sent to your email (Use code: 123456)');
    } catch (error) {
        showToast('Error', error.message);
    }
});

document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    const resetCode = document.getElementById('resetCode').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        showToast('Error', 'Passwords do not match');
        return;
    }

    try {
        await auth.resetPassword(email, resetCode, newPassword);
        const forgotPasswordModal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
        forgotPasswordModal.hide();
        document.getElementById('forgotPasswordForm').reset();
        document.getElementById('resetPasswordForm').reset();
        showToast('Success', 'Password reset successfully! Please login with your new password.');
        setTimeout(() => {
            showLoginModal();
        }, 500);
    } catch (error) {
        showToast('Error', error.message);
    }
});


function showForgotPasswordModal() {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (loginModal) {
        loginModal.hide();
    }
    document.getElementById('resetStep1').classList.remove('d-none');
    document.getElementById('resetStep2').classList.add('d-none');
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('resetPasswordForm').reset();
    
    setTimeout(() => {
        const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
        forgotPasswordModal.show();
    }, 500);
} 