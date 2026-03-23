
exports.sub_topics_get = async (response,{manufacturer_repositoy})=>{
    const result = await manufacturer_repositoy.sub_topics_get(response)
    return result

}