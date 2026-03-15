const router = require("express").Router()
const controller = require("./manufacturer.controller")



router.post("/v1/question/add", controller.question_add)

module.exports = router