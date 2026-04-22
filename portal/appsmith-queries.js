(async () => {
  const xsrf = document.cookie.split(';').find(c => c.trim().startsWith('XSRF-TOKEN=')).split('=')[1];
  const h = { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrf };
  const dsId = '69de91bfffd46b32fced1961';

  const queries = [
    {
      name: 'getProjects',
      pageId: '69df00dfffd46b32fced196b',
      load: true,
      sql: 'SELECT p.id, p.nome, p.slug, p.ativo, p.created_at FROM _plataforma.projetos p ORDER BY p.nome'
    },
    {
      name: 'getNumerosByProject',
      pageId: '69df00dfffd46b32fced196b',
      load: false,
      sql: 'SELECT n.id, n.numero_whatsapp, n.nome_identificador, n.setor, n.status, n.total_mensagens FROM _plataforma.numeros_projeto n ORDER BY n.nome_identificador'
    },
    {
      name: 'getSkillCategorias',
      pageId: '69df0179ffd46b32fced196d',
      load: true,
      sql: 'SELECT c.id, c.nome, c.tipo, c.subcategoria, c.ativa, COUNT(s.id) AS total_skills FROM _plataforma.skill_categorias c LEFT JOIN _plataforma.skills s ON s.categoria_id = c.id GROUP BY c.id ORDER BY c.tipo, c.nome'
    },
    {
      name: 'getSkillsByCategoria',
      pageId: '69df0179ffd46b32fced196d',
      load: false,
      sql: 'SELECT s.id, s.nome, s.descricao, s.nivel_minimo, s.nivel_maximo, s.ativa FROM _plataforma.skills s ORDER BY s.nome'
    },
    {
      name: 'getAgentePerfis',
      pageId: '69df0179ffd46b32fced196f',
      load: true,
      sql: 'SELECT ap.id, ap.nome_agente, ap.tipo_disc, ap.perfil_resumo, ap.estilo_comunicacao, ap.updated_at FROM _plataforma.agente_perfis ap ORDER BY ap.updated_at DESC'
    },
    {
      name: 'getAgentePerformance',
      pageId: '69df0179ffd46b32fced196f',
      load: true,
      sql: 'SELECT perf.id, perf.metrica, perf.valor, perf.periodo FROM _plataforma.agente_performance perf ORDER BY perf.periodo DESC LIMIT 50'
    },
    {
      name: 'getFilaValidacao',
      pageId: '69df017affd46b32fced1971',
      load: true,
      sql: "SELECT fv.id, fv.produto_mencionado, fv.resposta_detectada, fv.status_validacao, fv.confianca_automatica, fv.criado_em FROM _validacao.fila_validacao fv ORDER BY fv.criado_em ASC"
    },
    {
      name: 'aprovarValidacao',
      pageId: '69df017affd46b32fced1971',
      load: false,
      sql: "UPDATE _validacao.fila_validacao SET status_validacao = 'aprovado', atualizado_em = NOW() WHERE id = '{{tblFila.selectedRow.id}}'"
    }
  ];

  for (const q of queries) {
    const r = await fetch('/api/v1/actions', {
      method: 'POST',
      credentials: 'include',
      headers: h,
      body: JSON.stringify({
        name: q.name,
        pageId: q.pageId,
        datasource: { id: dsId },
        pluginType: 'DB',
        actionConfiguration: {
          body: q.sql,
          timeoutInMillisecond: 10000,
          paginationType: 'NONE',
          encodeParamsToggle: true
        },
        executeOnLoad: q.load
      })
    });
    const d = await r.json();
    console.log(d.responseMeta?.success ? '✅' : '❌', q.name, d.responseMeta?.success ? '' : JSON.stringify(d.responseMeta));
  }
  console.log('Concluido!');
})();
