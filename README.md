# Umbrella Leads Manager

Sistema de gestão de leads com automação de follow-ups desenvolvido para a Umbrella Marcas & Patentes.

## Funcionalidades

- ✅ Cadastro e gestão de leads
- ✅ Pipeline visual de vendas
- ✅ Automação de follow-ups por e-mail
- ✅ Templates personalizados por etapa
- ✅ Histórico de interações
- ✅ Interface responsiva

## Deploy no Railway.app

### 1. Preparação
1. Faça fork deste repositório no GitHub
2. Crie uma conta no [Railway.app](https://railway.app)
3. Conecte sua conta do GitHub ao Railway

### 2. Deploy da Aplicação
1. No Railway, clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha o repositório do Umbrella Leads Manager
4. O Railway detectará automaticamente que é uma aplicação Python

### 3. Configuração do Banco de Dados
1. No projeto do Railway, clique em "New Service"
2. Selecione "Database" > "PostgreSQL"
3. O Railway criará automaticamente um banco PostgreSQL
4. A variável `DATABASE_URL` será configurada automaticamente

### 4. Variáveis de Ambiente
Configure as seguintes variáveis no Railway:

```
SECRET_KEY=sua-chave-secreta-aqui
FLASK_ENV=production
```

### 5. Deploy Automático
- O Railway fará deploy automático a cada push no GitHub
- A aplicação estará disponível em uma URL fornecida pelo Railway

## Desenvolvimento Local

### Pré-requisitos
- Python 3.11+
- PostgreSQL (opcional, usa SQLite por padrão)

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd umbrella_leads_manager

# Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instale as dependências
python -m pip install -r requirements.txt

# Execute a aplicação
python src/main.py
```

A aplicação estará disponível em `http://localhost:5000`

## Estrutura do Projeto

```
umbrella_leads_manager/
├── src/
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── static/          # Arquivos estáticos (HTML, CSS, JS)
│   └── main.py          # Arquivo principal
├── requirements.txt     # Dependências Python
├── Procfile            # Configuração para deploy
├── railway.json        # Configuração do Railway
└── README.md           # Este arquivo
```

## API Endpoints

### Leads
- `GET /api/leads` - Lista todos os leads
- `POST /api/leads` - Cria um novo lead
- `PUT /api/leads/<id>` - Atualiza um lead
- `GET /api/pipeline` - Estatísticas do pipeline

### Automação
- `POST /api/automation/trigger-followup/<lead_id>` - Envia follow-up para um lead
- `POST /api/automation/batch-followup` - Follow-up em lote
- `GET /api/automation/leads-for-followup` - Lista leads que precisam de follow-up

## Configuração de E-mail

Para funcionalidade completa de envio de e-mails, configure:

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app
```

## Suporte

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

## Licença

Este projeto foi desenvolvido especificamente para a Umbrella Marcas & Patentes.