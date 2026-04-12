const { processAiRequest } = require('../services/aiService');
const logger = require('./../utils/logger');
const MAX_PROMPT_LENGTH = 200;

const getAdminAiResponse = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Falta el prompt." });
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: "Prompt demasiado largo." });
  }
  logger.debug(`Prompt recibido (Admin): ${prompt}`);

  try {
    const result = await processAiRequest(prompt, true);
    logger.debug('Respuesta final (Admin):');
    logger.debug(result);
    let final = result;
    if (typeof final === 'string') {
      final = final
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/, '')
        .trim();

      if (isJson(final)) {
        final = JSON.parse(final);
      } else {
        return res.json({ response: final });
      }
    }
    return res.json(final);
  } catch (err) {
    logger.error({ err }, `Error IA (Admin)`);
    res.status(500).json({ error: "Error interno" });
  }
};

const getPublicAiResponse = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Falta el prompt." });
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: "Prompt demasiado largo." });
  }
  logger.debug(`Prompt recibido (Public): ${prompt}`);

  try {
    const result = await processAiRequest(prompt, false);
    logger.debug('Respuesta final (Public):');
    logger.debug(result);
    const cleanedResult = typeof result === 'string'
      ? result.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
      : result;

    return res.json({ response: cleanedResult });
  } catch (err) {
    logger.error({ err }, `Error IA (Public)`);
    res.status(500).json({ error: "Error interno" });
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

module.exports = { getAdminAiResponse, getPublicAiResponse };
