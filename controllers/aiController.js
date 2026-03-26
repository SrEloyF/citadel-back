const { processAiRequest } = require('../services/aiService');
const logger = require('./../utils/logger');

const getAdminAiResponse = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Falta el prompt." });
  logger.info(`Prompt recibido (Admin): ${prompt}`);

  try {
    const result = await processAiRequest(prompt, true);
    logger.info('Respuesta final (Admin):');
    logger.info(result);
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
  logger.info(`Prompt recibido (Public): ${prompt}`);

  try {
    const result = await processAiRequest(prompt, false);
    logger.info('Respuesta final (Public):');
    logger.info(result);
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
