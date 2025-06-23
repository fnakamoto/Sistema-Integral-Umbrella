from flask import Blueprint, request, jsonify
from src.models.lead import db, Lead, Interacao
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

automation_bp = Blueprint('automation', __name__)

# Configurações de e-mail (em produção, usar variáveis de ambiente)
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
EMAIL_USER = os.getenv('EMAIL_USER', 'contato@umbrellamarcas.com.br')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')

def enviar_email(destinatario, assunto, conteudo):
    """Função para enviar e-mail"""
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = destinatario
        msg['Subject'] = assunto
        
        msg.attach(MIMEText(conteudo, 'html'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_USER, destinatario, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")
        return False

@automation_bp.route('/automation/trigger-followup/<int:lead_id>', methods=['POST'])
def trigger_followup(lead_id):
    """Dispara follow-up automático baseado na etapa do lead"""
    lead = Lead.query.get_or_404(lead_id)
    
    templates = {
        'Primeiro contato': {
            'assunto': 'Bem-vindo à Umbrella Marcas!',
            'conteudo': f"""
            <html>
            <body>
                <h2>Olá {lead.nome}!</h2>
                <p>Muito obrigado pelo seu interesse nos serviços da Umbrella Marcas & Patentes.</p>
                <p>Somos especialistas em registro de marcas e propriedade intelectual, e nosso propósito é proteger o seu sonho!</p>
                <p>Em breve, um de nossos especialistas entrará em contato para apresentar nossas soluções personalizadas para sua empresa.</p>
                <p>Enquanto isso, fique à vontade para conhecer mais sobre nossos serviços.</p>
                <br>
                <p>Atenciosamente,<br>
                Equipe Umbrella Marcas & Patentes</p>
                <p>WhatsApp: (43) 9.9978-6664<br>
                Email: contato@umbrellamarcas.com.br</p>
            </body>
            </html>
            """
        },
        'Apresentação comercial': {
            'assunto': 'Dúvidas sobre nossa apresentação?',
            'conteudo': f"""
            <html>
            <body>
                <h2>Olá {lead.nome}!</h2>
                <p>Esperamos que tenha tido a oportunidade de revisar nossa apresentação comercial.</p>
                <p>Caso tenha alguma dúvida ou precise de esclarecimentos adicionais, estamos à disposição!</p>
                <p>Nossos especialistas podem agendar uma conversa para discutir como podemos ajudar sua empresa a proteger sua marca.</p>
                <br>
                <p>Atenciosamente,<br>
                Equipe Umbrella Marcas & Patentes</p>
                <p>WhatsApp: (43) 9.9978-6664<br>
                Email: contato@umbrellamarcas.com.br</p>
            </body>
            </html>
            """
        },
        'Viabilidade': {
            'assunto': 'Análise de viabilidade - Próximos passos',
            'conteudo': f"""
            <html>
            <body>
                <h2>Olá {lead.nome}!</h2>
                <p>Enviamos recentemente a análise de viabilidade para o registro de sua marca.</p>
                <p>Este documento é fundamental para entender as chances de sucesso do seu registro no INPI.</p>
                <p>Caso tenha alguma dúvida sobre o relatório ou queira discutir os próximos passos, estamos à disposição para uma conversa.</p>
                <br>
                <p>Atenciosamente,<br>
                Equipe Umbrella Marcas & Patentes</p>
                <p>WhatsApp: (43) 9.9978-6664<br>
                Email: contato@umbrellamarcas.com.br</p>
            </body>
            </html>
            """
        },
        'Proposta': {
            'assunto': 'Proposta comercial - Vamos proteger sua marca?',
            'conteudo': f"""
            <html>
            <body>
                <h2>Olá {lead.nome}!</h2>
                <p>Esperamos que nossa proposta comercial tenha atendido às suas expectativas.</p>
                <p>Sabemos que proteger sua marca é um investimento importante, e estamos aqui para tornar esse processo o mais simples e transparente possível.</p>
                <p>Caso precise de algum ajuste na proposta ou tenha dúvidas sobre nossos serviços, ficaremos felizes em conversar.</p>
                <br>
                <p>Atenciosamente,<br>
                Equipe Umbrella Marcas & Patentes</p>
                <p>WhatsApp: (43) 9.9978-6664<br>
                Email: contato@umbrellamarcas.com.br</p>
            </body>
            </html>
            """
        },
        'Follow-up': {
            'assunto': 'Ainda interessado em proteger sua marca?',
            'conteudo': f"""
            <html>
            <body>
                <h2>Olá {lead.nome}!</h2>
                <p>Notamos que faz um tempo que não conversamos sobre o registro de sua marca.</p>
                <p>Sabemos que às vezes os projetos ficam em standby, mas queremos lembrar que estamos aqui quando você estiver pronto.</p>
                <p>A proteção da marca é fundamental para o crescimento seguro do seu negócio, e nossa equipe continua à disposição para ajudar.</p>
                <p>Se houver interesse em retomar a conversa, é só entrar em contato!</p>
                <br>
                <p>Atenciosamente,<br>
                Equipe Umbrella Marcas & Patentes</p>
                <p>WhatsApp: (43) 9.9978-6664<br>
                Email: contato@umbrellamarcas.com.br</p>
            </body>
            </html>
            """
        }
    }
    
    template = templates.get(lead.etapa)
    if not template:
        return jsonify({'error': 'Template não encontrado para esta etapa'}), 400
    
    # Simular envio de e-mail (em produção, usar configurações reais)
    sucesso = True  # enviar_email(lead.email, template['assunto'], template['conteudo'])
    
    if sucesso:
        # Registrar a interação
        interacao = Interacao(
            lead_id=lead_id,
            tipo='email',
            canal='automation',
            assunto=template['assunto'],
            conteudo=template['conteudo'],
            automatico=True,
            status='Enviado'
        )
        
        db.session.add(interacao)
        lead.data_ultima_interacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Follow-up enviado com sucesso',
            'interacao': interacao.to_dict()
        })
    else:
        return jsonify({'error': 'Falha ao enviar e-mail'}), 500

@automation_bp.route('/automation/leads-for-followup', methods=['GET'])
def leads_for_followup():
    """Retorna leads que precisam de follow-up automático"""
    dias_limite = int(request.args.get('dias', 3))
    data_limite = datetime.utcnow() - timedelta(days=dias_limite)
    
    # Buscar leads que não tiveram interação recente
    leads = Lead.query.filter(
        Lead.status == 'Ativo',
        Lead.data_ultima_interacao < data_limite,
        Lead.etapa.in_(['Primeiro contato', 'Apresentação comercial', 'Viabilidade', 'Proposta', 'Follow-up'])
    ).all()
    
    return jsonify([lead.to_dict() for lead in leads])

@automation_bp.route('/automation/batch-followup', methods=['POST'])
def batch_followup():
    """Executa follow-up em lote para leads elegíveis"""
    data = request.get_json()
    dias_limite = data.get('dias', 3)
    
    leads_for_followup_response = leads_for_followup()
    leads_data = leads_for_followup_response.get_json()
    
    resultados = []
    
    for lead_data in leads_data:
        lead_id = lead_data['id']
        try:
            response = trigger_followup(lead_id)
            if response[1] == 200:  # Status code 200
                resultados.append({
                    'lead_id': lead_id,
                    'nome': lead_data['nome'],
                    'status': 'sucesso'
                })
            else:
                resultados.append({
                    'lead_id': lead_id,
                    'nome': lead_data['nome'],
                    'status': 'erro',
                    'erro': response[0].get_json().get('error', 'Erro desconhecido')
                })
        except Exception as e:
            resultados.append({
                'lead_id': lead_id,
                'nome': lead_data['nome'],
                'status': 'erro',
                'erro': str(e)
            })
    
    return jsonify({
        'total_processados': len(resultados),
        'resultados': resultados
    })

