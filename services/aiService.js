const { openai, adminSystemPrompt, publicSystemPrompt } = require('../config/ai');
const { adminPool, publicPool, dbType } = require('../config/bdAi');
const { sanitizeSqlQuery } = require('../utils/sqlSanitizer');
const logger = require('./../utils/logger');
const tiktoken = require("tiktoken");
const dotenv = require("dotenv");
dotenv.config();

async function executeSql(query, isAdmin) {
  try {
    const safeQuery = sanitizeSqlQuery(query, isAdmin);
    const pool = isAdmin ? adminPool : publicPool;

    logger.info(`-> Ejecutando SQL (${isAdmin ? 'Admin' : 'Public'}): ${safeQuery}`);

    if (dbType === "mysql") {
      const [rows] = await pool.query(safeQuery);
      return JSON.stringify(rows);
    } else {
      const result = await pool.query(safeQuery);
      return JSON.stringify(result.rows);
    }
  } catch (err) {
    logger.error({ err }, `Error ejecución SQL`);
    return JSON.stringify({ error: 'Error al ejecutar la consulta' });
  }
}

async function processAiRequest(prompt, isAdmin = false) {
  logger.info(`--- Solicitud recibida (${isAdmin ? 'Admin' : 'Public'}) ---`);
  const systemPrompt = isAdmin ? adminSystemPrompt : publicSystemPrompt;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt }
  ];

  const enc = tiktoken.get_encoding("cl100k_base");
  let totalTokens = 0;
  messages.forEach(msg => {
    const tokens = enc.encode(msg.content);
    totalTokens += tokens.length;
    logger.info(`[Token Count] Role: ${msg.role}, Tokens: ${tokens.length}`);
  });
  logger.info(`[Token Count] Total tokens enviados: ${totalTokens}`);

  const tools = [{
    type: "function",
    function: {
      name: "query_database",
      description: "Ejecuta una consulta SQL para obtener datos del esquema proporcionado.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"]
      }
    }
  }];

  const modelo = process.env.MODEL_NAME || "nvidia/nemotron-3-super-120b-a12b:free";
  let response = await openai.chat.completions.create({
    model: modelo,
    messages: messages,
    tools: tools,
    tool_choice: { type: "function", function: { name: "query_database" } },
    temperature: 0,
    max_tokens: process.env.MAX_TOKENS
  });

  let responseMessage = response.choices[0].message;
  let iteraciones = 0;

  while ((responseMessage.tool_calls || responseMessage.function_call) && iteraciones < 5) {
    messages.push(responseMessage);
    const calls = responseMessage.tool_calls || [{ function: responseMessage.function_call, id: "legacy" }];

    for (const call of calls) {
      const args = typeof call.function.arguments === 'string' ? JSON.parse(call.function.arguments) : call.function.arguments;
      const dbResult = await executeSql(args.query, isAdmin);
      messages.push({
        tool_call_id: call.id || "legacy",
        role: "tool",
        name: call.function.name,
        content: dbResult,
      });
    }

    totalTokens = 0;
    messages.forEach(msg => {
      const text = msg.content || "";
      const tokens = enc.encode(text);
      totalTokens += tokens.length;
    });
    logger.info(`[Token Count] Tokens acumulados tras iteración ${iteraciones + 1}: ${totalTokens}`);

    const nextResponse = await openai.chat.completions.create({
      model: modelo,
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      max_tokens: process.env.MAX_TOKENS
    });
    responseMessage = nextResponse.choices[0].message;
    iteraciones++;
  }

  return responseMessage.content;
}

module.exports = { processAiRequest };
