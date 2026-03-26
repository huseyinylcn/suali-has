exports.filtered_data = async (response, { manufacturer_repositoy, axios }) => {

    const result = await manufacturer_repositoy.filtered_data(response)
    for (const obj of result) {
        obj.question_options = JSON.parse(obj.question_options)
        obj.sub_topics = JSON.parse(obj.sub_topics)
        obj.micro_sub_topics = JSON.parse(obj.micro_sub_topics)
        obj.exam_types = JSON.parse(obj.exam_types)
        obj.skill_type = JSON.parse(obj.skill_type)
    }


    return result

}