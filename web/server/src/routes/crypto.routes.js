const express = require("express");
const upload = require("../middleware/upload");
const {
  handleEncrypt,
  handleDecrypt,
} = require("../controllers/crypto.controller");

const router = express.Router();

router.post("/encrypt", upload.single("file"), handleEncrypt);
router.post("/decrypt", upload.single("file"), handleDecrypt);

module.exports = router;
