const Queue = require("bull");
const path = require("path");
const fs = require("fs");
const { createObjectCsvWriter } = require("csv-writer");
const { Lead } = require("../models");
const logger = require("../utils/logger");

const exportQueue = new Queue("exportQueue", process.env.REDIS_URL);

exportQueue.process(async () => {
  try {
    const leads = await Lead.findAll();

    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, "..", "exports", `leads_${Date.now()}.csv`),
      header: [
        { id: "nome", title: "Nome" },
        { id: "email", title: "Email" },
        { id: "telefone", title: "Telefone" },
        { id: "etapa", title: "Etapa" },
        { id: "createdAt", title: "Criado Em" },
      ],
    });

    await csvWriter.writeRecords(leads.map(lead => lead.toJSON()));
    logger.info("Exportação diária concluída com sucesso.");
  } catch (err) {
    logger.error("Erro na exportação diária: " + err.message);
  }
});

module.exports = exportQueue;
