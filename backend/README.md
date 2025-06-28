# Umbrella Backend

Backend do sistema Umbrella para gestão de leads, autenticação, exportação de dados, e integração com PostgreSQL.

---

## Tecnologias
  
- Node.js
- Express
- PostgreSQL (via Sequelize)
- Redis + Bull (fila de tarefas)
- JWT para autenticação
- Nodemailer para envio de emails
- Winston para logging
- Swagger para documentação da API

---

## Requisitos

- Node.js 18 ou superior
- PostgreSQL configurado e acessível
- Redis configurado para filas Bull
- Conta SMTP para envio de emails (ex: Hostinger)

---

## Configuração do projeto

1. Clone o repositório

```bash
git clone <url-do-seu-repositorio>
cd umbrella-backend

npm install

npm run dev

npm start

npm test

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
JWT_SECRET=sua_chave_secreta_super_forte
REDIS_URL=redis://default:SENHA@HOST_REDIS:6379
EMAIL_HOST=smtp.seuprovedor.com
EMAIL_PORT=587
EMAIL_USER=seu_email@provedor.com
EMAIL_PASS=sua_senha_email
PORT=3000

umbrella-backend/
├── config/            # Configurações do banco, permissões, etc.
├── middleware/        # Middlewares de autenticação e permissões
├── models/            # Models Sequelize
├── routes/            # Rotas da API
├── utils/             # Utilitários (logger, email, etc)
├── jobs/              # Jobs para filas Bull
├── tests/             # Testes automatizados
├── app.js             # Inicialização do Express
├── server.js          # Entrada do servidor
├── .env               # Variáveis de ambiente (não comitar)
├── .env.example       # Exemplo de variáveis para configuração
├── package.json       # Dependências e scripts
└── README.md          # Documentação do projeto

http://localhost:3000/api-docs


npm start

Contato
Fabiano Nakamoto
Email: fabiano@umbrellamarcas.com.br
Umbrella Marcas



