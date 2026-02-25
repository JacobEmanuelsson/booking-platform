const express = require("express");
const {validate} = require("../../middlewares/validate.middleware");
const { registerSchema } = require("./auth.validators")
const { register, login, refresh, logout, me } = require("./auth.controller")
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

router.post(
    "/refresh",
    refresh
)

router.post(
    "/logout",
    logout
)

router.get(
    "/me",
    me
)

module.exports = router;