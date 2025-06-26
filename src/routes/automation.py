from flask import Blueprint, request, jsonify
from src.models.lead import db, Lead, TemplateEmail, AgendamentoAutomacao
from datetime import datetime

automation_bp = Blueprint('automation_bp', __name__)

@automation_bp.route('/templates', methods=['GET'])
def listar_templates():
    templates = TemplateEmail.query.all()
    return jsonify([
        {
            'id': t.id,
            'etapa': t.etapa,
            'assunto': t.assunto,
            'conteudo': t.conteudo
        } for t in templates
    ])

@automation_bp.route('/agendamentos', methods=['POST'])
def agendar_automacao():
    data = request.get_json()
    agendamento = AgendamentoAutomacao(
        lead_id=data['lead_id'],
        template_id=data['template_id'],
        data_agendada=datetime.fromisoformat(data['data_agendada']),
        status='Pendente'
    )
    db.session.add(agendamento)
    db.session.commit()
    return jsonify({'message': 'Automação agendada com sucesso'}), 201

@automation_bp.route('/leads/<int:lead_id>/agendamentos', methods=['GET'])
def listar_agendamentos_do_lead(lead_id):
    agendamentos = AgendamentoAutomacao.query.filter_by(lead_id=lead_id).order_by(AgendamentoAutomacao.data_agendada).all()
    return jsonify([
        {
            'id': a.id,
            'template': {
                'id': a.template.id,
                'assunto': a.template.assunto,
                'conteudo': a.template.conteudo
            },
            'data_agendada': a.data_agendada.isoformat(),
            'status': a.status,
            'data_envio': a.data_envio.isoformat() if a.data_envio else None
        } for a in agendamentos
    ])

@automation_bp.route('/executar-agendamentos', methods=['POST'])
def executar_agendamentos():
    hoje = datetime.utcnow()
    pendentes = AgendamentoAutomacao.query.filter(
        AgendamentoAutomacao.status == 'Pendente',
        AgendamentoAutomacao.data_agendada <= hoje
    ).all()

    enviados = []
    for agendamento in pendentes:
        lead = agendamento.lead
        template = agendamento.template

        # Simulação do envio de e-mail
        print(f"Enviando e-mail para {lead.email} com assunto '{template.assunto}'")

        agendamento.status = 'Enviado'
        agendamento.data_envio = datetime.utcnow()
        enviados.append(agendamento.id)

    db.session.commit()
    return jsonify({'enviados': enviados})
