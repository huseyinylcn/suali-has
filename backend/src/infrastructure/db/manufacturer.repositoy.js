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


exports.sub_topics_get = async (data = {}) => {

    try {
        const request = new sql.Request(pool());

        const result = await request
            .input('subject_id', sql.Int, data.subject_id || null)
            .query(`SELECT * FROM sub_topics WHERE (@subject_id IS NULL OR subject_id = @subject_id)`)
        return result.recordset


    } catch (error) {
        throw error;
    }

}


exports.micro_sub_topics = async (data) => {

    try {
        const request = new sql.Request(pool());

        const result = await request
            .input('sub_topic_id', sql.Int, data.sub_topic_id || null)
            .query(`SELECT * FROM micro_sub_topics WHERE (@sub_topic_id IS NULL OR sub_topic_id = @sub_topic_id)`)
        return result.recordset


    } catch (error) {
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

exports.filtered_data = async (data) => {

    try {
        const request = new sql.Request(pool());

        const subTopicArr = typeof data.sub_topic_id === 'string'
            ? JSON.parse(data.sub_topic_id)
            : data.sub_topic_id;

        const subTopicStr = (subTopicArr && subTopicArr.length > 0)
            ? subTopicArr.join(',')
            : null;


        const subjectArr = typeof data.subject_id === 'string'
            ? JSON.parse(data.subject_id)
            : data.subject_id;

        const subjectStr = (subjectArr && subjectArr.length > 0)
            ? subjectArr.join(',')
            : null;


        const microSubTopicArr = typeof data.micro_sub_topic_id === 'string'
            ? JSON.parse(data.micro_sub_topic_id)
            : data.micro_sub_topic_id;

        const microSubTopicStr = (microSubTopicArr && microSubTopicArr.length > 0)
            ? microSubTopicArr.join(',')
            : null;




        const examTypeArr = typeof data.exam_type_id === 'string'
            ? JSON.parse(data.exam_type_id)
            : data.exam_type_id;

        const examTypeStr = (examTypeArr && examTypeArr.length > 0)
            ? examTypeArr.join(',')
            : null;





        const skillTypeArr = typeof data.skill_type_id === 'string'
            ? JSON.parse(data.skill_type_id)
            : data.skill_type_id;

        const skillTypeStr = (skillTypeArr && skillTypeArr.length > 0)
            ? skillTypeArr.join(',')
            : null;

        const sourceArr = typeof data.source_id === 'string'
            ? JSON.parse(data.source_id)
            : data.source_id;

        const sourceStr = (sourceArr && sourceArr.length > 0)
            ? sourceArr.join(',')
            : null;



        const result = await request
            .input('subject_id', sql.VarChar, subjectStr || null)
            .input('sub_topic_id', sql.VarChar, subTopicStr || null)
            .input('micro_sub_topic_id', sql.VarChar, microSubTopicStr || null)
            .input('exam_type_id', sql.VarChar, examTypeStr || null)
            .input('skill_type_id', sql.VarChar, skillTypeStr || null)
            .input('source_id', sql.VarChar, sourceStr || null)




            .input('beginning', sql.Date, data.beginning || null)
            .input('finish', sql.Date, data.finish || null)
            .input('amount', sql.Int, data.amount || null)



            .query(`
            
            select top(@amount)
                s.subject_name,
                q.*,
                (
                    SELECT qo.option_id, qo.option_text,qo.is_correct
                    FROM question_options qo
                    WHERE qo.question_id = q.question_id
                    FOR JSON PATH
                ) AS question_options,
                (
                    SELECT st.sub_topic_id,st.sub_topic_name from sub_topic_mappings stm
                    left join sub_topics st on st.sub_topic_id = stm.sub_topic_id
                    where stm.question_id = q.question_id
                    FOR JSON PATH
                ) AS sub_topics,
                (
                    SELECT mst.micro_sub_topic_id,mst.micro_sub_topic_name from micro_sub_topic_mapping mstm
                    left join micro_sub_topics mst on mst.micro_sub_topic_id = mstm.micro_sub_topic_id
                    where mstm.question_id = q.question_id
                    FOR JSON PATH
                ) AS micro_sub_topics,
                (
                    SELECT et.exam_type_id,et.exam_type_name from question_exam_mappings etm
                    left join exam_types et on et.exam_type_id = etm.exam_type_id
                    where etm.question_id = q.question_id
                    FOR JSON PATH
                ) AS exam_types,
                (
                    SELECT st.skill_type_id, st.skill_type_name from skill_types_mapping stm
                    left join skill_type st on st.skill_type_id = stm.skill_type_id
                    where stm.question_id = q.question_id
                    FOR JSON PATH
                ) AS skill_type

            from questions q
                left join subjects s on s.subject_id = q.subject_id
            where 
                (@source_id IS NULL OR q.source_id IN (@source_id))
                AND (@subject_id IS NULL OR q.subject_id IN (@subject_id))
                AND  (@beginning IS NULL OR q.created_at >= @beginning) 
                AND (@finish IS NULL OR q.created_at <= @finish) 
                AND EXISTS (
                    SELECT 1 
                    FROM sub_topic_mappings stm 
                    WHERE stm.question_id = q.question_id 
                    AND (@sub_topic_id IS NULL OR stm.sub_topic_id IN (@sub_topic_id))
                )
                AND EXISTS (
                    SELECT 1 
                    FROM micro_sub_topic_mapping mstm 
                    WHERE mstm.question_id = q.question_id 
                    AND (@micro_sub_topic_id IS NULL OR mstm.micro_sub_topic_id IN (@micro_sub_topic_id))
                )
                AND EXISTS (
                    SELECT 1 
                    FROM question_exam_mappings em 
                    WHERE em.question_id = q.question_id 
                    AND (@exam_type_id IS NULL OR em.exam_type_id IN (@exam_type_id))
                )
                AND EXISTS (
                    SELECT 1 
                    FROM skill_types_mapping stm 
                    WHERE stm.question_id = q.question_id 
                    AND (@skill_type_id IS NULL OR stm.skill_type_id IN (@skill_type_id))
                )

                order by q.created_at desc
                
                
                `)
        return result.recordset


    } catch (error) {
        throw error;
    }

}



exports.similar_question = async (data) => {

    try {

        const request = new sql.Request(pool());

        const questionArr = data.question_id

        const questionStr = questionArr.join(',')
         


        const result = await request
            .input('question_id', sql.VarChar, questionStr || null)



            .query(`

            select 
                s.subject_name,
                q.*,
                (
                    SELECT qo.option_id, qo.option_text,qo.is_correct
                    FROM question_options qo
                    WHERE qo.question_id = q.question_id
                    FOR JSON PATH
                ) AS question_options,
                (
                    SELECT st.sub_topic_id,st.sub_topic_name from sub_topic_mappings stm
                    left join sub_topics st on st.sub_topic_id = stm.sub_topic_id
                    where stm.question_id = q.question_id
                    FOR JSON PATH
                ) AS sub_topics,
                (
                    SELECT mst.micro_sub_topic_id,mst.micro_sub_topic_name from micro_sub_topic_mapping mstm
                    left join micro_sub_topics mst on mst.micro_sub_topic_id = mstm.micro_sub_topic_id
                    where mstm.question_id = q.question_id
                    FOR JSON PATH
                ) AS micro_sub_topics,
                (
                    SELECT et.exam_type_id,et.exam_type_name from question_exam_mappings etm
                    left join exam_types et on et.exam_type_id = etm.exam_type_id
                    where etm.question_id = q.question_id
                    FOR JSON PATH
                ) AS exam_types,
                (
                    SELECT st.skill_type_id, st.skill_type_name from skill_types_mapping stm
                    left join skill_type st on st.skill_type_id = stm.skill_type_id
                    where stm.question_id = q.question_id
                    FOR JSON PATH
                ) AS skill_type

            from questions q
                left join subjects s on s.subject_id = q.subject_id
            where 
                
                q.question_id in (SELECT value FROM STRING_SPLIT(@question_id, ','))
                
                
                `)

            
        return result.recordset


    } catch (error) {
        throw error;
    }

}









