---
id: transcribe-audio
name: Transcribe Audio WhatsApp
squad: ml-captura-squad
agent: audio-transcriber
icon: "🎙️"
---

# transcribe-audio

Transcrever mensagem de áudio recebida via WhatsApp usando Groq Whisper, normalizar o texto e encaminhar para o pipeline de análise.

## Pré-condições

- Payload do message-collector com URL de download do arquivo de áudio
- Chave de API Groq configurada no ambiente
- Tabela `ml_captura.transcricoes` criada no Postgres
- Sessão identificada pelo sessao_id

## Passos

1. Receber payload do message-collector contendo URL do áudio e sessao_id
2. Baixar arquivo de áudio da URL fornecida pela Evolution API (formato ogg/mp4)
3. Enviar arquivo para Groq Whisper API com modelo `whisper-large-v3` e language `pt`
4. Receber transcrição com score de confiança e duração do áudio
5. Normalizar texto: remover ruídos, corrigir pontuação básica, trim de espaços
6. Persistir resultado em `ml_captura.transcricoes` com sessao_id, texto, confiança e timestamp
7. Encaminhar texto normalizado para privacy-filter via evento interno

## Outputs

- `transcricao_texto`: Texto transcrito e normalizado do áudio
- `duracao_audio`: Duração em segundos do arquivo de áudio
- `confianca_transcricao`: Score de confiança da transcrição (0.0 a 1.0)
- `sessao_id`: Identificador da sessão de conversa associada

## Critérios de sucesso

- Transcrição com confiança >= 0.8
- Texto não vazio e sem caracteres corrompidos
- Registro persistido em ml_captura.transcricoes com todos os campos preenchidos
