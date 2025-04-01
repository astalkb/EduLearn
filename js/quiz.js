class QuizHandler {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
    }

    async loadQuizzes() {
        try {
            const quizzes = await ApiService.quizzes.getAll();
            this.displayQuizList(quizzes);
        } catch (error) {
            showToast('Error', 'Failed to load quizzes');
        }
    }

    displayQuizList(quizzes) {
        const quizList = document.getElementById('quizList');
        quizList.innerHTML = '';

        quizzes.forEach(quiz => {
            const quizCard = document.createElement('div');
            quizCard.className = 'col-md-4 mb-4';
            quizCard.innerHTML = `
                <div class="card quiz-card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${quiz.title}</h5>
                        <p class="card-text">${quiz.description}</p>
                        <button class="btn btn-primary" onclick="quizHandler.startQuiz(${quiz.id})">
                            Start Quiz
                        </button>
                    </div>
                </div>
            `;
            quizList.appendChild(quizCard);
        });
    }

    async startQuiz(quizId) {
        if (!auth.isAuthenticated()) {
            showToast('Error', 'Please login to take a quiz');
            showLoginModal();
            return;
        }

        try {
            this.currentQuiz = await ApiService.quizzes.getQuiz(quizId);
            this.currentQuestionIndex = 0;
            this.userAnswers = [];
            this.showQuizModal();
            this.displayCurrentQuestion();
        } catch (error) {
            showToast('Error', 'Failed to load quiz');
        }
    }

    showQuizModal() {
        const quizModal = new bootstrap.Modal(document.getElementById('quizModal'));
        quizModal.show();
    }

    displayCurrentQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const quizContent = document.getElementById('quizContent');
        const quizTitle = document.getElementById('quizTitle');

        quizTitle.textContent = this.currentQuiz.title;
        
        quizContent.innerHTML = `
            <div class="quiz-question mb-4">
                <h4>Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.questions.length}</h4>
                <p class="lead">${question.question}</p>
            </div>
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <div class="quiz-option" onclick="quizHandler.selectAnswer(${index})">
                        ${option}
                    </div>
                `).join('')}
            </div>
            <div class="mt-4">
                ${this.currentQuestionIndex > 0 ? 
                    `<button class="btn btn-secondary me-2" onclick="quizHandler.previousQuestion()">Previous</button>` : 
                    ''}
                ${this.currentQuestionIndex < this.currentQuiz.questions.length - 1 ? 
                    `<button class="btn btn-primary" onclick="quizHandler.nextQuestion()">Next</button>` :
                    `<button class="btn btn-success" onclick="quizHandler.submitQuiz()">Submit Quiz</button>`}
            </div>
        `;
    }

    selectAnswer(answerIndex) {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => option.classList.remove('selected'));
        options[answerIndex].classList.add('selected');
        this.userAnswers[this.currentQuestionIndex] = answerIndex;
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayCurrentQuestion();
            if (this.userAnswers[this.currentQuestionIndex] !== undefined) {
                const options = document.querySelectorAll('.quiz-option');
                options[this.userAnswers[this.currentQuestionIndex]].classList.add('selected');
            }
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
            if (this.userAnswers[this.currentQuestionIndex] !== undefined) {
                const options = document.querySelectorAll('.quiz-option');
                options[this.userAnswers[this.currentQuestionIndex]].classList.add('selected');
            }
        }
    }

    async submitQuiz() {
        if (this.userAnswers.length !== this.currentQuiz.questions.length) {
            showToast('Error', 'Please answer all questions');
            return;
        }

        try {
            const result = await ApiService.quizzes.submitQuiz(this.currentQuiz.id, this.userAnswers);
            
            const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
            const historyEntry = {
                id: Date.now(),
                quizId: this.currentQuiz.id,
                quizTitle: this.currentQuiz.title,
                score: result.score,
                correctAnswers: result.correctAnswers,
                totalQuestions: result.totalQuestions,
                timestamp: new Date().toISOString()
            };
            quizHistory.unshift(historyEntry);
            localStorage.setItem('quizHistory', JSON.stringify(quizHistory));

            const profileSection = document.getElementById('profile');
            if (!profileSection.classList.contains('d-none')) {
                app.loadProfile();
            }

            this.displayQuizResult(result);
        } catch (error) {
            showToast('Error', 'Failed to submit quiz');
        }
    }

    displayQuizResult(result) {
        const quizContent = document.getElementById('quizContent');
        quizContent.innerHTML = `
            <div class="text-center">
                <h3>Quiz Complete!</h3>
                <div class="result-circle my-4">
                    <h1>${result.score}%</h1>
                </div>
                <p>You got ${result.correctAnswers} out of ${result.totalQuestions} questions correct.</p>
                <button class="btn btn-primary" onclick="bootstrap.Modal.getInstance(document.getElementById('quizModal')).hide()">
                    Close
                </button>
            </div>
        `;
    }
}

const quizHandler = new QuizHandler();

document.querySelector('a[href="#quizzes"]').addEventListener('click', () => {
    quizHandler.loadQuizzes();
});