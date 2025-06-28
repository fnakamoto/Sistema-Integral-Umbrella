await enviarEmail({
  to: email,
  subject: 'Recebemos seus dados!',
  templateName: 'novoLead.html',
  templateData: {
    nome,
    email,
    telefone,
    responsavel,
  },
});
