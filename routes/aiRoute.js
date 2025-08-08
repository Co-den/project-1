const express =require( "express");
const aiController = require("../controllers/aiController.js");


const router = express.Router();

router.post("/ask", aiController.aiAssistant);
router.post("/suggestions", aiController.suggestions);

module.exports = router;