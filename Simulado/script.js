// Espera o conteúdo do DOM ser totalmente carregado para executar o script
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os elementos de questão
    const questions = document.querySelectorAll('.question');
    // Seleciona o botão de "Próximo"
    const nextBtn = document.getElementById('next-btn');
    // Seleciona o botão de "Refazer Simulado"
    const restartBtn = document.getElementById('restart-btn');
    // Seleciona o container do quiz
    const quizContainer = document.querySelector('.quiz-container');
    // Seleciona o container de resultado
    const resultadoContainer = document.querySelector('.resultado-container');
    // Seleciona o elemento que exibe o número de acertos
    const acertosEl = document.getElementById('acertos');
    // Seleciona o elemento que exibe o total de questões
    const totalEl = document.getElementById('total');
    // Seleciona o elemento que exibe o gabarito
    const gabaritoEl = document.getElementById('gabarito');

    // Variável para controlar a questão atual
    let currentQuestion = 0;
    // Array para armazenar as respostas do usuário
    const userAnswers = [];
    // Array com as respostas corretas
    const correctAnswers = ['b', 'b']; // Gabarito das questões

    // Função para exibir uma questão específica
    function showQuestion(index) {
        // Oculta todas as questões
        questions.forEach((question, i) => {
            question.style.display = i === index ? 'block' : 'none';
        });
    }

    // Explicações para cada questão
    const explicacoes = {
        0: { // Questão 1
            correta: "b",
            textos: {
                a: "Não era bem isso. Metáfora compara elementos, mas aqui há ação humana atribuída ao sol.",
                b: "Resposta correta. O sol está realizando uma ação humana, ou seja, personificação.",
                c: "Não era bem isso. Hipérbole é exagero intencional, o que não ocorre aqui.",
                d: "Não era bem isso. Eufemismo suaviza expressões, o que não se aplica aqui.",
                e: "Não era bem isso. Ironia expressa o contrário do que se diz."
            }
        },
        1: { // Questão 2
            correta: "b",
            textos: {
                a: "Não era bem isso. José de Alencar foi outro escritor importante, mas não o autor de Dom Casmurro.",
                b: "Resposta correta. Machado de Assis é o autor de Dom Casmurro.",
                c: "Não era bem isso. Drummond foi um grande poeta, mas não escreveu Dom Casmurro.",
                d: "Não era bem isso. Graciliano Ramos escreveu Vidas Secas.",
                e: "Não era bem isso. Cecília Meireles foi poetisa, mas não autora de Dom Casmurro."
            }
        }
    };

    //Função para lidar com a seleção de uma opção de resposta
    function selectOption(e) {
    const selectedOption = e.target;
    const questionIndex = currentQuestion;
    const answer = selectedOption.dataset.option;

    //Armazena a resposta do usuário
    userAnswers[questionIndex] = answer;

    const options = questions[questionIndex].querySelectorAll('.option');
    options.forEach(option => option.style.pointerEvents = "none"); // trava os cliques

        options.forEach(option => {
            const letra = option.dataset.option;
            const explanation = document.createElement("div");
            explanation.classList.add("explanation");

            if (letra === explicacoes[questionIndex].correta) {
                option.classList.add("correct");
                explanation.innerHTML = `<span class="material-icons">check</span> ${explicacoes[questionIndex].textos[letra]}`;
                explanation.classList.add("correct");
            } else if (letra === answer) {
                option.classList.add("incorrect");
                explanation.innerHTML = `<span class="material-icons">close</span> ${explicacoes[questionIndex].textos[letra]}`;
                explanation.classList.add("incorrect");
            }

            // só adiciona explicação se existir
            if (explanation.textContent) option.appendChild(explanation);
        });
    }

    // Função para exibir os resultados do simulado
    function showResults() {
        // Oculta o container do quiz e o botão "Próximo"
        quizContainer.style.display = 'none';
        nextBtn.style.display = 'none';
        // Exibe o container de resultado
        resultadoContainer.style.display = 'block';

        // Variável para contar os acertos
        let acertos = 0;
        // Limpa o conteúdo do gabarito
        gabaritoEl.innerHTML = '';

        // Itera sobre as respostas corretas para verificar os acertos
        for (let i = 0; i < correctAnswers.length; i++) {
            if (userAnswers[i] === correctAnswers[i]) {
                acertos++;
            }
        }

        // Exibe o número de acertos e o total de questões
        acertosEl.textContent = acertos;
        totalEl.textContent = correctAnswers.length;

        // Itera sobre as questões para exibir o gabarito detalhado
        for (let i = 0; i < correctAnswers.length; i++) {
            const p = document.createElement('p');
            const questionText = questions[i].querySelector('p').textContent;
            const userAnswerText = userAnswers[i] ? userAnswers[i].toUpperCase() : 'N/A';
            const correctAnswerText = correctAnswers[i].toUpperCase();

            // Monta o texto do gabarito para a questão
            p.innerHTML = `<strong>Questão ${i + 1}:</strong> ${questionText} <br> <strong>Sua resposta:</strong> ${userAnswerText} | <strong>Resposta correta:</strong> ${correctAnswerText}`;

            // Adiciona classes para estilizar a resposta como correta ou incorreta
            if (userAnswers[i] === correctAnswers[i]) {
                p.classList.add('correct');
            } else {
                p.classList.add('incorrect');
            }
            // Adiciona o parágrafo ao elemento do gabarito
            gabaritoEl.appendChild(p);
        }
    }

    // Adiciona um evento de clique ao botão "Próximo"
    nextBtn.addEventListener('click', () => {
        // Se não for a última questão, avança para a próxima
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            // Se for a última questão, exibe os resultados
            showResults();
        }
    });

    // Adiciona um evento de clique ao botão "Refazer Simulado"
    restartBtn.addEventListener('click', () => {
        currentQuestion = 0;
        userAnswers.length = 0;
        showQuestion(currentQuestion);
        quizContainer.style.display = 'block';
        nextBtn.style.display = 'block';
        resultadoContainer.style.display = 'none';

        // Resetar todas as opções
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
            option.style.pointerEvents = "auto";

            // remover explicações antigas
            const expl = option.querySelector('.explanation');
            if (expl) expl.remove();
        });
    });

    // Adiciona um evento de clique para cada opção de cada questão
    questions.forEach(question => {
        const options = question.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', selectOption);
        });
    });

    // Exibe a primeira questão ao carregar a página
    showQuestion(currentQuestion);
});