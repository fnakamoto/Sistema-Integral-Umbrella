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
    valor_negocio = db.Column(db.Numeric(10, 2), nullable=True) # Novo campo para valor do negócio
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_ultima_interacao = db.Column(db.DateTime, default=datetime.utcnow)
    observacoes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='Ativo')  # Ativo, Inativo, Convertido, Perdido
    
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
            'valor_negocio': float(self.valor_negocio) if self.valor_negocio is not None else None, # Incluído no dict
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

class TemplateEmail(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    etapa = db.Column(db.String(50), nullable=False)
    assunto = db.Column(db.String(200), nullable=False)
    conteudo = db.Column(db.Text, nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<TemplateEmail {self.etapa}>'

    def to_dict(self):
        return {
            'id': self.id,
            'etapa': self.etapa,
            'assunto': self.assunto,
            'conteudo': self.conteudo,
            'ativo': self.ativo,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class AgendamentoAutomacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('lead.id'), nullable=False)
    etapa = db.Column(db.String(50), nullable=False)
    data_agendamento = db.Column(db.DateTime, nullable=False)
    executado = db.Column(db.Boolean, default=False)
    data_execucao = db.Column(db.DateTime, nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    lead = db.relationship('Lead', backref=db.backref('agendamentos', lazy=True))
    
    def __repr__(self):
        return f'<AgendamentoAutomacao Lead {self.lead_id} - {self.etapa}>'

    def to_dict(self):
        return {
            'id': self.id,
            'lead_id': self.lead_id,
            'etapa': self.etapa,
            'data_agendamento': self.data_agendamento.isoformat() if self.data_agendamento else None,
            'executado': self.executado,
            'data_execucao': self.data_execucao.isoformat() if self.data_execucao else None,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
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
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

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
