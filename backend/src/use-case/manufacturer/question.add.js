
exports.question_add = async (response,{manufacturer_repositoy})=>{
    const result = await manufacturer_repositoy.question_add(response)
    console.log(result);
    return result

}