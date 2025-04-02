class App {
    constructor() {
        this.initializeEventListeners();
        this.loadAllContent();
        this.handleScrollSpy();
        this.initializeDarkMode();
        this.initializePasswordValidation();
    }

    initializeEventListeners() {
        window.addEventListener('hashchange', () => this.handleNavigation());
        window.addEventListener('scroll', () => this.handleScrollSpy());
        
        this.initializeNewPasswordValidation();
        document.querySelector('a[href="#projects"]').addEventListener('click', () => {
            this.loadProjects();
        });
    }

    handleNavigation() {
        const hash = window.location.hash || '#home';
        const mainContent = document.querySelectorAll('#home, #quizzes, #blog, #projects');
        const profileSection = document.getElementById('profile');
        const projectsSection = document.getElementById('projects');
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        if (hash === '#profile') {
            mainContent.forEach(section => section.classList.add('d-none'));
            if (auth.isAuthenticated()) {
                profileSection.classList.remove('d-none');
                this.loadProfile();
                const profileLink = document.querySelector('a[href="#profile"]');
                if (profileLink) {
                    profileLink.classList.add('active');
                }
            } else {
                window.location.hash = '#home';
                showToast('Error', 'Please login to view profile');
            }
        } else {
            mainContent.forEach(section => section.classList.remove('d-none'));
            profileSection.classList.add('d-none');
            
            if (hash === '#projects') {
                if (!auth.isAuthenticated()) {
                    window.location.hash = '#home';
                    showToast('Error', 'Please login to view projects');
                    return;
                }
                this.loadProjects();
            } else if (hash === '#quizzes') {
                quizHandler.loadQuizzes();
            } else if (hash === '#blog') {
                blogHandler.loadPosts();
            }
            
            if (hash !== '#home') {
                const targetSection = document.querySelector(hash);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }


        if (projectsSection) {
            if (!auth.isAuthenticated()) {
                projectsSection.classList.add('d-none');
            }
        }
    }

    handleScrollSpy() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');
        const hash = window.location.hash || '#home';
        
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        if (hash === '#profile') {
            const profileLink = document.querySelector('a[href="#profile"]');
            if (profileLink) {
                profileLink.classList.add('active');
            }
            return;
        }
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    loadAllContent() {
        quizHandler.loadQuizzes();
        blogHandler.loadPosts();
        
        if (auth.isAuthenticated()) {
            this.loadProfile();
            this.loadProjects();
        }

        this.handleNavigation();
    }

    async loadProfile() {
        if (!auth.isAuthenticated()) {
            document.getElementById('profile').classList.add('d-none');
            return;
        }

        try {
            const user = auth.getCurrentUser();
            document.getElementById('profile').classList.remove('d-none');

            const profileSection = document.getElementById('profile');
            profileSection.querySelector('.container').innerHTML = `
                <h2 class="mb-4">My Profile</h2>
                <div class="row">
                    <div class="col-md-4">
                        <div class="card mb-4">
                            <div class="card-body text-center">
                                <div class="profile-picture mb-3">
                                    <img src="${user.profilePicture || 'https://via.placeholder.com/150'}" 
                                         class="rounded-circle mb-3" 
                                         alt="Profile Picture" 
                                         style="width: 150px; height: 150px; object-fit: cover;">
                                    <div class="mt-2">
                                        <label for="profilePictureInput" class="btn btn-outline-primary btn-sm">
                                            Change Picture
                                        </label>
                                        <input type="file" 
                                               id="profilePictureInput" 
                                               accept="image/*" 
                                               class="d-none" 
                                               onchange="app.handleProfilePictureChange(event)">
                                    </div>
                                </div>
                                <h5 class="card-title">User Information</h5>
                                <form id="profileForm">
                                    <div class="mb-3">
                                        <label class="form-label">Username</label>
                                        <input type="text" class="form-control" id="profileUsername" value="${user.username}" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Name</label>
                                        <input type="text" class="form-control" id="profileName" value="${user.name}" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" id="profileEmail" value="${user.email}" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Bio</label>
                                        <textarea class="form-control" id="profileBio" rows="3" readonly>${user.bio || ''}</textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Social Media</label>
                                        <div class="input-group mb-2">
                                            <span class="input-group-text"><i class="bi bi-facebook"></i></span>
                                            <input type="url" class="form-control" id="profileFacebook" value="${user.facebook || ''}" readonly placeholder="Facebook URL">
                                        </div>
                                        <div class="input-group mb-2">
                                            <span class="input-group-text"><i class="bi bi-github"></i></span>
                                            <input type="url" class="form-control" id="profileGithub" value="${user.github || ''}" readonly placeholder="GitHub URL">
                                        </div>
                                        <div class="input-group mb-2">
                                            <span class="input-group-text"><i class="bi bi-instagram"></i></span>
                                            <input type="url" class="form-control" id="profileInstagram" value="${user.instagram || ''}" readonly placeholder="Instagram URL">
                                        </div>
                                    </div>
                                    <div class="d-flex gap-2">
                                        <button type="button" class="btn btn-primary" id="editProfileBtn" onclick="app.toggleProfileEdit()">
                                            Edit
                                        </button>
                                        <button type="button" class="btn btn-primary d-none" id="updateProfileBtn" onclick="app.updateProfile()">
                                            Save Changes
                                        </button>
                                        <button type="button" class="btn btn-outline-secondary d-none" id="cancelProfileBtn" onclick="app.cancelProfileEdit()">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Change Password</h5>
                                <form id="passwordForm">
                                    <div class="mb-3">
                                        <label class="form-label">Current Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="currentPassword">
                                            <button class="btn btn-outline-secondary" type="button" onclick="app.togglePasswordVisibility('currentPassword')">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">New Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="newPassword">
                                            <button class="btn btn-outline-secondary" type="button" onclick="app.togglePasswordVisibility('newPassword')">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                        </div>
                                        <div class="password-requirements mt-2">
                                            <ul class="list-unstyled">
                                                <li id="newPasswordLength"><i class="bi bi-x-circle text-danger"></i> At least 8 characters</li>
                                                <li id="newPasswordUpper"><i class="bi bi-x-circle text-danger"></i> One uppercase letter</li>
                                                <li id="newPasswordLower"><i class="bi bi-x-circle text-danger"></i> One lowercase letter</li>
                                                <li id="newPasswordNumber"><i class="bi bi-x-circle text-danger"></i> One number</li>
                                                <li id="newPasswordSpecial"><i class="bi bi-x-circle text-danger"></i> One special character</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Confirm New Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="confirmPassword">
                                            <button class="btn btn-outline-secondary" type="button" onclick="app.togglePasswordVisibility('confirmPassword')">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-primary" id="changePasswordBtn" onclick="app.changePassword()" disabled>
                                        Change Password
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <h3>Quiz History</h3>
                        <div id="quizHistory">
                            <!-- Quiz history will be dynamically added here -->
                        </div>
                    </div>
                </div>
            `;

            this.initializeNewPasswordValidation();
            const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
            const quizHistoryElement = document.getElementById('quizHistory');
            
            if (quizHistory.length === 0) {
                quizHistoryElement.innerHTML = `
                    <div class="alert alert-info">
                        No quiz history available yet. Take some quizzes to see your progress!
                    </div>
                `;
            } else {
                quizHistoryElement.innerHTML = `
                    <div class="row">
                        ${quizHistory.map(entry => `
                            <div class="col-md-6 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h5 class="card-title">${entry.quizTitle}</h5>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <span class="badge bg-primary">${entry.score}%</span>
                                            <small class="text-muted">${new Date(entry.timestamp).toLocaleDateString()}</small>
                                        </div>
                                        <p class="card-text">
                                            Correct Answers: ${entry.correctAnswers}/${entry.totalQuestions}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-outline-danger mt-3" onclick="app.clearQuizHistory()">
                        Clear History
                    </button>
                `;
            }
        } catch (error) {
            showToast('Error', 'Failed to load profile');
        }
    }

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const button = input.nextElementSibling.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            button.className = 'bi bi-eye-slash';
        } else {
            input.type = 'password';
            button.className = 'bi bi-eye';
        }
    }

    initializePasswordValidation() {
        const registerPasswordInput = document.getElementById('registerPassword');
        const registerTogglePassword = document.getElementById('togglePassword');
        const registerSubmit = document.getElementById('registerSubmit');

        if (registerPasswordInput && registerTogglePassword && registerSubmit) {
            const registerRequirements = {
                length: { regex: /.{8,}/, element: document.getElementById('lengthCheck') },
                upper: { regex: /[A-Z]/, element: document.getElementById('upperCheck') },
                lower: { regex: /[a-z]/, element: document.getElementById('lowerCheck') },
                number: { regex: /[0-9]/, element: document.getElementById('numberCheck') },
                special: { regex: /[!@#$%^&*(),.?":{}|<>]/, element: document.getElementById('specialCheck') }
            };

            registerTogglePassword.addEventListener('click', () => {
                const type = registerPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                registerPasswordInput.setAttribute('type', type);
                registerTogglePassword.querySelector('i').className = `bi bi-eye${type === 'password' ? '' : '-slash'}`;
            });

            registerPasswordInput.addEventListener('input', () => {
                this.validatePassword(registerPasswordInput.value, registerRequirements, registerSubmit);
            });
        }



        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const changePasswordBtn = document.getElementById('changePasswordBtn');

        if (newPasswordInput && confirmPasswordInput && changePasswordBtn) {
            const profileRequirements = {
                length: { regex: /.{8,}/, element: document.getElementById('newPasswordLength') },
                upper: { regex: /[A-Z]/, element: document.getElementById('newPasswordUpper') },
                lower: { regex: /[a-z]/, element: document.getElementById('newPasswordLower') },
                number: { regex: /[0-9]/, element: document.getElementById('newPasswordNumber') },
                special: { regex: /[!@#$%^&*(),.?":{}|<>]/, element: document.getElementById('newPasswordSpecial') }
            };

            const validateProfilePassword = () => {
                const password = newPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                let isValid = this.validatePassword(password, profileRequirements, changePasswordBtn);
                
                if (password !== confirmPassword || !password || !confirmPassword) {
                    isValid = false;
                }
                
                changePasswordBtn.disabled = !isValid;
            };

            newPasswordInput.addEventListener('input', validateProfilePassword);
            confirmPasswordInput.addEventListener('input', validateProfilePassword);
        }


        const resetPasswordInput = document.getElementById('newPassword');
        const resetConfirmPasswordInput = document.getElementById('confirmNewPassword');
        const resetPasswordSubmit = document.getElementById('resetPasswordSubmit');

        if (resetPasswordInput && resetConfirmPasswordInput && resetPasswordSubmit) {
            const resetRequirements = {
                length: { regex: /.{8,}/, element: document.getElementById('resetPasswordLength') },
                upper: { regex: /[A-Z]/, element: document.getElementById('resetPasswordUpper') },
                lower: { regex: /[a-z]/, element: document.getElementById('resetPasswordLower') },
                number: { regex: /[0-9]/, element: document.getElementById('resetPasswordNumber') },
                special: { regex: /[!@#$%^&*(),.?":{}|<>]/, element: document.getElementById('resetPasswordSpecial') }
            };

            const validateResetPassword = () => {
                const password = resetPasswordInput.value;
                const confirmPassword = resetConfirmPasswordInput.value;
                let isValid = this.validatePassword(password, resetRequirements, resetPasswordSubmit);
                
                if (password !== confirmPassword || !password || !confirmPassword) {
                    isValid = false;
                }
                
                resetPasswordSubmit.disabled = !isValid;
            };

            resetPasswordInput.addEventListener('input', validateResetPassword);
            resetConfirmPasswordInput.addEventListener('input', validateResetPassword);
        }
    }

    validatePassword(password, requirements, submitButton) {
        let isValid = true;

        Object.keys(requirements).forEach(req => {
            const isRequirementMet = requirements[req].regex.test(password);
            const element = requirements[req].element;
            
            if (element) {
                element.querySelector('i').className = `bi bi-${isRequirementMet ? 'check-circle text-success' : 'x-circle text-danger'}`;
            }
            
            if (!isRequirementMet) isValid = false;
        });

        if (submitButton) {
            submitButton.disabled = !isValid;
        }

        return isValid;
    }

    initializeNewPasswordValidation() {
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const changePasswordBtn = document.getElementById('changePasswordBtn');

        if (!newPasswordInput || !confirmPasswordInput || !changePasswordBtn) return;

        const requirements = {
            length: { regex: /.{8,}/, element: document.getElementById('newPasswordLength') },
            upper: { regex: /[A-Z]/, element: document.getElementById('newPasswordUpper') },
            lower: { regex: /[a-z]/, element: document.getElementById('newPasswordLower') },
            number: { regex: /[0-9]/, element: document.getElementById('newPasswordNumber') },
            special: { regex: /[!@#$%^&*(),.?":{}|<>]/, element: document.getElementById('newPasswordSpecial') }
        };

        const validatePassword = () => {
            const password = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            let isValid = this.validatePassword(password, requirements, changePasswordBtn);
            
            if (password !== confirmPassword || !password || !confirmPassword) {
                isValid = false;
            }
            
            changePasswordBtn.disabled = !isValid;
        };

        newPasswordInput.addEventListener('input', validatePassword);
        confirmPasswordInput.addEventListener('input', validatePassword);
    }

    toggleProfileEdit() {
        const nameInput = document.getElementById('profileName');
        const emailInput = document.getElementById('profileEmail');
        const bioInput = document.getElementById('profileBio');
        const facebookInput = document.getElementById('profileFacebook');
        const githubInput = document.getElementById('profileGithub');
        const instagramInput = document.getElementById('profileInstagram');
        const editBtn = document.getElementById('editProfileBtn');
        const updateBtn = document.getElementById('updateProfileBtn');
        const cancelBtn = document.getElementById('cancelProfileBtn');

        if (nameInput.readOnly) {
            nameInput.dataset.original = nameInput.value;
            emailInput.dataset.original = emailInput.value;
            bioInput.dataset.original = bioInput.value;
            facebookInput.dataset.original = facebookInput.value;
            githubInput.dataset.original = githubInput.value;
            instagramInput.dataset.original = instagramInput.value;
        }

        nameInput.readOnly = !nameInput.readOnly;
        emailInput.readOnly = !emailInput.readOnly;
        bioInput.readOnly = !bioInput.readOnly;
        facebookInput.readOnly = !facebookInput.readOnly;
        githubInput.readOnly = !githubInput.readOnly;
        instagramInput.readOnly = !instagramInput.readOnly;

        editBtn.classList.toggle('d-none');
        updateBtn.classList.toggle('d-none');
        cancelBtn.classList.toggle('d-none');

        if (!nameInput.readOnly) {
            nameInput.focus();
        }
    }

    cancelProfileEdit() {
        const nameInput = document.getElementById('profileName');
        const emailInput = document.getElementById('profileEmail');
        const bioInput = document.getElementById('profileBio');
        const facebookInput = document.getElementById('profileFacebook');
        const githubInput = document.getElementById('profileGithub');
        const instagramInput = document.getElementById('profileInstagram');

        nameInput.value = nameInput.dataset.original;
        emailInput.value = emailInput.dataset.original;
        bioInput.value = bioInput.dataset.original;
        facebookInput.value = facebookInput.dataset.original;
        githubInput.value = githubInput.dataset.original;
        instagramInput.value = instagramInput.dataset.original;

        this.toggleProfileEdit();
    }

    async updateProfile() {
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        const bio = document.getElementById('profileBio').value;
        const facebook = document.getElementById('profileFacebook').value;
        const github = document.getElementById('profileGithub').value;
        const instagram = document.getElementById('profileInstagram').value;

        try {
            await auth.updateProfile({ 
                id: auth.getCurrentUser().id,
                name, 
                email,
                bio,
                facebook,
                github,
                instagram
            });
            this.toggleProfileEdit();
            showToast('Success', 'Profile updated successfully');
        } catch (error) {
            showToast('Error', 'Failed to update profile');
        }
    }

    async handleProfilePictureChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const user = auth.getCurrentUser();
                user.profilePicture = e.target.result;
                await auth.updateProfile(user);
                this.loadProfile();
                showToast('Success', 'Profile picture updated successfully');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            showToast('Error', 'Failed to update profile picture');
        }
    }

    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showToast('Error', 'Passwords do not match');
            return;
        }

        try {
            await auth.changePassword(currentPassword, newPassword);
            document.getElementById('passwordForm').reset();
            showToast('Success', 'Password changed successfully');
        } catch (error) {
            showToast('Error', 'Failed to change password');
        }
    }

    async loadProjects() {
        try {
            const projects = await ApiService.projects.getAll();
            const projectsList = document.getElementById('projectsList');
            
            projectsList.innerHTML = projects.map(project => `
                <div class="col-lg-3 col-md-6 mb-4">
                    <div class="card h-100">
                        <img src="${project.image}" class="card-img-top" alt="${project.title}" style="height: 200px; object-fit: contain; padding: 1rem;">
                        <div class="card-body">
                            <h5 class="card-title">${project.title}</h5>
                            <p class="card-text">${project.description}</p>
                            <div class="mb-3">
                                ${project.technologies.map(tech => `
                                    <span class="badge bg-primary me-1">${tech}</span>
                                `).join('')}
                            </div>
                            <a href="${project.link}" class="btn btn-primary" target="_blank">View Project</a>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            showToast('Error', 'Failed to load projects');
        }
    }

    clearQuizHistory() {
        if (confirm('Are you sure you want to clear your quiz history?')) {
            localStorage.removeItem('quizHistory');
            this.loadProfile();
            showToast('Success', 'Quiz history cleared');
        }
    }

    initializeDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const darkModeIcon = document.getElementById('darkModeIcon');
        const htmlElement = document.documentElement;
        
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        htmlElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
        darkModeIcon.className = isDarkMode ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
        
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-bs-theme', newTheme);
            darkModeIcon.className = newTheme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
            localStorage.setItem('darkMode', newTheme === 'dark');
        });
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        const username = document.getElementById('username');
        const projectsNav = document.querySelector('a[href="#projects"]').parentElement;

        if (this.currentUser) {
            authButtons.classList.add('d-none');
            userProfile.classList.remove('d-none');
            username.textContent = this.currentUser.name || 'User';
            projectsNav.classList.remove('d-none');
        } else {
            authButtons.classList.remove('d-none');
            userProfile.classList.add('d-none');
            projectsNav.classList.add('d-none');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 