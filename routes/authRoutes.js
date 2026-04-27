const router = require('express').Router();
const authController = require('../controllers/authController');
const verifyCsrf = require('../auth/csrfMiddleware');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: "Demasiados intentos. Intente en un momento.",
});

router.post('/register', loginLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/google', loginLimiter, authController.googleLogin);
router.post('/refresh', loginLimiter, authController.refresh);
router.post('/logout', verifyCsrf, loginLimiter, authController.logout);

module.exports = router;