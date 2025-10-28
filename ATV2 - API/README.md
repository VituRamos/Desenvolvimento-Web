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
 ```Bash
  python -m venv venv
 ```

* Comando de ativação (escolha o do seu sistema):

Windows:
```Bash
.\venv\Scripts\activate
```

Mac/Linux:
```Bash
 source venv/bin/activate
```

* Instale as Dependências Python:
```Bash
pip install -r requirements.txt
```

* Inicie o Servidor da API:
```Bash
uvicorn main:app --reload
```
(Mantenha este terminal aberto. O servidor rodará em http://127.0.0.1:8000)

### 3. Configurar e Rodar o Front-end (React + Vite)
Abra um NOVO terminal.
Navegue até a pasta do Front-end (a partir da raiz do projeto):
```Bash
cd Front-End
```

Instale as Dependências JavaScript:
```Bash
npm install
```

Inicie o Servidor de Desenvolvimento (dentro da pasta Front-End):
```Bash
npm run dev
```
(Mantenha este segundo terminal aberto. O servidor rodará em http://localhost:5173)

### 4. Acessar a Aplicação
Com os dois terminais rodando (Uvicorn e Vite), abra seu navegador e acesse: http://localhost:5173


## 🖥️ Aplicação e Documentação

Link para Video API
```Bash
[https://drive.google.com/file/d/1bWrJM3AlmBT7pOHkSz6jBxPMKI5ALkXo/view?usp=sharing](https://drive.google.com/file/d/1bWrJM3AlmBT7pOHkSz6jBxPMKI5ALkXo/view?usp=sharing)
```

Link para PDF explicativo com as mudanças do Prototipo Avançado para o ATV2 - API
```Bash
https://drive.google.com/file/d/1ox5J02LHtzPKcq7NgdtOJCeq44HEKpGb/view?usp=sharing
```

Link para Slide de Apresentação
```Bash
https://gamma.app/docs/SimulAI-hkf3b17dwetm2tf?mode=doc
```













