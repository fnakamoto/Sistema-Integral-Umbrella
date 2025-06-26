from flask import Flask, render_template
from flask_cors import CORS
from src.models.lead import db
from src.routes.lead import lead_bp
from src.routes.user import user_bp
from src.routes.automation import automation_bp
import os

# Define onde estão os arquivos de frontend (templates e estáticos)
app = Flask(
    __name__,
    template_folder='src/templates',    # HTML
    static_folder='src/static'          # JS e CSS
)

# Configuração do banco
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///leads.db'  # ou substitua por PostgreSQL do Railway
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializações
db.init_app(app)
CORS(app)

# Rotas principais da API
app.register_blueprint(lead_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(automation_bp, url_prefix='/api')

# Rota visual principal
@app.route('/')
def index():
    return render_template('index.html')

# Rota auxiliar (temporária) para criar tabelas
@app.route("/api/dev/create-tabelas")
def criar_tabelas_temporario():
    try:
        db.create_all()
        return "Tabelas criadas com sucesso"
    except Exception as e:
        return f"Erro: {str(e)}", 500

# Início do app com compatibilidade para Railway
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
