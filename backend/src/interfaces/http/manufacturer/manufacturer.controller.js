const { question_add } = require("../../../use-case/manufacturer/question.add")
const { subjects_get } = require("../../../use-case/manufacturer/subjects.get")
const { exam_types_get } = require("../../../use-case/manufacturer/exam_types.get")
const { sub_topics_get } = require("../../../use-case/manufacturer/sub_topics.get")
const { micro_sub_topics } = require("../../../use-case/manufacturer/micro_sub_topics.get")
const { skill_types_get } = require("../../../use-case/manufacturer/skill_types.get")
const { generate_vector_text } = require("../../../use-case/manufacturer/generate_vector_text")
const { mathpix_translate } = require("../../../use-case/manufacturer/mathpix_translate")
const { filtered_data } = require("../../../use-case/manufacturer/filtered_data.get")
const { similar_question } = require("../../../use-case/manufacturer/similar_question.get")


const axios = require('axios');

const openai = require('../../../config/openaiClient');
const {client} = require('../../../config/redis');





const manufacturer_repositoy = require("../../../infrastructure/db/manufacturer.repositoy")


exports.question_add = async (req, res, next) => {
  try {
    req.body.source_id = 1
    const result = await question_add(req.body, { manufacturer_repositoy,axios })
    res.status(200).json({ result: result,success:true })
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }


}


exports.question_image_add = async (req, res, next) => {
  try {
    if (!req.uploadedFileUrl) {
      return res.status(400).json({ success: false, err: "file not upload" });
    }
    res.status(200).json({
      success: true,
      url: req.uploadedFileUrl 
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }
}


exports.option_image_add = async (req, res, next) => {
  try {
    if (!req.uploadedFileUrl) {
      return res.status(400).json({ success: false, err: "file not upload" });
    }
    res.status(200).json({
      success: true,
      url: req.uploadedFileUrl 
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }
}


exports.subjects_get = async (req, res, next) => {
 try {
    const result = await subjects_get(req.query, { manufacturer_repositoy,client })
    res.status(200).json({ result: result,success:true })
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }
}

exports.exam_types_get = async (req, res, next) => {
 try {
    const result = await exam_types_get(req.query, { manufacturer_repositoy })
    res.status(200).json({ result: result,success:true })
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }
}


exports.sub_topics_get = async (req, res, next) => {
 try {

    const result = await sub_topics_get(req.query, { manufacturer_repositoy })
    res.status(200).json({ result: result,success:true })
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }
}

exports.micro_sub_topics = async (req, res, next) => {
 try {
    const result = await micro_sub_topics(req.query, { manufacturer_repositoy })
    res.status(200).json({ result: result,success:true })
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }
}


exports.skill_types_get = async (req, res, next) => {
 try {
 
    const result = await skill_types_get(req.query, { manufacturer_repositoy })
    res.status(200).json({ result: result,success:true })
  } catch (err) {
    console.log(err)
    next(err)
    res.status(400).json({ err: err.message })
    
  }
}

exports.generate_vector_text = async (req, res, next) => {
 try {
    const result = await generate_vector_text(req.body, { manufacturer_repositoy,openai })
    res.status(200).json({ result: result,success:true })
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }
}


exports.mathpix_translate = async (req, res, next) => {
 try {
    const result = await mathpix_translate(req.body, { manufacturer_repositoy,axios })
    res.status(200).json({ result: result,success:true })
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }
}



exports.filtered_data = async (req, res, next) => {
 try {

    const result = await filtered_data(req.query, { manufacturer_repositoy,axios })
    res.status(200).json({ result: result,success:true })
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }
}



exports.similar_question = async (req, res, next) => {
 try {
    const result = await similar_question(req.body, { manufacturer_repositoy,axios })
    res.status(200).json({ result: result,success:true })
  } catch (err) {
    console.log(err)
    res.status(400).json({ err: err.message })
  }
}







