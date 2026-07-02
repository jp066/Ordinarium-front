# Contrato de API: Horários e Eventos Colaborativos (Estilo Waze)

Esta especificação define o contrato REST de comunicação entre o Frontend do Ordinarium e o Worker/API Backend para gerenciar a criação e moderação de horários de eventos (Missas, Confissões, Adorações, etc.) de forma colaborativa pelos fiéis.

---

## 1. Visão Geral da Arquitetura

1. **Adição Dinâmica:** Fiéis podem sugerir um horário/evento específico (ex: Adoração nas Quartas às 19h30) que falta em uma determinada paróquia.
2. **Mesclagem na Grade:** Uma vez adicionado, o evento aparece de forma imediata na grade horária da paróquia identificado como "Colaborativo".
3. **Validação da Comunidade:** Outros usuários podem sinalizar se o horário ainda ocorre ("Sim") ou se é falso/não ocorre mais ("Não").
4. **Moderação Automática:** Horários com saldo de reprovações negativo (`downvotes - upvotes >= 3`) são removidos automaticamente da exibição pública.

---

## 2. Endpoints da API

Abaixo estão definidos os endpoints e payloads correspondentes.

### 2.1. Adicionar Horário Colaborativo

Adiciona um novo horário sugerido pela comunidade para uma paróquia específica.

- **URL:** `/api/v1/paroquias/{churchId}/schedules`
- **Método:** `POST`
- **Cabeçalhos:**
  - `Content-Type: application/json`
  - `X-Device-ID: <device-uuid>` (obrigatório para controle de spam)
- **Corpo da Requisição (Request Body):**
  ```json
  {
  	"type": "Adoração",
  	"weekday": "Qua",
  	"timeStr": "19:30",
  	"notes": "Adoração ao Santíssimo Sacramento e bênção solene na capela principal."
  }
  ```
  _Valores permitidos para `type`:_ `"Missa" | "Confissão" | "Adoração" | "Terço" | "Outro"`
  _Valores permitidos para `weekday`:_ `"Dom" | "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb"`
- **Resposta de Sucesso (211 Created):**
  ```json
  {
  	"id": "ce_8f7b312a",
  	"message": "Horário colaborativo registrado com sucesso e integrado à grade.",
  	"createdAt": "2026-07-01T12:59:00.000Z"
  }
  ```

---

### 2.2. Votar em Horário Colaborativo

Confirma a validade de um horário adicionado pela comunidade ou sinaliza que ele não existe mais.

- **URL:** `/api/v1/schedules/colaborativos/{id}/votar`
- **Método:** `POST`
- **Cabeçalhos:**
  - `Content-Type: application/json`
  - `X-Device-ID: <device-uuid>`
- **Corpo da Requisição (Request Body):**
  ```json
  {
  	"action": "up"
  }
  ```
  _Valores válidos para `action`:_
  - `"up"`: Confirmar ("Sim, este horário ocorre")
  - `"down"`: Desmentir ("Não ocorre / Horário incorreto")
  - `"clear"`: Desfazer voto anterior
- **Resposta de Sucesso (200 OK):**
  ```json
  {
  	"id": "ce_8f7b312a",
  	"upvotes": 7,
  	"downvotes": 0,
  	"userAction": "up",
  	"confidenceScore": 1.0
  }
  ```

---

## 3. Esquemas de Dados (JSON Schema)

### 3.1. CommunityEvent

```json
{
	"type": "object",
	"properties": {
		"id": { "type": "string" },
		"churchId": { "type": "string" },
		"churchName": { "type": "string" },
		"type": {
			"type": "string",
			"enum": ["Missa", "Confissão", "Adoração", "Terço", "Outro"]
		},
		"weekday": {
			"type": "string",
			"enum": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
		},
		"timeStr": {
			"type": "string",
			"pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
		},
		"notes": { "type": "string", "maxLength": 200 },
		"upvotes": { "type": "integer", "minimum": 0 },
		"downvotes": { "type": "integer", "minimum": 0 },
		"userAction": {
			"type": "string",
			"enum": ["up", "down", "null"]
		},
		"createdAt": { "type": "string", "format": "date-time" }
	},
	"required": ["id", "churchId", "type", "weekday", "timeStr", "upvotes", "downvotes", "createdAt"]
}
```
