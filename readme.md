# TechLens - Sistema de Gerenciamento Fullstack com Redis

Este projeto é um monitor de telemetria composto por um backend em **FastAPI**, frontend em **Next.js** (com Cache Global) e banco de dados **Redis** rodando via Docker.

## Pré-requisitos
Antes de começar, você precisa ter instalado:
- [Python 3.10+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Como rodar o projeto

### 1. Banco de Dados (Redis) e Servidor (FastAPI)
Abra um terminal na pasta `backend`:
```bash
docker-compose up -d
python -m venv venv

# Ativar venv
.\venv\Scripts\activate      # Windows
source venv/bin/activate    # Linux/Mac

pip install -r requirements.txt
uvicorn main:app --reload
```
*O backend rodará em: http://localhost:8000*

### 2. Rodar o Simulador de Telemetria
Abra outro terminal na pasta `backend`, ative o ambiente virtual (`venv`) e execute:
```bash
python simulador.py
```

### 3. Interface Web (Next.js)
Abra outro terminal na pasta `frontend`:
```bash
npm install
npm run dev
```
*O frontend rodará em: http://localhost:3000 (todas as dependências, incluindo `lucide-react`, são auto-instaladas no `npm install`)*

---

## Estrutura do Projeto

```text
TechLens/
├── backend/                  # API FastAPI e Simulador
│   ├── docker-compose.yml    # Redis Container
│   ├── main.py               # Endpoints REST e Autenticação
│   ├── database.py           # Conexão Redis
│   ├── schemas.py            # Validação Pydantic
│   ├── simulador.py          # Daemon de Telemetria Circular
│   └── requirements.txt      # Dependências Python
└── frontend/                 # Next.js App Router
    ├── app/
    │   ├── context/          # TelemetryContext (Cache Global)
    │   ├── components/       # Componentes Visuais e Dashboard
    │   ├── home/             # Página Principal (/home)
    │   ├── layout.tsx        # Layout Geral
    │   └── page.tsx          # Landing Page (Lente Magnética)
    ├── package.json          # Dependências (lucide-react, etc.)
    └── next.config.ts        # Configurações Next.js
```
