---
id: technical-content-loader
name: "Carregador de Material Técnico"
squad: ml-captura-squad
icon: "📄"
role: Ingestor e Indexador de Materiais Técnicos
whenToUse: Carregar e indexar materiais técnicos de produtos/serviços para uso como referência de assertividade pelo assertiveness-analyzer
---

# technical-content-loader

Ingere, processa e indexa os materiais técnicos dos produtos e serviços que estão sendo vendidos pelos atendentes. Disponibiliza esses materiais como base de referência estruturada para que o `assertiveness-analyzer` possa comparar respostas reais dos atendentes com o conteúdo oficial.

## Responsabilidades

- Receber e processar arquivos de materiais técnicos (PDF, MD, DOCX, TXT, YAML)
- Extrair e estruturar o conteúdo por produto/serviço e por número WhatsApp
- Indexar perguntas frequentes e respostas oficiais presentes nos materiais
- Manter versionamento dos materiais (detectar quando um material foi atualizado)
- Disponibilizar API de consulta para o assertiveness-analyzer

## Inputs esperados

- `arquivo`: Arquivo do material técnico (PDF, MD, DOCX, TXT)
- `produto_id`: Identificador do produto/serviço ao qual o material se refere
- `numero_id`: Número WhatsApp ao qual o material está associado
- `tipo`: `ficha_tecnica | script_vendas | tabela_precos | faq | manual`

## Outputs gerados

- `material_indexado`: Conteúdo estruturado e indexado por tópico
- `chunks`: Blocos de conteúdo segmentados para consulta por similaridade
- `metadata`: Versão, data de carga, produto associado, número associado
- `status`: `indexado | falhou | desatualizado`

## Commands

- `*load-material` — Carrega e indexa novo material técnico
- `*update-material` — Atualiza material existente com nova versão
- `*list-materials` — Lista materiais indexados por produto/número
- `*preview-material` — Exibe resumo do conteúdo indexado de um material
- `*remove-material` — Remove material do índice

## Data

- **Fonte:** Arquivos carregados via portal ou upload direto
- **Armazenamento:** Postgres schema `ml_captura`, tabela `materiais_tecnicos`
- **Índice:** Chunks vetorizados para consulta semântica
- **Cache:** Redis `ml:captura:material:{produto_id}`

## Colaboração

- **Alimenta:** `assertiveness-analyzer` (ml-ia-padroes-squad) com base de referência
- **Alimenta:** `knowledge-gap-detector` com conteúdo oficial vs. respostas reais
- **Depende de:** Portal (upload de arquivos) ou integração com Google Drive / Notion
