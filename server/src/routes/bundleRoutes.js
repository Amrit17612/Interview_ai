const express = require('express');
const router = express.Router();
const { getCustomBundles } = require('../controllers/bundleController');

// Public route to fetch custom bundles (company and domain)
router.get('/custom', getCustomBundles);

module.exports = router;
