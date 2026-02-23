const express = require("express");
const {validate} = require("../../middlewares/validate.middleware");
const { registerSchema } = require("./auth.validators")
const { register, login } = require("./auth.controller")
const router = express.Router();

router.post(
    "/register",
    validate(registerSchema),
    register
)

router.post(
    "/login",
    validate(registerSchema),
    login
)

module.exports = router;