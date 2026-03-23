
exports.subjects_get = async (response,{manufacturer_repositoy})=>{
    const result = await manufacturer_repositoy.subjects_get(response)
    return result

}