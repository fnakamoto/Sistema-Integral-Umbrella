const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { Lead } = require("../models");
const { autenticarToken } = require("./authMiddleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /api/upload
router.post("/", autenticarToken, upload.single("arquivo"), async (req, res) => {
  try {
    const results = [];
    const filePath = path.resolve(__dirname, "..", req.file.path);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          etapa: data.etapa || "Novo",
          usuarioResponsavelId: req.usuario.id,
        });
      })
      .on("end", async () => {
        await Lead.bulkCreate(results);
        fs.unlinkSync(filePath); // remove arquivo após uso
        res.json({ message: "Leads importados com sucesso!", count: results.length });
      });
  } catch (err) {
    res.status(500).json({ error: "Erro ao importar CSV" });
  }
});

module.exports = router;
