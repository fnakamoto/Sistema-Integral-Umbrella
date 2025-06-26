from flask import Flask, render_template
from flask_cors import CORS
from src.models.lead import db
from src.routes.lead import lead_bp
from src.routes.user import user_bp
from src.routes.automation import automation_bp
import os

# Aponta corretamente para o index.html dentro de src/templates
app = Flask(__name__, template_folder='src/templates')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///leads.db'  # ou substitua pelo PostgreSQL do Railway
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

app.register_blueprint(lead_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(automation_bp, url_prefix='/api')

@app.route('/')
def index():
    return render_template('index.html')  # Carrega o HTML ao acessar "/"

@app.route("/api/dev/create-tabelas")
def criar_tabelas_temporario():
    try:
        db.create_all()
        return "Tabelas criadas com sucesso"
    except Exception as e:
        return f"Erro: {str(e)}", 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
