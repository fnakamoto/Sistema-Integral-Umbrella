from flask import Blueprint, request, jsonify
from src.models.lead import db, Lead, Interacao, TemplateEmail, AgendamentoAutomacao
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import re

automation_bp = Blueprint('automation', __name__)

# Configurações de e-mail (em produção, usar variáveis de ambiente)
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
EMAIL_USER = os.getenv('EMAIL_USER', 'contato@umbrellamarcas.com.br')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')

def substituir_variaveis(texto, lead):
    """Substitui variáveis dinâmicas no texto do template"""
    variaveis = {
        '{nome}': lead.nome,
        '{email}': lead.email,
        '{empresa}': lead.empresa or 'sua empresa',
        '{telefone}': lead.telefone or '',
        '{cargo}': lead.cargo or '',
        '{etapa}': lead.etapa
    }
    
    texto_processado = texto
    for variavel, valor in variaveis.items():
        texto_processado = texto_processado.replace(variavel, valor)
    
    return texto_processado

def enviar_email(destinatario, assunto, conteudo):
    """Função para enviar e-mail"""
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = destinatario
        msg['Subject'] = assunto
        
        msg.attach(MIMEText(conteudo, 'html'))
        
        # --- MUDANÇA AQUI: Usando SMTP_SSL para porta 465 ---
        # Se a porta for 465, usa SMTP_SSL (conexão SSL/TLS implícita)
        if SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        # Caso contrário, usa SMTP normal e STARTTLS (conexão TLS explícita)
        else:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
        # --- FIM DA MUDANÇA ---

        server.login(EMAIL_USER, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_USER, destinatario, text)
        server.quit()
        
        print(f"DEBUG: E-mail enviado com sucesso para {destinatario}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"ERRO SMTP: Falha de autenticação para {EMAIL_USER}. Verifique EMAIL_PASSWORD (use senha de aplicativo se necessário). Erro: {e}")
        return False
    except smtplib.SMTPConnectError as e:
        print(f"ERRO SMTP: Falha ao conectar ao servidor SMTP {SMTP_SERVER}:{SMTP_PORT}. Verifique o servidor e a porta. Erro: {e}")
        return False
    except smtplib.SMTPException as e:
        print(f"ERRO SMTP: Ocorreu um erro SMTP ao enviar e-mail. Erro: {e}")
        return False
    except Exception as e:
        print(f"ERRO GERAL: Erro inesperado ao enviar e-mail. Erro: {e}")
        return False

@automation_bp.route('/templates', methods=['GET'])
def get_templates():
    """Retorna todos os templates de e-mail"""
    templates = TemplateEmail.query.filter_by(ativo=True).all()
    return jsonify([template.to_dict() for template in templates])

@automation_bp.route('/templates', methods=['POST'])
def create_template():
    """Cria um novo template de e-mail"""
    data = request.get_json()
    
    if not data or not data.get('etapa') or not data.get('assunto') or not data.get('conteudo'):
        return jsonify({'error': 'Etapa, assunto e conteúdo são obrigatórios'}), 400
    
    # Verificar se já existe um template ativo para esta etapa
    template_existente = TemplateEmail.query.filter_by(etapa=data['etapa'], ativo=True).first()
    if template_existente:
        # Desativar o template existente
        template_existente.ativo = False
    
    template = TemplateEmail(
        etapa=data.get('etapa'),
        assunto=data.get('assunto'),
        conteudo=data.get('conteudo'),
        ativo=True
    )
    
    db.session.add(template)
    db.session.commit()
    
    return jsonify(template.to_dict()), 201

@automation_bp.route('/templates/<int:template_id>', methods=['PUT'])
def update_template(template_id):
    """Atualiza um template de e-mail"""
    template = TemplateEmail.query.get_or_404(template_id)
    data = request.get_json()
    
    if data.get('assunto'):
        template.assunto = data['assunto']
    if data.get('conteudo'):
        template.conteudo = data['conteudo']
    if data.get('ativo') is not None:
        template.ativo = data['ativo']
    
    template.data_atualizacao = datetime.utcnow()
    db.session.commit()
    
    return jsonify(template.to_dict())

@automation_bp.route('/templates/etapa/<etapa>', methods=['GET'])
def get_template_by_etapa(etapa):
    """Retorna o template ativo para uma etapa específica"""
    template = TemplateEmail.query.filter_by(etapa=etapa, ativo=True).first()
    if not template:
        return jsonify({'error': 'Template não encontrado para esta etapa'}), 404
    return jsonify(template.to_dict())

@automation_bp.route('/automation/trigger-followup/<int:lead_id>', methods=['POST'])
def trigger_followup(lead_id):
    """
    Dispara follow-up. Pode usar um template_id específico ou o template da etapa do lead.
    """
    lead = Lead.query.get_or_404(lead_id)
    data = request.get_json()
    template_id = data.get('template_id') if data else None # Pega o template_id do corpo da requisição

    template_db = None
    if template_id:
        template_db = TemplateEmail.query.get(template_id)
        if not template_db:
            return jsonify({'error': 'Template especificado não encontrado'}), 404
    else:
        # Se nenhum template_id for fornecido, busca o template personalizado para a etapa
        template_db = TemplateEmail.query.filter_by(etapa=lead.etapa, ativo=True).first()
    
    assunto = None
    conteudo = None

    if template_db:
        assunto = substituir_variaveis(template_db.assunto, lead)
        conteudo = substituir_variaveis(template_db.conteudo, lead)
    else:
        # Templates padrão caso não existam personalizados ou template_id inválido
        templates_padrao = {
            'Primeiro contato': {
                'assunto': 'Bem-vindo à Umbrella Marcas, {nome}!',
                'conteudo': f"""
                <html>
                <body>
                    <h2>Olá {{nome}}!</h2>
                    <p>Muito obrigado pelo seu interesse nos serviços da Umbrella Marcas & Patentes.</p>
                    <p>Somos especialistas em registro de marcas e propriedade intelectual, e nosso propósito é proteger o seu sonho!</p>
                    <p>Em breve, um de nossos especialistas entrará em contato para apresentar nossas soluções personalizadas para {{empresa}}.</p>
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
                'assunto': 'Dúvidas sobre nossa apresentação, {nome}?',
                'conteudo': f"""
                <html>
                <body>
                    <h2>Olá {{nome}}!</h2>
                    <p>Esperamos que tenha tido a oportunidade de revisar nossa apresentação comercial.</p>
                    <p>Caso tenha alguma dúvida ou precise de esclarecimentos adicionais, estamos à disposição!</p>
                    <p>Nossos especialistas podem agendar uma conversa para discutir como podemos ajudar {{empresa}} a proteger sua marca.</p>
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
        
        template_padrao = templates_padrao.get(lead.etapa)
        if not template_padrao:
            return jsonify({'error': 'Template não encontrado para esta etapa e nenhum template_id válido fornecido'}), 400
        
        assunto = substituir_variaveis(template_padrao['assunto'], lead)
        conteudo = substituir_variaveis(template_padrao['conteudo'], lead)
    
    # Verificar se já foi enviado um follow-up recente para evitar duplicatas
    ultima_interacao = Interacao.query.filter_by(
        lead_id=lead_id,
        tipo='email',
        automatico=True
    ).order_by(Interacao.data_envio.desc()).first()
    
    if ultima_interacao and ultima_interacao.data_envio > datetime.utcnow() - timedelta(hours=24):
        return jsonify({'error': 'Follow-up já enviado nas últimas 24 horas'}), 400
    
    # ATIVAR O ENVIO REAL DE E-MAIL AQUI
    sucesso = enviar_email(lead.email, assunto, conteudo)
    
    if sucesso:
        # Registrar a interação
        interacao = Interacao(
            lead_id=lead_id,
            tipo='email',
            canal='automation',
            assunto=assunto,
            conteudo=conteudo,
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
        return jsonify({'error': 'Falha ao enviar e-mail. Verifique as configurações SMTP e os logs.'}), 500

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

@automation_bp.route('/automation/agendamentos-pendentes', methods=['GET'])
def get_agendamentos_pendentes():
    """Retorna agendamentos pendentes de execução"""
    agora = datetime.utcnow()
    agendamentos = AgendamentoAutomacao.query.filter(
        AgendamentoAutomacao.executado == False,
        AgendamentoAutomacao.data_agendamento <= agora
    ).all()
    
    return jsonify([agendamento.to_dict() for agendamento in agendamentos])

@automation_bp.route('/automation/executar-agendamentos', methods=['POST'])
def executar_agendamentos():
    """Executa agendamentos pendentes"""
    agendamentos_response = get_agendamentos_pendentes()
    agendamentos_data = agendamentos_response.get_json()
    
    resultados = []
    
    for agendamento_data in agendamentos_data:
        agendamento_id = agendamento_data['id']
        lead_id = agendamento_data['lead_id']
        
        try:
            # Executar follow-up
            response = trigger_followup(lead_id)
            
            # Marcar agendamento como executado
            agendamento = AgendamentoAutomacao.query.get(agendamento_id)
            agendamento.executado = True
            agendamento.data_execucao = datetime.utcnow()
            db.session.commit()
            
            if response[1] == 200:
                resultados.append({
                    'agendamento_id': agendamento_id,
                    'lead_id': lead_id,
                    'status': 'sucesso'
                })
            else:
                resultados.append({
                    'agendamento_id': agendamento_id,
                    'lead_id': lead_id,
                    'status': 'erro',
                    'erro': response[0].get_json().get('error', 'Erro desconhecido')
                })
                
        except Exception as e:
            resultados.append({
                'agendamento_id': agendamento_id,
                'lead_id': lead_id,
                'status': 'erro',
                'erro': str(e)
            })
    
    return jsonify({
        'total_processados': len(resultados),
        'resultados': resultados
    })

@automation_bp.route('/automation/inicializar-templates', methods=['POST'])
def inicializar_templates():
    """Inicializa templates padrão no banco de dados"""
    templates_padrao = [
        {
            'etapa': 'Primeiro contato',
            'assunto': 'Bem-vindo à Umbrella Marcas, {nome}!',
            'conteudo': '''
            <html>
            <body>
                <h2>Olá {nome}!</h2>
                <p>Muito obrigado pelo seu interesse nos serviços da Umbrella Marcas & Patentes.</p>
                <p>Somos especialistas em registro de marcas e propriedade intelectual, e nosso propósito é proteger o seu sonho!</p>
                <p>Em breve, um de nossos especialistas entrará em contato para apresentar nossas soluções personalizadas para {empresa}.</p>
                <p>Enquanto isso, fique à vontade para conhecer mais sobre nossos serviços.</p>
                <br>
                <p>Atenciosamente,<br>
                Equipe Umbrella Marcas & Patentes</p>
                <p>WhatsApp: (43) 9.9978-6664<br>
                Email: contato@umbrellamarcas.com.br</p>
            </body>
            </html>
            '''
        },
        {
            'etapa': 'Apresentação comercial',
            'assunto': 'Dúvidas sobre nossa apresentação, {nome}?',
            'conteudo': '''
            <html>
            <body>
                <h2>Olá {nome}!</h2>
                <p>Esperamos que tenha tido a oportunidade de revisar nossa apresentação comercial.</p>
                <p>Caso tenha alguma dúvida ou precise de esclarecimentos adicionais, estamos à disposição!</p>
                <p>Nossos especialistas podem agendar uma conversa para discutir como podemos ajudar {{empresa}} a proteger sua marca.</p>
                <br>
                <p>Atenciosamente,<br>
                Equipe Umbrella Marcas & Patentes</p>
                <p>WhatsApp: (43) 9.9978-6664<br>
                Email: contato@umbrellamarcas.com.br</p>
            </body>
            </html>
            '''
        },
        {
            'etapa': 'Viabilidade',
            'assunto': 'Análise de viabilidade - Próximos passos, {nome}',
            'conteudo': '''
            <html>
            <body>
                <h2>Olá {nome}!</h2>
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
            '''
        },
        {
            'etapa': 'Proposta',
            'assunto': 'Proposta comercial - Vamos proteger sua marca, {nome}?',
            'conteudo': '''
            <html>
            <body>
                <h2>Olá {nome}!</h2>
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
            '''
        },
        {
            'etapa': 'Follow-up',
            'assunto': 'Ainda interessado em proteger sua marca, {nome}?',
            'conteudo': '''
            <html>
            <body>
                <h2>Olá {nome}!</h2>
                <p>Notamos que faz um tempo que não conversamos sobre o registro de sua marca.</p>
                <p>Sabemos que às vezes os projetos ficam em standby, mas queremos lembrar que estamos aqui quando você estiver pronto.</p>
                <p>A proteção da marca é fundamental para o crescimento seguro de {empresa}, e nossa equipe continua à disposição para ajudar.</p>
                <p>Se houver interesse em retomar a conversa, é só entrar em contato!</p>
                <br>
                <p>Atenciosamente,<br>
                Equipe Umbrella Marcas & Patentes</p>
                <p>WhatsApp: (43) 9.9978-6664<br>
                Email: contato@umbrellamarcas.com.br</p>
            </body>
            </html>
            '''
        }
    ]
    
    templates_criados = 0
    
    for template_data in templates_padrao:
        # Verificar se já existe um template para esta etapa
        template_existente = TemplateEmail.query.filter_by(etapa=template_data['etapa']).first()
        
        if not template_existente:
            template = TemplateEmail(
                etapa=template_data['etapa'],
                assunto=template_data['assunto'],
                conteudo=template_data['conteudo'],
                ativo=True
            )
            db.session.add(template)
            templates_criados += 1
    
    db.session.commit()
    
    return jsonify({
        'message': f'{templates_criados} templates inicializados com sucesso',
        'templates_criados': templates_criados
    })

