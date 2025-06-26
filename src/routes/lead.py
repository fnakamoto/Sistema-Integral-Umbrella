from flask import Blueprint, request, jsonify
from src.models.lead import db, Lead, Interacao, TemplateEmail, AgendamentoAutomacao
from datetime import datetime
from sqlalchemy import func # Importar func para usar funções de agregação como sum

lead_bp = Blueprint('lead', __name__)

@lead_bp.route('/leads', methods=['GET'])
def get_leads():
    """Retorna todos os leads"""
    status_filter = request.args.get('status')
    etapa_filter = request.args.get('etapa')
    
    query = Lead.query
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    if etapa_filter:
        query = query.filter_by(etapa=etapa_filter)
    
    leads = query.order_by(Lead.data_criacao.desc()).all()
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
        valor_negocio=data.get('valor_negocio'), # Adicionado o novo campo
        observacoes=data.get('observacoes'),
        status=data.get('status', 'Ativo')
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
    if data.get('telefone') is not None:
        lead.telefone = data['telefone']
    if data.get('empresa') is not None:
        lead.empresa = data['empresa']
    if data.get('cargo') is not None:
        lead.cargo = data['cargo']
    if data.get('fonte') is not None:
        lead.fonte = data['fonte']
    if data.get('etapa'):
        lead.etapa = data['etapa']
        lead.data_ultima_interacao = datetime.utcnow()
    if data.get('valor_negocio') is not None: # Adicionado o novo campo
        lead.valor_negocio = data['valor_negocio']
    if data.get('observacoes') is not None:
        lead.observacoes = data['observacoes']
    if data.get('status'):
        lead.status = data['status']
    
    db.session.commit()
    return jsonify(lead.to_dict())

@lead_bp.route('/leads/<int:lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    """Exclui um lead permanentemente"""
    lead = Lead.query.get_or_404(lead_id)
    
    # Excluir todas as interações relacionadas
    Interacao.query.filter_by(lead_id=lead_id).delete()
    
    # Excluir todos os agendamentos relacionados
    AgendamentoAutomacao.query.filter_by(lead_id=lead_id).delete()
    
    # Excluir o lead
    db.session.delete(lead)
    db.session.commit()
    
    return jsonify({'message': 'Lead excluído com sucesso'}), 200

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

@lead_bp.route('/leads/<int:lead_id>/agendamentos', methods=['GET'])
def get_lead_agendamentos(lead_id):
    """Retorna todos os agendamentos de um lead"""
    lead = Lead.query.get_or_404(lead_id)
    agendamentos = AgendamentoAutomacao.query.filter_by(lead_id=lead_id).order_by(AgendamentoAutomacao.data_agendamento.desc()).all()
    return jsonify([agendamento.to_dict() for agendamento in agendamentos])

@lead_bp.route('/leads/<int:lead_id>/agendamentos', methods=['POST'])
def create_agendamento(lead_id):
    """Cria um novo agendamento de automação para um lead"""
    lead = Lead.query.get_or_404(lead_id)
    data = request.get_json()
    
    if not data or not data.get('etapa') or not data.get('data_agendamento'):
        return jsonify({'error': 'Etapa e data de agendamento são obrigatórios'}), 400
    
    try:
        data_agendamento = datetime.fromisoformat(data['data_agendamento'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Formato de data inválido'}), 400
    
    agendamento = AgendamentoAutomacao(
        lead_id=lead_id,
        etapa=data.get('etapa'),
        data_agendamento=data_agendamento
    )
    
    db.session.add(agendamento)
    db.session.commit()
    
    return jsonify(agendamento.to_dict()), 201

@lead_bp.route('/pipeline', methods=['GET'])
def get_pipeline():
    """Retorna estatísticas do pipeline, incluindo a soma dos valores por etapa"""
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
    
    pipeline_data = {}
    for etapa in etapas:
        # Contagem de leads ativos na etapa
        count = Lead.query.filter_by(etapa=etapa, status='Ativo').count()
        
        # Soma dos valores de negócio ativos na etapa
        # Usamos func.coalesce para tratar casos onde valor_negocio é NULL, retornando 0.0
        # e .scalar() para obter o resultado da soma diretamente
        total_valor = db.session.query(func.sum(func.coalesce(Lead.valor_negocio, 0.0))).filter_by(etapa=etapa, status='Ativo').scalar()
        
        pipeline_data[etapa] = {
            'count': count,
            'total_valor': float(total_valor) if total_valor is not None else 0.0 # Garante que seja float ou 0.0
        }
    
    total_leads = Lead.query.filter_by(status='Ativo').count()
    total_inativos = Lead.query.filter_by(status='Inativo').count()
    total_convertidos = Lead.query.filter_by(status='Convertido').count()
    total_perdidos = Lead.query.filter_by(status='Perdido').count()
    
    return jsonify({
        'pipeline': pipeline_data,
        'total_leads': total_leads,
        'total_inativos': total_inativos,
        'total_convertidos': total_convertidos,
        'total_perdidos': total_perdidos
    })

@lead_bp.route('/etapas', methods=['GET'])
def get_etapas():
    """Retorna lista de etapas disponíveis"""
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
    return jsonify(etapas)

@lead_bp.route('/status', methods=['GET'])
def get_status():
    """Retorna lista de status disponíveis"""
    status = ['Ativo', 'Inativo', 'Convertido', 'Perdido']
    return jsonify(status)
    from flask import jsonify, request
from src.models.lead import db, Lead, ObservacaoLead

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

