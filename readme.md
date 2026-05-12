# TechLens - Sistema de Gerenciamento CRUD com Redis

Este projeto é um sistema Fullstack composto por um backend em **FastAPI**, frontend em **Next.js** e banco de dados **Redis** rodando via Docker.

## Pré-requisitos
Antes de começar, você precisa ter instalado:
- [Python 3.10+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Como rodar o projeto (Passo a Passo)

### 1. Clonar o repositório

```bash
git clone <url-do-seu-repositorio>
cd TechLens
```

### 2. Subir o Banco de Dados (Redis)
Certifique-se de que o Docker Desktop está aberto.

```bash
cd backend
docker-compose up -d
```

### 3. Configurar o Backend (Python)

```bash
python -m venv venv

# Ativar venv (Windows)
.\venv\Scripts\activate

# Ativar venv (Linux/Mac)
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

O backend rodará em: http://localhost:8000

### 4. Configurar o Frontend (Next.js)
Abra outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend rodará em: http://localhost:3000

## Estrutura do Projeto

```text
TechLens/
├── backend/             # API FastAPI e Banco de Dados
│   ├── docker-compose.yml
│   ├── main.py
│   ├── database.py
│   ├── schemas.py
│   └── requirements.txt
├── frontend/            # Interface Next.js (App Router)
│   ├── app/             # Rotas e páginas do sistema
│   ├── public/          # Imagens e assets estáticos
│   ├── package.json
│   └── next.config.ts   # Configurações do Next
└── .gitignore           # Filtro de arquivos ignorados pelo Git