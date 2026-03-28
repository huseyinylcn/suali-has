
exports.question_add = async (response, { manufacturer_repositoy, axios }) => {

    const result = await manufacturer_repositoy.question_add(response)
    delete response.objective_codes;
    delete response.question_options;
    delete response.skill_types;
    delete response.question_text;
    response.question_id = result.question_id

    try {
    const SeviceResponse = await axios.post(
        "http://localhost:8000/create-vector",response
    );
    } catch (error) {
        // buraya log yazalım 
        // eğer başarılıysa redis kayıt
    }





    return result

}