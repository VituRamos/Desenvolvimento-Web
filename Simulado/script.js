document.addEventListener('DOMContentLoaded', () => {
    const questions = document.querySelectorAll('.question');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const quizContainer = document.querySelector('.quiz-container');
    const resultadoContainer = document.querySelector('.resultado-container');
    const acertosEl = document.getElementById('acertos');
    const totalEl = document.getElementById('total');
    const gabaritoEl = document.getElementById('gabarito');

    let currentQuestion = 0;
    const userAnswers = [];
    const correctAnswers = ['b', 'b']; // Gabarito das questões

    function showQuestion(index) {
        questions.forEach((question, i) => {
            question.style.display = i === index ? 'block' : 'none';
        });
    }

    function selectOption(e) {
        const selectedOption = e.target;
        const questionIndex = currentQuestion;
        const answer = selectedOption.dataset.option;

        userAnswers[questionIndex] = answer;

        const options = questions[questionIndex].querySelectorAll('.option');
        options.forEach(option => option.classList.remove('selected'));
        selectedOption.classList.add('selected');
    }

    function showResults() {
        quizContainer.style.display = 'none';
        nextBtn.style.display = 'none';
        resultadoContainer.style.display = 'block';

        let acertos = 0;
        gabaritoEl.innerHTML = '';

        for (let i = 0; i < correctAnswers.length; i++) {
            if (userAnswers[i] === correctAnswers[i]) {
                acertos++;
            }
        }

        acertosEl.textContent = acertos;
        totalEl.textContent = correctAnswers.length;

        for (let i = 0; i < correctAnswers.length; i++) {
            const p = document.createElement('p');
            const questionText = questions[i].querySelector('p').textContent;
            const userAnswerText = userAnswers[i] ? userAnswers[i].toUpperCase() : 'N/A';
            const correctAnswerText = correctAnswers[i].toUpperCase();

            p.innerHTML = `<strong>Questão ${i + 1}:</strong> ${questionText} <br> <strong>Sua resposta:</strong> ${userAnswerText} | <strong>Resposta correta:</strong> ${correctAnswerText}`;

            if (userAnswers[i] === correctAnswers[i]) {
                p.classList.add('correct');
            } else {
                p.classList.add('incorrect');
            }
            gabaritoEl.appendChild(p);
        }
    }

    nextBtn.addEventListener('click', () => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            showResults();
        }
    });

    restartBtn.addEventListener('click', () => {
        currentQuestion = 0;
        userAnswers.length = 0;
        showQuestion(currentQuestion);
        quizContainer.style.display = 'block';
        nextBtn.style.display = 'block';
        resultadoContainer.style.display = 'none';
        const options = document.querySelectorAll('.option');
        options.forEach(option => option.classList.remove('selected'));
    });

    questions.forEach(question => {
        const options = question.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', selectOption);
        });
    });

    showQuestion(currentQuestion);
});
