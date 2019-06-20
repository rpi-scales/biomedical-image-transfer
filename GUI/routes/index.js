const express = require('express');
const path = require('path');
const router = express.Router();

const app = express();

router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname+'/index.html'));
});

module.exports = router;