exports.skill_types_get = async (response,{manufacturer_repositoy})=>{
    const result = await manufacturer_repositoy.skill_types_get(response)
    return result

}