from flask import Flask, render_template
from flask_cors import CORS
from src.models.lead import db
from src.routes.lead import lead_bp
from src.routes.user import user_bp
from src.routes.automation import automation_bp
from src.models.lead import TemplateEmail
import os
from datetime import datetime

# Aponta para as pastas padrão de HTML e JS
app = Flask(__name__, template_folder='templates', static_folder='static')

# Banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///leads.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

# Blueprints
app.register_blueprint(lead_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(automation_bp, url_prefix='/api')

# Página principal
@app.route('/')
def index():
    return render_template('index.html')

# Rota dev: criar tabelas
@app.route("/api/dev/create-tabelas")
def criar_tabelas_temporario():
    try:
        db.create_all()
        return "Tabelas criadas com sucesso"
    except Exception as e:
        return f"Erro: {str(e)}", 500

# Rota dev: popular templates-padrão
@app.route('/api/dev/criar-templates-padrao')
def criar_templates_padrao():
    templates = [
        {'etapa': 'Primeiro contato', 'assunto': 'Primeiro contato com {{nome}}', 'conteudo': 'Olá {{nome}}, tudo bem? Gostaria de conhecer mais sobre sua empresa e como podemos colaborar.'},
        {'etapa': 'Apresentação comercial', 'assunto': 'Apresentação da Umbrella Marcas & Patentes', 'conteudo': 'Preparamos uma apresentação especial para você. Confira os serviços que podemos oferecer.'},
        {'etapa': 'Viabilidade', 'assunto': 'Viabilidade de Registro da Sua Marca', 'conteudo': 'Já analisamos sua marca e ela possui alta chance de aprovação! Vamos em frente?'},
        {'etapa': 'Proposta', 'assunto': 'Proposta Personalizada', 'conteudo': 'Conforme combinado, segue a proposta personalizada para registro da sua marca.'},
        {'etapa': 'Negociação', 'assunto': 'Dúvidas sobre a proposta?', 'conteudo': 'Estamos à disposição para esclarecer qualquer dúvida. Fale conosco.'},
        {'etapa': 'Follow-up', 'assunto': 'Ainda podemos registrar sua marca!', 'conteudo': 'Aproveite que os resultados da pesquisa são favoráveis e evite perder prioridade.'}
    ]

    for t in templates:
        existente = TemplateEmail.query.filter_by(etapa=t['etapa']).first()
        if not existente:
            novo = TemplateEmail(etapa=t['etapa'], assunto=t['assunto'], conteudo=t['conteudo'])
            db.session.add(novo)

    db.session.commit()
    return "Templates padrão criados com sucesso"

# Executa app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
