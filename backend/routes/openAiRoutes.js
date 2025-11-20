// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  rewriteLetter,
  chatLetter,
} = require('../controller/openAiController');

router.post('/rewrite', protect, rewriteLetter);
router.post('/chat', protect, chatLetter);

module.exports = router;