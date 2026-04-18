-- Seed: Procedimentos modelo Omega Laser
-- projeto_id: 7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5
-- Executar somente se COUNT = 0

INSERT INTO ml_clinica.procedimentos
  (projeto_id, nome, finalidade, regiao, qtd_sessoes, duracao_sessao, intervalo_sessoes, valor_avulso, valor_sessao_pacote, valor_pacote, status, observacoes)
VALUES
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Acupuntura', 'Alivia dores, reduz estresse e equilibra o organismo.', 'corporal', 4, 40, 15, 120.00, NULL, 432.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'BB glow', 'Uniformiza o tom da pele e proporciona efeito de pele perfeita.', 'facial', 3, 40, 30, 350.00, NULL, 945.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Blefaroplastia com jato de plasma', 'Levanta as palpebras, reduz flacidez e rejuvenesce o olhar.', 'olhos', 3, 40, 30, 350.00, NULL, 945.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Camuflagem de estrias sem tinta', 'Suaviza a aparencia das estrias e estimula a regeneracao da pele.', 'corporal', 5, 60, 15, 250.00, NULL, 1125.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Dermaplaning', 'Remove celulas mortas e pelos, deixando a pele mais lisa e iluminada.', 'facial', 3, 40, 15, 200.00, NULL, 540.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Drenagem linfatica', 'Reduz inchaco, melhora a circulacao e elimina toxinas.', 'corporal', 4, 60, 3, 100.00, NULL, 360.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Drenagem linfatica facial', 'Diminui inchaco no rosto, melhora contorno e vico da pele.', 'facial', 4, 50, 3, 80.00, NULL, 288.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Endermologia', 'Combate celulite, melhora a circulacao e modela o corpo.', 'corporal', 10, 20, 3, 60.00, NULL, 540.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Extracao de sinais com jato de plasma', 'Remove sinais com precisao.', 'facial e corporal', 2, 90, 30, 250.00, NULL, 450.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Hidra gloss lips', 'Hidrata profundamente, da volume e realca o brilho dos labios.', 'labios', 3, 30, 30, 200.00, NULL, 540.00, 'ativo', 'Procedimento prioritario'),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Hidratacao facial', 'Devolve vico, maciez e luminosidade a pele.', 'facial', 3, 30, 7, 80.00, NULL, 216.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Lifting com jato de plasma', 'Promove efeito lifting sem cortes e sem cirurgia.', 'facial', 3, 90, 30, 450.00, NULL, 1215.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Lifting facial', 'Massagem que redefine contornos e rejuvenesce a face.', 'facial', 4, 60, 3, 80.00, NULL, 288.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Limpeza de pele', 'Remove impurezas, controla oleosidade e previne acne.', 'facial', 2, 90, 30, 120.00, NULL, 216.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Limpeza de pele com Dermaplaning', 'Limpa, renova e deixa a pele mais lisa e uniforme.', 'facial', 2, 120, 30, 200.00, NULL, 360.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Limpeza de pele com peeling de diamante', 'Promove renovacao celular e melhora a textura da pele.', 'facial', 2, 90, 30, 150.00, NULL, 270.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Limpeza de pele quimica', 'Trata acne, manchas e melhora a qualidade da pele.', 'facial', 2, 120, 30, 180.00, NULL, 324.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Massagem relaxante', 'Alivia tensoes, reduz estresse e promove bem-estar.', 'corporal', 4, 60, 3, 150.00, NULL, 540.00, 'ativo', 'Atende somente mulheres'),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Microagulhamento', 'Estimula colageno, trata manchas, cicatrizes e linhas finas.', 'facial e corporal', 3, 60, 30, 250.00, NULL, 675.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Microagulhamento com PDRN', 'Regenera a pele profundamente e potencializa o rejuvenescimento.', 'facial e corporal', 3, 60, 30, 400.00, NULL, 1080.00, 'ativo', 'Procedimento prioritario'),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Peeling de diamante', 'Suaviza manchas, linhas finas e melhora a textura da pele.', 'facial e corporal', 2, 30, 15, 120.00, NULL, 216.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Peeling quimico', 'Renova a pele, clareia manchas e trata acne.', 'facial', 3, 40, 30, 250.00, NULL, 675.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Plasmoporacao', 'Potencializa a absorcao de ativos e melhora a qualidade da pele.', 'facial', 4, 30, 15, 180.00, NULL, 648.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Protocolo Acne Control', 'Controla a oleosidade, reduz inflamacoes e previne novas acnes.', 'facial', 5, 60, 15, 250.00, NULL, 1125.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Pump up', 'Estimula circulacao, da efeito de volume e melhora o contorno.', 'gluteos', 10, 60, 3, 80.00, NULL, 720.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Rejuvenescimento de olheiras', 'Clareia, revitaliza e reduz bolsas e linhas finas.', 'olhos', 3, 40, 30, 250.00, NULL, 675.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Ultrassom', 'Reduz gordura localizada, melhora flacidez, celulite e modela o corpo.', 'corporal', 10, 50, 7, 100.00, NULL, 900.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Ventosaterapia', 'Alivia dores musculares, ativa a circulacao e reduz tensoes.', 'corporal', 4, 50, 7, 120.00, NULL, 432.00, 'ativo', NULL),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Micro Botox', 'Suaviza linhas finas, reduz poros e oleosidade, deixando a pele mais lisa, vicosa e rejuvenescida.', 'facial', 3, 40, 90, 400.00, NULL, 1080.00, 'ativo', 'Procedimento prioritario'),
  ('7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5', 'Depilacao a laser', 'A preencher conforme equipamento locado', 'corporal e facial', 6, 30, 30, 0.00, NULL, 0.00, 'ativo', 'Equipamento locado - 50% entrada + 50% no dia. Preencher valor conforme equipamento disponivel');
