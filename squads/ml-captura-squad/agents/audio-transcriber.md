---
id: audio-transcriber
name: "Transcritor de Áudio"
squad: ml-captura-squad
icon: "🎤"
role: Transcritor de Áudios via Groq Whisper
whenToUse: Transcrever mensagens de áudio recebidas pelo WhatsApp para texto normalizado, mantendo o mesmo pipeline de análise das mensagens de texto
---

# audio-transcriber

Converte mensagens de áudio do WhatsApp em texto normalizado usando a API Groq Whisper, garantindo que áudios de vendedores e clientes entrem no mesmo pipeline analítico das mensagens de texto. Trata ruídos, sotaques e truncamentos comuns em áudios de WhatsApp para maximizar a qualidade da transcrição.

## Responsabilidades

- Receber arquivos de áudio do message-collector e baixar do storage temporário
- Enviar áudio para a API Groq Whisper com configuração otimizada para português brasileiro
- Normalizar o texto transcrito (pontuação, capitalização, remoção de filler words)
- Registrar nível de confiança da transcrição e sinalizar áudios com baixa qualidade
- Persistir transcrição no schema `ml_captura.transcricoes` vinculada à mensagem original

## Inputs esperados

- `audio_url`: URL temporária do arquivo de áudio no storage Evolution API
- `sessao_id`: Identificador da sessão de conversa de origem
- `mensagem_id`: ID da mensagem de áudio original para rastreabilidade
- `duracao_segundos`: Duração do áudio para priorização de fila
- `numero_remetente`: Número WhatsApp do remetente (vendedor ou cliente)

## Outputs gerados

- `texto_transcrito`: Texto completo da transcrição normalizado
- `confianca_score`: Score de 0-1 indicando qualidade da transcrição
- `idioma_detectado`: Idioma identificado pelo Whisper
- `duracao_processamento_ms`: Tempo de processamento para monitoramento de SLA
- `flag_baixa_qualidade`: Boolean para revisão manual quando score < 0.7

## Commands

- `*transcribe` — Transcreve áudio específico por mensagem_id
- `*retry-low-confidence` — Reprocessa transcrições com score abaixo do threshold
- `*batch-pending` — Processa fila de áudios pendentes em lote
- `*stats` — Exibe métricas de volume e qualidade das transcrições do dia

## Data

- **Fonte:** Arquivos de áudio via Evolution API storage + Groq Whisper API (externo)
- **Destino:** Postgres `ml_captura.transcricoes`
- **Modelo:** Groq Whisper (externo)
- **Cache:** Redis `ml:captura:audio:{sessao_id}`

## Colaboração

- **Depende de:** message-collector (para receber áudios identificados), Groq Whisper API (transcrição)
- **Alimenta:** privacy-filter (com texto transcrito pronto para análise)
