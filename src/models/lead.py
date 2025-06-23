from flask import Blueprint, request, jsonify
from src.models.lead import db, Lead, Interacao
from datetime import datetime

lead_bp = Blueprint('lead', __name__)

@lead_bp.route('/leads', methods=['GET'])
def get_leads():
    """Retorna todos os leads"""
    leads = Lead.query.all()
    return jsonify([lead.to_dict() for lead in leads])

@lead_bp.route('/leads', methods=['POST'])
def create_lead():
    """Cria um novo lead"""
    data = request.get_json()
    
    if not data or not data.get('nome') or not data.get('email'):
        return jsonify({'error': 'Nome e email são obrigatórios'}), 400
    
    lead = Lead(
        nome=data.get('nome'),
        email=data.get('email'),
        telefone=data.get('telefone'),
        empresa=data.get('empresa'),
        cargo=data.get('cargo'),
        fonte=data.get('fonte'),
        etapa=data.get('etapa', 'Primeiro contato'),
        observacoes=data.get('observacoes')
    )
    
    db.session.add(lead)
    db.session.commit()
    
    return jsonify(lead.to_dict()), 201

@lead_bp.route('/leads/<int:lead_id>', methods=['GET'])
def get_lead(lead_id):
    """Retorna um lead específico"""
    lead = Lead.query.get_or_404(lead_id)
    return jsonify(lead.to_dict())

@lead_bp.route('/leads/<int:lead_id>', methods=['PUT'])
def update_lead(lead_id):
    """Atualiza um lead"""
    lead = Lead.query.get_or_404(lead_id)
    data = request.get_json()
    
    if data.get('nome'):
        lead.nome = data['nome']
    if data.get('email'):
        lead.email = data['email']
    if data.get('telefone'):
        lead.telefone = data['telefone']
    if data.get('empresa'):
        lead.empresa = data['empresa']
    if data.get('cargo'):
        lead.cargo = data['cargo']
    if data.get('fonte'):
        lead.fonte = data['fonte']
    if data.get('etapa'):
        lead.etapa = data['etapa']
        lead.data_ultima_interacao = datetime.utcnow()
    if data.get('observacoes'):
        lead.observacoes = data['observacoes']
    if data.get('status'):
        lead.status = data['status']
    
    db.session.commit()
    return jsonify(lead.to_dict())

@lead_bp.route('/leads/<int:lead_id>/interacoes', methods=['GET'])
def get_lead_interacoes(lead_id):
    """Retorna todas as interações de um lead"""
    lead = Lead.query.get_or_404(lead_id)
    interacoes = Interacao.query.filter_by(lead_id=lead_id).order_by(Interacao.data_envio.desc()).all()
    return jsonify([interacao.to_dict() for interacao in interacoes])

@lead_bp.route('/leads/<int:lead_id>/interacoes', methods=['POST'])
def create_interacao(lead_id):
    """Cria uma nova interação para um lead"""
    lead = Lead.query.get_or_404(lead_id)
    data = request.get_json()
    
    if not data or not data.get('tipo'):
        return jsonify({'error': 'Tipo da interação é obrigatório'}), 400
    
    interacao = Interacao(
        lead_id=lead_id,
        tipo=data.get('tipo'),
        canal=data.get('canal'),
        assunto=data.get('assunto'),
        conteudo=data.get('conteudo'),
        status=data.get('status', 'Enviado'),
        automatico=data.get('automatico', False)
    )
    
    db.session.add(interacao)
    
    # Atualiza a data da última interação do lead
    lead.data_ultima_interacao = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify(interacao.to_dict()), 201

@lead_bp.route('/pipeline', methods=['GET'])
def get_pipeline():
    """Retorna estatísticas do pipeline"""
    etapas = [
        'Primeiro contato',
        'Apresentação comercial',
        'Viabilidade',
        'Proposta',
        'Negociação',
        'Cliente',
        'Follow-up',
        'Negócio perdido'
    ]
    
    pipeline = {}
    for etapa in etapas:
        count = Lead.query.filter_by(etapa=etapa, status='Ativo').count()
        pipeline[etapa] = count
    
    total_leads = Lead.query.filter_by(status='Ativo').count()
    total_convertidos = Lead.query.filter_by(status='Convertido').count()
    total_perdidos = Lead.query.filter_by(status='Perdido').count()
    
    return jsonify({
        'pipeline': pipeline,
        'total_leads': total_leads,
        'total_convertidos': total_convertidos,
        'total_perdidos': total_perdidos
    })

