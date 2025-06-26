from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    empresa = db.Column(db.String(120))
    etapa = db.Column(db.String(80), default='Primeiro contato')
    valor_negocio = db.Column(db.Float)
    status = db.Column(db.String(20), default='Ativo')
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    interacoes = db.relationship('Interacao', backref='lead', lazy=True)
    observacoes = db.relationship('ObservacaoLead', backref='lead', lazy=True)

class Interacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('lead.id'), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    assunto = db.Column(db.String(255), nullable=False)
    conteudo = db.Column(db.Text)
    data_envio = db.Column(db.DateTime, default=datetime.utcnow)

class TemplateEmail(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    etapa = db.Column(db.String(80), nullable=False)
    assunto = db.Column(db.String(255), nullable=False)
    conteudo = db.Column(db.Text, nullable=False)

class AgendamentoAutomacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('lead.id'), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey('template_email.id'), nullable=False)
    data_agendada = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='Pendente')
    data_envio = db.Column(db.DateTime)

class ObservacaoLead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('lead.id'), nullable=False)
    conteudo = db.Column(db.Text, nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

