// routes/index.js
const express = require('express');
const router = express.Router();

// Home / splash page
router.get('/', (req, res) => {
  res.render('index', { title: 'Job Application Tracker' });
});

module.exports = router;
