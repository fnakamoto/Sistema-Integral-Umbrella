router.get('/', async (req, res) => {
  try {
    const {
      etapa,
      responsavel,
      dataInicio,
      dataFim,
      page = 1,
      limit = 10
    } = req.query;

    let filtros = [];
    let valores = [];
    let idx = 1;

    if (etapa) {
      filtros.push(`etapa = $${idx++}`);
      valores.push(etapa);
    }
    if (responsavel) {
      filtros.push(`responsavel = $${idx++}`);
      valores.push(responsavel);
    }
    if (dataInicio) {
      filtros.push(`criado_em >= $${idx++}`);
      valores.push(dataInicio);
    }
    if (dataFim) {
      filtros.push(`criado_em <= $${idx++}`);
      valores.push(dataFim);
    }

    const where = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

    // Paginação
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM leads
      ${where}
      ORDER BY criado_em DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    valores.push(limit, offset);

    const result = await pool.query(query, valores);

    res.json({
      page: Number(page),
      limit: Number(limit),
      leads: result.rows
    });

  } catch (err) {
    console.error('Erro ao buscar leads:', err);
    res.status(500).json({ error: 'Erro ao buscar leads' });
  }
});
