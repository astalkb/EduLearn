const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

const ApiService = {
    users: {
        _getUsers() {
            return JSON.parse(localStorage.getItem('users') || '[]');
        },

        _saveUsers(users) {
            localStorage.setItem('users', JSON.stringify(users));
        },

        async login(email, password) {
            const users = this._getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                const { password: _, ...userWithoutPassword } = user;
                return userWithoutPassword;
            }
            throw new Error('Invalid credentials');
        },

        async register(userData) {
            const users = this._getUsers();
            if (users.some(u => u.email === userData.email)) {
                throw new Error('Email already registered');
            }
            if (users.some(u => u.username === userData.username)) {
                throw new Error('Username already taken');
            }

            const newUser = {
                id: Date.now(),
                ...userData
            };
            users.push(newUser);
            this._saveUsers(users);

            const { password: _, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        },

        async updateProfile(userData) {
            const users = this._getUsers();
            const userIndex = users.findIndex(u => u.id === userData.id);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }

            users[userIndex] = {
                ...users[userIndex],
                name: userData.name,
                email: userData.email,
                bio: userData.bio,
                facebook: userData.facebook,
                github: userData.github,
                instagram: userData.instagram,
                profilePicture: userData.profilePicture
            };

            this._saveUsers(users);

            const { password: _, ...userWithoutPassword } = users[userIndex];
            return userWithoutPassword;
        },

        async changePassword(userId, currentPassword, newPassword) {
            const users = this._getUsers();
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }

            if (users[userIndex].password !== currentPassword) {
                throw new Error('Current password is incorrect');
            }

            users[userIndex].password = newPassword;
            this._saveUsers(users);
            return true;
        },

        async requestPasswordReset(email) {
            const users = this._getUsers();
            const user = users.find(u => u.email === email);
            if (!user) {
                throw new Error('Email not found');
            }
            localStorage.setItem('resetCode', '123456');
            localStorage.setItem('resetEmail', email);
            return true;
        },

        async resetPassword(email, resetCode, newPassword) {
            const storedCode = localStorage.getItem('resetCode');
            const storedEmail = localStorage.getItem('resetEmail');
            
            if (email !== storedEmail) {
                throw new Error('Invalid reset attempt');
            }
            
            if (resetCode !== storedCode) {
                throw new Error('Invalid reset code');
            }

            const users = this._getUsers();
            const userIndex = users.findIndex(u => u.email === email);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }

            users[userIndex].password = newPassword;
            this._saveUsers(users);

            localStorage.removeItem('resetCode');
            localStorage.removeItem('resetEmail');
            return true;
        },

        async getProfile(userId) {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);
            return await response.json();
        }
    },

    quizzes: {
        async getAll() {
            return [
                {
                    id: 1,
                    title: "HTML Fundamentals Quiz",
                    description: "Test your knowledge of HTML basics and semantic elements",
                    questions: [
                        {
                            question: "What does HTML stand for?",
                            options: [
                                "Hyper Text Markup Language",
                                "High Tech Modern Language",
                                "Hyper Transfer Markup Language",
                                "Hyper Text Modern Links"
                            ],
                            correctAnswer: 0
                        },
                        {
                            question: "Which HTML element is used to define navigation links?",
                            options: [
                                "nav",
                                "navigation",
                                "links",
                                "navbar"
                            ],
                            correctAnswer: 0
                        },
                        {
                            question: "What is the correct HTML element for the largest heading?",
                            options: [
                                "heading",
                                "h6",
                                "head",
                                "h1"
                            ],
                            correctAnswer: 3
                        },
                        {
                            question: "Which HTML tag is used to create a hyperlink?",
                            options: [
                                "link",
                                "a",
                                "href",
                                "url"
                            ],
                            correctAnswer: 1
                        },
                        {
                            question: "Which HTML element is used to create an unordered list?",
                            options: [
                                "ol",
                                "list",
                                "ul",
                                "unordered"
                            ],
                            correctAnswer: 2
                        }
                    ]
                },
                {
                    id: 2,
                    title: "CSS Styling Quiz",
                    description: "Challenge yourself with CSS properties and layouts",
                    questions: [
                        {
                            question: "Which CSS property is used to change the text color?",
                            options: [
                                "text-color",
                                "color",
                                "font-color",
                                "text-style"
                            ],
                            correctAnswer: 1
                        },
                        {
                            question: "What is the correct CSS syntax for flexbox display?",
                            options: [
                                "display: flex-box;",
                                "display: flexbox;",
                                "display: flex;",
                                "display: box;"
                            ],
                            correctAnswer: 2
                        },
                        {
                            question: "Which property is used to create space between elements?",
                            options: [
                                "spacing",
                                "margin",
                                "padding",
                                "gap"
                            ],
                            correctAnswer: 1
                        },
                        {
                            question: "How do you select an element with class 'header' in CSS?",
                            options: [
                                "#header",
                                ".header",
                                "header",
                                "@header"
                            ],
                            correctAnswer: 1
                        },
                        {
                            question: "Which CSS property is used to make text bold?",
                            options: [
                                "text-weight",
                                "font-weight",
                                "bold",
                                "text-style"
                            ],
                            correctAnswer: 1
                        }
                    ]
                },
                {
                    id: 3,
                    title: "JavaScript Basics Quiz",
                    description: "Test your JavaScript fundamentals and concepts",
                    questions: [
                        {
                            question: "Which keyword is used to declare a variable in JavaScript?",
                            options: [
                                "var",
                                "let",
                                "const",
                                "All of the above"
                            ],
                            correctAnswer: 3
                        },
                        {
                            question: "What is the correct way to write a JavaScript array?",
                            options: [
                                "var colors = 'red', 'green', 'blue'",
                                "var colors = ['red', 'green', 'blue']",
                                "var colors = (red, green, blue)",
                                "var colors = 1 = red, 2 = green, 3 = blue"
                            ],
                            correctAnswer: 1
                        },
                        {
                            question: "What will console.log(typeof []) output?",
                            options: [
                                "array",
                                "object",
                                "undefined",
                                "null"
                            ],
                            correctAnswer: 1
                        },
                        {
                            question: "How do you write an IF statement in JavaScript?",
                            options: [
                                "if x = 5 then",
                                "if (x == 5)",
                                "if x == 5",
                                "if x = 5"
                            ],
                            correctAnswer: 1
                        },
                        {
                            question: "Which method is used to add elements to the end of an array?",
                            options: [
                                "append()",
                                "push()",
                                "add()",
                                "insert()"
                            ],
                            correctAnswer: 1
                        }
                    ]
                },
                {
                    id: 4,
                    title: "Bootstrap Framework Quiz",
                    description: "Check your Bootstrap 5 knowledge and components",
                    questions: [
                        {
                            question: "Which class is used to create a responsive grid in Bootstrap?",
                            options: [
                                "grid-container",
                                "container",
                                "wrapper",
                                "responsive-grid"
                            ],
                            correctAnswer: 1
                        },
                        {
                            question: "What is the correct class for creating a primary button in Bootstrap?",
                            options: [
                                "button-primary",
                                "btn-blue",
                                "btn-primary",
                                "primary-btn"
                            ],
                            correctAnswer: 2
                        },
                        {
                            question: "Which Bootstrap class is used to make an image responsive?",
                            options: [
                                "img-responsive",
                                "responsive-img",
                                "img-fluid",
                                "fluid-img"
                            ],
                            correctAnswer: 2
                        },
                        {
                            question: "What is the Bootstrap grid system based on?",
                            options: [
                                "6 columns",
                                "8 columns",
                                "12 columns",
                                "16 columns"
                            ],
                            correctAnswer: 2
                        },
                        {
                            question: "Which class adds a margin to the bottom of an element in Bootstrap?",
                            options: [
                                "m-bottom",
                                "margin-bottom",
                                "mb",
                                "mb-3"
                            ],
                            correctAnswer: 3
                        }
                    ]
                }
            ];
        },

        async getQuiz(quizId) {
            const allQuizzes = await this.getAll();
            const quiz = allQuizzes.find(q => q.id === quizId);
            if (!quiz) throw new Error('Quiz not found');
            return quiz;
        },

        async submitQuiz(quizId, answers) {
            const quiz = await this.getQuiz(quizId);
            let correctAnswers = 0;
            
            answers.forEach((answer, index) => {
                if (answer === quiz.questions[index].correctAnswer) {
                    correctAnswers++;
                }
            });

            const score = Math.round((correctAnswers / quiz.questions.length) * 100);
            
            return {
                score,
                totalQuestions: quiz.questions.length,
                correctAnswers
            };
        }
    },

    blog: {
        async getPosts() {
            return [
                {
                    id: 1,
                    title: "The Rise of AI in Web Development",
                    content: "Artificial Intelligence is revolutionizing how we build and maintain web applications. From AI-powered development assistants to automated testing and optimization, the impact of AI on web development is profound and far-reaching. As we move forward, we can expect to see more AI-driven tools that help developers write better code, detect bugs earlier, and create more personalized user experiences.",
                    image: "https://picsum.photos/seed/ai/600/400",
                    author: "Tech Insider",
                    date: "2024-03-15",
                    comments: []
                },
                {
                    id: 2,
                    title: "Web Assembly: The Future of Browser-Based Applications",
                    content: "WebAssembly (Wasm) is gaining momentum as a powerful technology for running high-performance applications in the browser. With major companies adopting Wasm for their web applications, we're seeing a new era of desktop-class performance on the web. This technology enables developers to write code in languages like C++, Rust, and Go, and run them directly in the browser with near-native performance.",
                    image: "https://picsum.photos/seed/wasm/600/400",
                    author: "Web Tech Weekly",
                    date: "2024-03-14",
                    comments: []
                },
                {
                    id: 3,
                    title: "The Evolution of Responsive Design with Container Queries",
                    content: "Container queries are changing how we approach responsive design. Unlike traditional media queries that look at the viewport, container queries allow components to adapt based on their parent container's size, enabling truly modular and reusable components. This new approach to responsive design is making it easier to create more flexible and maintainable layouts.",
                    image: "https://picsum.photos/seed/responsive/600/400",
                    author: "CSS Master",
                    date: "2024-03-13",
                    comments: []
                },
                {
                    id: 4,
                    title: "The Power of Progressive Web Apps (PWAs)",
                    content: "Progressive Web Apps are transforming the way we think about web applications. By combining the best of web and mobile apps, PWAs offer users a seamless experience across all devices. With features like offline functionality, push notifications, and home screen installation, PWAs are becoming an increasingly popular choice for businesses looking to provide a native app-like experience without the complexity of maintaining separate codebases.",
                    image: "https://picsum.photos/seed/pwa/600/400",
                    author: "Web Development Today",
                    date: "2024-03-12",
                    comments: []
                },
                {
                    id: 5,
                    title: "The Future of CSS: Modern Layout Techniques",
                    content: "Modern CSS has evolved far beyond simple styling. With features like CSS Grid, Flexbox, and CSS Custom Properties, developers now have powerful tools to create complex layouts with ease. The introduction of CSS Container Queries and CSS Cascade Layers is further revolutionizing how we structure and maintain our styles. These advancements are making CSS more powerful and maintainable than ever before.",
                    image: "https://picsum.photos/seed/css/600/400",
                    author: "CSS Expert",
                    date: "2024-03-11",
                    comments: []
                },
                {
                    id: 6,
                    title: "Building Secure Web Applications in 2024",
                    content: "Web security has never been more important. With the increasing sophistication of cyber threats, developers need to stay vigilant and implement robust security measures. From implementing proper authentication and authorization to protecting against common vulnerabilities like XSS and CSRF, this article explores the essential security practices every web developer should follow in 2024.",
                    image: "https://picsum.photos/seed/security/600/400",
                    author: "Security Specialist",
                    date: "2024-03-10",
                    comments: []
                }
            ];
        },

        async getPost(postId) {
            const posts = await this.getPosts();
            const post = posts.find(p => p.id === postId);
            if (!post) throw new Error('Post not found');
            
            const savedComments = JSON.parse(localStorage.getItem(`post_${postId}_comments`) || '[]');
            post.comments = savedComments;
            
            return post;
        },

        async addComment(postId, comment) {
            const comments = JSON.parse(localStorage.getItem(`post_${postId}_comments`) || '[]');
            
            const newComment = {
                ...comment,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                userId: comment.userId 
            };
            
            comments.unshift(newComment);
            
            localStorage.setItem(`post_${postId}_comments`, JSON.stringify(comments));
            
            return newComment;
        },

        async deleteComment(postId, commentId, userId) {
            const comments = JSON.parse(localStorage.getItem(`post_${postId}_comments`) || '[]');
            
            const commentIndex = comments.findIndex(c => c.id === commentId);
            
            if (commentIndex === -1) {
                throw new Error('Comment not found');
            }

            if (comments[commentIndex].userId !== userId) {
                throw new Error('Not authorized to delete this comment');
            }

            comments.splice(commentIndex, 1);
            
            localStorage.setItem(`post_${postId}_comments`, JSON.stringify(comments));
            
            return true;
        }
    },

    projects: {
        async getAll() {
            return [
                {
                    id: 1,
                    title: "Customer & Services Management",
                    description: "The Customer & Services Management System API is a robust Flask-based application engineered to streamline the management of customer interactions and service offerings. This comprehensive system provides advanced features for tracking customer data, managing service catalogs, and processing orders through well-defined API endpoints. The application implements secure authentication, real-time updates, and efficient data handling, making it ideal for businesses looking to modernize their customer service operations. The system's modular design allows for easy scaling and maintenance.",
                    image: "image/CSM.png",
                    technologies: ["Python", "Flask", "SQLAlchemy", "REST API"],
                    link: "https://github.com/astalkb/Customer-Services-Management"
                },
                {
                    id: 2,
                    title: "FireApp",
                    description: "FireApp is an innovative application designed for real-time monitoring and tracking of fire incidents across different cities and countries. Built with Django's robust framework, it provides comprehensive incident management capabilities, real-time notifications, and detailed reporting features. The application includes an intuitive dashboard for monitoring active incidents, historical data analysis, and resource allocation tracking. Its responsive design ensures accessibility across all devices, making it an essential tool for emergency response teams.",
                    image: "image/FireApp.png",
                    technologies: ["Python", "Django", "PostgreSQL", "Real-time Updates"],
                    link: "https://github.com/uzzielkyle/FireApp"
                },
                {
                    id: 3,
                    title: "PSUSphere",
                    description: "PSUSphere represents a cutting-edge web application designed specifically for Palawan State University's digital ecosystem. This platform goes beyond basic social networking by integrating academic tools, event management, and community engagement features. Students can access course materials, participate in academic discussions, and stay updated with university events. The platform includes features for department announcements, club activities, and academic calendar integration, creating a comprehensive digital hub for university life.",
                    image: "image/PSUSphere.png",
                    technologies: ["Python", "Django", "Bootstrap", "SQLite"],
                    link: "https://github.com/astalkb/PSUSphere"
                },
                {
                    id: 4,
                    title: "Cozycup",
                    description: "Cozycup is more than just a café website - it's a complete digital experience that showcases modern web development practices. The project features an elegant, responsive design with interactive menus, online ordering capabilities, and a sophisticated reservation system. Users can explore the café's ambiance through an immersive gallery, read about its history, and easily contact the establishment. The website includes animations, dynamic content loading, and seamless mobile integration, demonstrating advanced front-end development techniques.",
                    image: "image/CozyCup.webp",
                    technologies: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
                    link: "https://github.com/astalkb/Cozycup"
                }
            ];
        },

        async getProject(projectId) {
            const projects = await this.getAll();
            const project = projects.find(p => p.id === projectId);
            if (!project) throw new Error('Project not found');
            return project;
        }
    }
}; 