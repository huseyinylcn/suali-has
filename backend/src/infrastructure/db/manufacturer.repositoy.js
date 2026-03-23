const sql = require("mssql")
const { pool } = require("./../../config/database");



exports.question_add = async (data) => {
    const transaction = await new sql.Transaction(pool());
    try {
        await transaction.begin();
        const result = await new sql.Request(transaction)
            .input("is_active", sql.Bit, data.is_active)
            .input("question_text", sql.NVarChar, data.question_text)
            .input("difficulty_level", sql.TinyInt, data.difficulty_level)
            .input("source_id", sql.Int, data.source_id)
            .input("objective_codes", sql.NVarChar, data.objective_codes)
            .input("subject_id", sql.Int, data.subject_id)
            .input("vektor_txt", sql.NVarChar, data.vektor_txt)


            .query(`INSERT INTO [dbo].[questions]
           ([created_at]
           ,[is_active]
           ,[question_text]
           ,[subject_id]
           ,[difficulty_level]
           ,[source_id]
           ,[objective_codes]
           ,[vektor_txt])
           OUTPUT INSERTED.question_id
     VALUES
           (
            GETDATE()
           ,@is_active
           ,@question_text
           ,@subject_id
           ,@difficulty_level
           ,@source_id
           ,@objective_codes
           ,@vektor_txt)`)
        const newQuestionId = result.recordset[0].question_id;




        for (const option of data.question_options) {
            const optRequest = new sql.Request(transaction);
            await optRequest
                .input("question_id", sql.UniqueIdentifier, newQuestionId)
                .input("option_text", sql.NVarChar, option.option_text)
                .input("is_correct", sql.Bit, option.is_correct)
                .query(`
            INSERT INTO [dbo].[question_options] 
            (question_id, option_text, is_correct)
            VALUES 
            (@question_id, @option_text, @is_correct)
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


            for (const skillTypeId of data.skill_types) {
            const skillTypeRequest = new sql.Request(transaction);
            await skillTypeRequest
                .input("question_id", sql.UniqueIdentifier, newQuestionId)
                .input("skill_type_id", sql.Int, skillTypeId)
                .query(`
                INSERT INTO [dbo].[skill_types_mapping]
                    ([question_id]
                    ,[skill_type_id])
                VALUES
                    (@question_id
                    ,@skill_type_id)
        `);
        }

        await transaction.commit();
        return { question_id: newQuestionId };



    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }

}



exports.subjects_get = async (data) => {

    try {
        const request = new sql.Request(pool());

        const result = await request.query(`SELECT * FROM subjects`)
        return result.recordset


    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }

}



exports.exam_types_get = async (data) => {

    try {
        const request = new sql.Request(pool());

        const result = await request.query(`SELECT * FROM exam_types`)
        return result.recordset


    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }

}


exports.sub_topics_get = async (data) => {

    try {
        const request = new sql.Request(pool());

        const result = await request
        .input('subject_id',sql.Int,data.subject_id)
        .query(`SELECT * FROM sub_topics WHERE subject_id = @subject_id`)
        return result.recordset


    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }

}


exports.micro_sub_topics = async (data) => {

    try {
        const request = new sql.Request(pool());

        const result = await request
        .input('sub_topic_id',sql.Int,data.sub_topic_id)
        .query(`SELECT * FROM micro_sub_topics WHERE sub_topic_id = @sub_topic_id`)
        return result.recordset


    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }

}



exports.skill_types_get = async (data) => {

    try {
        const request = new sql.Request(pool());

        const result = await request
        .query(`SELECT * FROM skill_type`)
        return result.recordset


    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }

}










