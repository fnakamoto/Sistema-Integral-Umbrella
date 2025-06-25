import os
import sys
from pathlib import Path
from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.lead import db
from src.routes.user import user_bp
from src.routes.lead import lead_bp
from src.routes.automation import automation_bp

# Diretório base do projeto
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / 'src' / 'static'

# Criação da aplicação Flask
app = Flask(__name__, static_folder=str(STATIC_DIR))
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# Habilita CORS
CORS(app)

# Registro das rotas
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(lead_bp, url_prefix='/api')
app.register_blueprint(automation_bp, url_prefix='/api')

# Configuração do banco de dados
database_url = os.getenv('DATABASE_URL')
if database_url:
    # Railway - PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    # DEBUG: Imprime a URL do banco de dados (apenas uma parte por segurança)
    print(f"DEBUG: Usando DATABASE_URL do ambiente: {database_url[:20]}...") 
else:
    # Local - SQLite
    db_dir = BASE_DIR / 'database'
    db_dir.mkdir(exist_ok=True)
    sqlite_path = db_dir / 'app.db'
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{sqlite_path}"
    print(f"DEBUG: Usando SQLite local: {sqlite_path}")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicialização do banco
db.init_app(app)

# Criação das tabelas
with app.app_context():
    try:
        db.create_all()
        print("DEBUG: db.create_all() executado. Tabelas criadas ou já existentes.")
    except Exception as e:
        print(f"[ERRO] ao criar as tabelas: {e}")

# Rota principal (serve index.html da pasta static)
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# Serve arquivos estáticos (CSS, JS, imagens etc)
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

# Executa o app
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
