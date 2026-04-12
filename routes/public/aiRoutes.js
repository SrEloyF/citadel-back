const express = require('express');
const router = express.Router();
const { getPublicAiResponse } = require('../../controllers/aiController');
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: Number(process.env.AI_PUBLIC_RATE_LIMIT) || 5,
  message: "Has alcanzado el límite de consultas diarias. Intenta nuevamente mañana.",
});

router.post('/', aiLimiter, getPublicAiResponse);

module.exports = router;
