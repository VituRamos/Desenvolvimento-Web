## ⚙️ Instalação e Execução (Passo a Passo)
Siga estes passos no seu terminal para configurar e rodar o projeto localmente:

### 1. Pré-requisitos (Instalação Manual)
Antes de usar o terminal, garanta que você já tenha instalado:

* **Node.js (v18+) e npm:** [https://nodejs.org/](https://nodejs.org/)
* **Python (v3.9+):** [https://www.python.org/](https://www.python.org/)
    * *(Windows)* Certifique-se de marcar "Add Python to PATH" durante a instalação.
* **Git:** [https://git-scm.com/](https://git-scm.com/)

### 2. Configurar e Rodar o Back-end (API FastAPI)
* Crie e Ative o Ambiente Virtual:
  python -m venv venv

* Comando de ativação (escolha o do seu sistema):
* Windows:
.\venv\Scripts\activate

* Mac/Linux:
 source venv/bin/activate

# 2.1 Instale as Dependências Python:
# pip install -r requirements.txt

# 2.2 Inicie o Servidor da API:
# uvicorn main:app --reload (Mantenha este terminal aberto. O servidor rodará em http://127.0.0.1:8000)

### 3. Configurar e Rodar o Front-end (React + Vite)
Abra um NOVO terminal.
Navegue até a pasta do Front-end (a partir da raiz do projeto):
# cd Front-End

Instale as Dependências JavaScript:
# npm install

Inicie o Servidor de Desenvolvimento:
# npm run dev (Mantenha este segundo terminal aberto. O servidor rodará em http://localhost:5173)

### 4. Acessar a Aplicação
Com os dois terminais rodando (Uvicorn e Vite), abra seu navegador e acesse: http://localhost:5173
