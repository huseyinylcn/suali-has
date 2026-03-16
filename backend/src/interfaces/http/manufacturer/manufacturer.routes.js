const router = require("express").Router()
const controller = require("./manufacturer.controller")
const {validation} = require("./manufacturer.validation")
const {questionSchema} = require("./../../../domain/question.enity")





router.post("/v1/question/add", validation(questionSchema),controller.question_add)

module.exports = router