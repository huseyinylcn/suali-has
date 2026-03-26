const router = require("express").Router()
const controller = require("./manufacturer.controller")
const {validation} = require("./manufacturer.validation")
const {questionSchema} = require("./../../../domain/question.enity")
const querySchema = require("./../../../domain/query.enity")

const r2Upload = require("./../../../infrastructure/r2/r2Upload")






router.post("/v1/question/add", validation(questionSchema),controller.question_add)
router.post("/v1/question/image/add", r2Upload("question") ,controller.question_image_add)
router.post("/v1/question/option/image/add", r2Upload("option") ,controller.option_image_add)

router.get("/v1/subjects/get" ,controller.subjects_get)
router.get("/v1/question/sub/topics/get" ,controller.sub_topics_get)
router.get("/v1/exam/types/get" ,controller.exam_types_get)
router.get("/v1/skill/types/get" ,controller.skill_types_get)

router.get("/v1/micro/sub/topics",controller.micro_sub_topics)

router.post("/v1/generate-vektor-text",controller.generate_vector_text)
router.post("/v1/mathpix-translate",validation(querySchema.mathpix_translateSchema),controller.mathpix_translate)
router.get("/v1/filtered-data",controller.filtered_data)
router.post("/v1/similar-question",controller.similar_question)









module.exports = router