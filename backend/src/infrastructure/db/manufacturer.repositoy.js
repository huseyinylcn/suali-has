const sql = require("mssql")
const { pool } = require("./../../config/database");



exports.question_add = async (data) => {
    const transaction =await new sql.Transaction(pool());
    try {
        await transaction.begin();
        const result = await new sql.Request(transaction)
            .input("is_active", sql.Bit, data.is_active)
            .input("question_text", sql.NVarChar, data.question_text)
            .input("difficulty_level", sql.TinyInt, data.difficulty_level)
            .input("source", sql.NVarChar, data.source)
            .input("objective_codes", sql.NVarChar, data.objective_codes)
            .input("subject_id", sql.Int, data.subject_id)
            .input("question_image_url", sql.NVarChar, data.question_image_url || null)
            .input("skill_type", sql.SmallInt, data.skill_type)
            .input("vektor_txt", sql.NVarChar, data.vektor_txt)


            .query(`INSERT INTO [dbo].[questions]
           ([created_at]
           ,[is_active]
           ,[question_text]
           ,[question_image_url]
           ,[subject_id]
           ,[difficulty_level]
           ,[source]
           ,[skill_type]
           ,[objective_codes]
           ,[vektor_txt])
           OUTPUT INSERTED.question_id
     VALUES
           (
            GETDATE()
           ,@is_active
           ,@question_text
           ,@question_image_url
           ,@subject_id
           ,@difficulty_level
           ,@source
           ,@skill_type
           ,@objective_codes
           ,@vektor_txt)`)
        const newQuestionId = result.recordset[0].question_id;




        for (const option of data.question_options) {
            const optRequest = new sql.Request(transaction);
            await optRequest
                .input("question_id", sql.UniqueIdentifier, newQuestionId)
                .input("option_text", sql.NVarChar, option.option_text)
                .input("option_image_url", sql.NVarChar, option.option_image_url || null)
                .input("is_correct", sql.Bit, option.is_correct)
                .query(`
            INSERT INTO [dbo].[question_options] 
            (question_id, option_text, option_image_url, is_correct)
            VALUES 
            (@question_id, @option_text, @option_image_url, @is_correct)
        `);
        }




        for (const examType of data.exam_types) {
            const exxamTypeRequest = new sql.Request(transaction);
            await exxamTypeRequest
                .input("question_id", sql.UniqueIdentifier, newQuestionId)
                .input("exam_type_id", sql.Int, examType)
                .query(`
            INSERT INTO [dbo].[question_exam_mappings]
           ([question_id]
           ,[exam_type_id])
        VALUES
           (@question_id
           ,@exam_type_id)
        `);
        }



        for (const subID of data.sub_topics) {
            const subTopicsRequest = new sql.Request(transaction);
            await subTopicsRequest
                .input("question_id", sql.UniqueIdentifier, newQuestionId)
                .input("sub_topic_id", sql.Int, subID)
                .query(`
                    INSERT INTO [dbo].[sub_topic_mappings]
                        ([sub_topic_id]
                        ,[question_id])
                    VALUES
                        (@sub_topic_id
                        ,@question_id)
        `);
        }


        for (const microSubId of data.micro_sub_topics) {
            const microSubTopicRequest = new sql.Request(transaction);
            await microSubTopicRequest
                .input("question_id", sql.UniqueIdentifier, newQuestionId)
                .input("micro_sub_topic_id", sql.Int, microSubId)
                .query(`
                INSERT INTO [dbo].[micro_sub_topic_mapping]
                    ([question_id]
                    ,[micro_sub_topic_id])
                VALUES
                    (@question_id
                    ,@micro_sub_topic_id)
        `);
        }

        await transaction.commit();
        return { question_id: newQuestionId };



    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }

}


