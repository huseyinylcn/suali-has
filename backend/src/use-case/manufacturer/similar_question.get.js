exports.similar_question = async (response, { manufacturer_repositoy, axios }) => {
    console.log(response)

    const result = await manufacturer_repositoy.similar_question(response)
    for (const obj of result) {
        obj.question_options = JSON.parse(obj.question_options)
        obj.sub_topics = JSON.parse(obj.sub_topics)
        obj.micro_sub_topics = JSON.parse(obj.micro_sub_topics)
        obj.exam_types = JSON.parse(obj.exam_types)
        obj.skill_type = JSON.parse(obj.skill_type)
    }


    let bodyData = {
        "question_id": result[0].question_id,
        "filter": {
            "exam_types": { "$in": result[0].exam_types.map(item => String(item.exam_type_id)) },
            "subject_id": result[0].subject_id,
            "is_active": result[0].is_active,
            // "sub_topics":  { "$in": result[0].sub_topics.map(item=> String(item.sub_topic_id)) },
            // "micro_sub_topics": { "$in": result[0].micro_sub_topics.map(item=> String(item.micro_sub_topic_id)) }

        }
    }



    const SeviceResponse = await axios.post(
        "http://localhost:8000/manufacturer-similar-question", bodyData
    );

    let pyResult = SeviceResponse.data
    let question_ids = pyResult.map(item => item.question_id)

    const result2 = await manufacturer_repositoy.similar_question({ question_id: question_ids })
    
    for (const obj of result2) {
        obj.question_options = JSON.parse(obj.question_options)
        obj.sub_topics = JSON.parse(obj.sub_topics)
        obj.micro_sub_topics = JSON.parse(obj.micro_sub_topics)
        obj.exam_types = JSON.parse(obj.exam_types)
        obj.skill_type = JSON.parse(obj.skill_type)
    }

    
    const veriMap = new Map(pyResult.map(item => [
        item.question_id,
        { score: item.score, coords: item.coords } 
    ]));

   
    const sonuc = result2.map(question => {
        const ekVeri = veriMap.get(question.question_id);

        return {
            ...question,
            score: ekVeri ? ekVeri.score : null,
            coords: ekVeri ? ekVeri.coords : null
        };
    });

    return sonuc

}