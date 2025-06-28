// templates.js - Templates de e-mail da Umbrella

const templatesEmail = [
  {
    id: 1,
    nome: "Boas-vindas",
    assunto: "Bem-vindo à Umbrella Marcas & Patentes",
    corpo: `Olá {{nome}},\n\nObrigado por escolher a Umbrella. Estamos prontos para ajudar com o seu registro de marca.\n\nAtenciosamente,\nEquipe Umbrella`,
  },
  {
    id: 2,
    nome: "Lembrete de pagamento",
    assunto: "Lembrete de pagamento - Processo {{processo}}",
    corpo: `Olá {{nome}},\n\nEste é um lembrete sobre o pagamento referente ao processo {{processo}}.\n\nPor favor, entre em contato se precisar de ajuda.\n\nAtenciosamente,\nEquipe Umbrella`,
  },
  {
    id: 3,
    nome: "Convite para reunião",
    assunto: "Agendamento de reunião - Umbrella Marcas",
    corpo: `Olá {{nome}},\n\nGostaríamos de agendar uma reunião para discutir o andamento do seu processo.\n\nPor favor, informe sua disponibilidade.\n\nAtenciosamente,\nEquipe Umbrella`,
  },
];

export default templatesEmail;
