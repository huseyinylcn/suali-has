

exports.question_add = async  (req,res,next)=> {
   try {
     res.status(200).json({success:tru})
   } catch (err) {
    console.log(err)
     res.status(400).json({err:err.message})
   }
  
    
}

