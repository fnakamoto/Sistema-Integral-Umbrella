from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    telefone = db.Column(db.String(20), nullable=True)
    empresa = db.Column(db.String(100), nullable=True)
    cargo = db.Column(db.String(100), nullable=True)
    fonte = db.Column(db.String(50), nullable=True)
    etapa = db.Column(db.String(50), nullable=False, default='Primeiro contato')
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_ultima_interacao = db.Column(db.DateTime, default=datetime.utcnow)
    observacoes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='Ativo')  # Ativo, Convertido, Perdido
    
    def __repr__(self):
        return f'<Lead {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'telefone': self.telefone,
            'empresa': self.empresa,
            'cargo': self.cargo,
            'fonte': self.fonte,
            'etapa': self.etapa,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_ultima_interacao': self.data_ultima_interacao.isoformat() if self.data_ultima_interacao else None,
            'observacoes': self.observacoes,
            'status': self.status
        }

class Interacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('lead.id'), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # email, sms, whatsapp, telefone, reuniao
    canal = db.Column(db.String(50), nullable=True)  # ex: gmail, twilio, whatsapp_api
    assunto = db.Column(db.String(200), nullable=True)
    conteudo = db.Column(db.Text, nullable=True)
    data_envio = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Enviado')  # Enviado, Entregue, Lido, Respondido
    automatico = db.Column(db.Boolean, default=False)
    
    lead = db.relationship('Lead', backref=db.backref('interacoes', lazy=True))
    
    def __repr__(self):
        return f'<Interacao {self.tipo} para Lead {self.lead_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'lead_id': self.lead_id,
            'tipo': self.tipo,
            'canal': self.canal,
            'assunto': self.assunto,
            'conteudo': self.conteudo,
            'data_envio': self.data_envio.isoformat() if self.data_envio else None,
            'status': self.status,
            'automatico': self.automatico
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }



