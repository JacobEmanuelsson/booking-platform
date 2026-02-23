const express = require("express");
const {validate} = require("../../middlewares/validate.middleware");
const { registerSchema } = require("./auth.validators")
const { register } = require("./auth.controller")
const router = express.Router();

router.post(
    "/register",
    validate(registerSchema),
    register
)

module.exports = router;