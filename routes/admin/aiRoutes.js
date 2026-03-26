const express = require('express');
const router = express.Router();
const { getAdminAiResponse } = require('../../controllers/aiController');
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: Number(process.env.AI_ADMIN_RATE_LIMIT),
  message: "Has alcanzado el límite de consultas diarias. Intenta nuevamente mañana.",
});

router.post('/', aiLimiter, getAdminAiResponse);

module.exports = router;
