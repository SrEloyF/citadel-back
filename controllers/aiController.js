const { processAiRequest } = require('../services/aiService');
const logger = require('./../utils/logger');

const MAX_PROMPT_LENGTH = 200;

function handleAiError(err, res, scope) {

  logger.error({ err }, `Error IA (${scope})`);

  const providerErrors = [
    "AI_PROVIDER_INVALID_RESPONSE",
    "AI_PROVIDER_CORRUPTED_RESPONSE",
    "AI_PROVIDER_TRUNCATED_RESPONSE"
  ];

  if (
    providerErrors.includes(err.message) ||
    err.status === 429 ||
    err.status === 502 ||
    err.status === 503 ||
    err.status === 504
  ) {
    return res.status(503).json({
      error: "Servidores de IA saturados. Intente nuevamente en unos minutos o pruebe otro modelo."
    });
  }

  return res.status(500).json({
    error: "Error interno."
  });
}

const getAdminAiResponse = async (req, res) => {

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: "Falta el prompt."
    });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      error: "Prompt demasiado largo."
    });
  }

  logger.debug(`Prompt recibido (Admin): ${prompt}`);

  try {

    const result = await processAiRequest(prompt, true);

    logger.debug("Respuesta final (Admin):");
    logger.debug(result);

    let final = result;

    if (typeof final === "string") {

      final = final
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();

      if (isJson(final)) {
        final = JSON.parse(final);
      } else {
        return res.json({
          response: final
        });
      }
    }

    return res.json(final);

  } catch (err) {

    return handleAiError(err, res, "Admin");

  }
};

const getPublicAiResponse = async (req, res) => {

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: "Falta el prompt."
    });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      error: "Prompt demasiado largo."
    });
  }

  logger.debug(`Prompt recibido (Public): ${prompt}`);

  try {

    const result = await processAiRequest(prompt, false);

    logger.debug("Respuesta final (Public):");
    logger.debug(result);

    const cleanedResult =
      typeof result === "string"
        ? result
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/, "")
            .trim()
        : result;

    return res.json({
      response: cleanedResult
    });

  } catch (err) {

    return handleAiError(err, res, "Public");

  }
};

function isJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  getAdminAiResponse,
  getPublicAiResponse
};
