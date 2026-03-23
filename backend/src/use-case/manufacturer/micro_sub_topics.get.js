exports.micro_sub_topics = async (response,{manufacturer_repositoy})=>{
    const result = await manufacturer_repositoy.micro_sub_topics(response)
    return result

}