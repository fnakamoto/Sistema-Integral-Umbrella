const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leadsController');

router.post('/', leadsController.criarLead);
router.get('/', leadsController.listarLeads);
router.get('/estatisticas', leadsController.estatisticas);
router.put('/:id', leadsController.atualizarLead);
router.patch('/:id/etapa', leadsController.alterarEtapa);
router.delete('/:id', leadsController.deletarLead);

module.exports = router;
