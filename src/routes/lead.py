from flask import Blueprint, request, jsonify
from src.models.lead import db, Lead, Interacao, ObservacaoLead

lead_bp = Blueprint('lead_bp', __name__)

@lead_bp.route('/leads', methods=['GET'])
def listar_leads():
    leads = Lead.query.filter_by(status='Ativo').all()
    return jsonify([
        {
            'id': l.id,
            'nome': l.nome,
            'email': l.email,
            'empresa': l.empresa,
            'etapa': l.etapa,
            'valor_negocio': l.valor_negocio,
            'status': l.status,
            'data_criacao': l.data_criacao.isoformat()
        } for l in leads
    ])

@lead_bp.route('/leads', methods=['POST'])
def criar_lead():
    data = request.get_json()
    lead = Lead(
        nome=data['nome'],
        email=data['email'],
        empresa=data.get('empresa'),
        valor_negocio=data.get('valor_negocio'),
        etapa=data.get('etapa', 'Primeiro contato')
    )
    db.session.add(lead)
    db.session.commit()
    return jsonify({'id': lead.id}), 201

@lead_bp.route('/leads/<int:id>', methods=['PUT'])
def atualizar_lead(id):
    data = request.get_json()
    lead = Lead.query.get_or_404(id)
    lead.etapa = data.get('etapa', lead.etapa)
    lead.status = data.get('status', lead.status)
    db.session.commit()
    return jsonify({'message': 'Lead atualizado com sucesso'})

@lead_bp.route('/pipeline', methods=['GET'])
def estatisticas_pipeline():
    etapas = [
        'Primeiro contato', 'Apresentação comercial', 'Viabilidade',
        'Proposta', 'Negociação', 'Cliente', 'Follow-up', 'Negócio perdido'
    ]
    pipeline = {}
    total_leads = 0
    total_valor = 0

    for etapa in etapas:
        leads = Lead.query.filter_by(etapa=etapa, status='Ativo').all()
        count = len(leads)
        valor_total = sum([l.valor_negocio or 0 for l in leads])
        pipeline[etapa] = {'count': count, 'total_valor': valor_total}
        total_leads += count
        total_valor += valor_total

    return jsonify({
        'pipeline': pipeline,
        'total_leads': total_leads,
        'total_valor': total_valor
    })

@lead_bp.route('/leads/<int:lead_id>/interacoes', methods=['GET'])
def listar_interacoes(lead_id):
    interacoes = Interacao.query.filter_by(lead_id=lead_id).order_by(Interacao.data_envio.desc()).all()
    return jsonify([
        {
            'tipo': i.tipo,
            'assunto': i.assunto,
            'conteudo': i.conteudo,
            'data_envio': i.data_envio.isoformat()
        } for i in interacoes
    ])

@lead_bp.route('/leads/<int:lead_id>/observacoes', methods=['GET'])
def listar_observacoes(lead_id):
    observacoes = ObservacaoLead.query.filter_by(lead_id=lead_id).order_by(ObservacaoLead.data_criacao.desc()).all()
    return jsonify([
        {
            'id': o.id,
            'conteudo': o.conteudo,
            'data_criacao': o.data_criacao.isoformat()
        } for o in observacoes
    ])

@lead_bp.route('/leads/<int:lead_id>/observacoes', methods=['POST'])
def adicionar_observacao(lead_id):
    dados = request.get_json()
    conteudo = dados.get('conteudo')
    if not conteudo:
        return jsonify({'error': 'Conteúdo obrigatório'}), 400

    nova_obs = ObservacaoLead(lead_id=lead_id, conteudo=conteudo)
    db.session.add(nova_obs)
    db.session.commit()

    return jsonify({
        'id': nova_obs.id,
        'conteudo': nova_obs.conteudo,
        'data_criacao': nova_obs.data_criacao.isoformat()
    }), 201
