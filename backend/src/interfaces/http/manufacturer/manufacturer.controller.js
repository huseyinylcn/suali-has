const {question_add} = require("../../../use-case/manufacturer/question.add")
const manufacturer_repositoy = require("../../../infrastructure/db/manufacturer.repositoy")


exports.question_add = async  (req,res,next)=> {
   try {
    const result = await question_add(req.body,{manufacturer_repositoy})
     res.status(200).json({result:result})
   } catch (err) {
    console.log(err)
     res.status(400).json({err:err.message})
   }
  
    
}

