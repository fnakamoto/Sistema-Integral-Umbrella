# Umbrella Leads Manager

Sistema de gestão de leads com automação de follow-ups, desenvolvido para a Umbrella Marcas & Patentes.

---

## 🔧 Funcionalidades

- ✅ Cadastro e gestão de leads
- ✅ Pipeline visual de vendas
- ✅ Automação de follow-ups por e-mail
- ✅ Templates personalizados por etapa
- ✅ Histórico de interações
- ✅ Interface responsiva (HTML estático)

---

## 🚀 Deploy no Railway

### 1. Requisitos iniciais
1. Faça fork deste repositório no GitHub
2. Crie uma conta gratuita em [Railway.app](https://railway.app)
3. Conecte sua conta do GitHub ao Railway

### 2. Deploy da aplicação
1. No Railway, clique em **New Project**
2. Selecione **Deploy from GitHub repo**
3. Escolha o repositório do Umbrella Leads Manager
4. O Railway detectará automaticamente que é uma aplicação Python (graças ao `runtime.txt`)

### 3. Configuração do banco de dados
1. No projeto Railway, clique em **New > Database > PostgreSQL**
2. O Railway criará e conectará o banco ao backend automaticamente
3. A variável `DATABASE_URL` será definida e usada pela aplicação

### 4. Variáveis de ambiente
Adicione no painel `Variables` do Railway:

```env
SECRET_KEY=sua-chave-secreta
FLASK_ENV=production
```

> Para e-mail, veja [Configuração de E-mail](#📤-configuração-de-e-mail-hostinger)

### 5. Deploy contínuo
- Todo `git push` na branch `main` dispara um novo deploy automaticamente.
- A aplicação estará disponível em uma URL como `https://projeto.up.railway.app`

---

## 🧪 Desenvolvimento local

### Pré-requisitos
- Python 3.11 ou superior
- Git
- SQLite (opcional, já incluso por padrão no Python)

### Passos
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema_crm_umbrella.git
cd sistema_crm_umbrella

# Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate     # Linux/Mac
venv\Scripts\activate      # Windows

# Instale as dependências
pip install -r requirements.txt

# Execute a aplicação
python main.py
```

> A aplicação será acessível em `http://localhost:5000`

---

## 📁 Estrutura do projeto

```
sistema_crm_umbrella/
├── main.py
├── requirements.txt
├── runtime.txt
├── railway.json
├── src/
│   ├── models/
│   │   └── lead.py
│   ├── routes/
│   │   ├── user.py
│   │   ├── lead.py
│   │   └── automation.py
│   └── static/
│       └── index.html
└── README.md
```

---

## 🔌 API Endpoints

### Leads
| Método | Rota                | Descrição                   |
|--------|---------------------|-----------------------------|
| GET    | `/api/leads`        | Lista todos os leads        |
| POST   | `/api/leads`        | Cria novo lead              |
| PUT    | `/api/leads/<id>`   | Atualiza lead existente     |
| GET    | `/api/pipeline`     | Estatísticas do pipeline    |

### Automação
| Método | Rota                                       | Descrição                           |
|--------|--------------------------------------------|-------------------------------------|
| POST   | `/api/automation/trigger-followup/<id>`    | Dispara e-mail de follow-up         |
| POST   | `/api/automation/batch-followup`           | Follow-up em lote                   |
| GET    | `/api/automation/leads-for-followup`       | Lista leads prontos para follow-up  |

---

## 📤 Configuração de e-mail (Hostinger)

Para ativar o envio automático de e-mails com seu domínio da Umbrella (via Hostinger), adicione as variáveis abaixo no painel do Railway:

```env
SMTP_SERVER=smtp.hostinger.com
SMTP_PORT=587
EMAIL_USER=fabiano@umbrellamarcas.com.br
EMAIL_PASSWORD=Vtc@Vz+0
```

> ✅ **Importante:**
> - Use a senha normal do e-mail, ou uma senha de aplicativo se configurado.
> - A porta `587` utiliza **STARTTLS**, que é suportada pela maioria dos serviços.
> - Certifique-se de que o domínio está com **DNS e SPF configurados corretamente** na Hostinger para evitar bloqueios de envio (SPAM).

---

## 💬 Suporte

Este projeto foi desenvolvido para uso interno da **Umbrella Marcas & Patentes**.  
Em caso de dúvidas ou sugestões, entre em contato com a equipe técnica responsável.

---

## 🛡️ Licença

Distribuição e uso restritos à Umbrella Marcas & Patentes.
