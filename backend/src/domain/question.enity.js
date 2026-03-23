const Joi = require('joi');

const question_options_schema = Joi.object({
    option_text: Joi.string().allow('').required().messages({
        'any.required': 'The "option_text" field is required.',
        'string.base': 'The "option_text" must be a string.'
    }),
    is_correct: Joi.number().integer().valid(0, 1).required().messages({
        'any.required': 'The "is_correct" information is required.',
        'number.base': 'The "is_correct" field must be a number (0 or 1).',
        'any.only': 'The "is_correct" field can only be 0 or 1.'
    })
});

exports.questionSchema = Joi.object({
    is_active: Joi.boolean().required().messages({
        'any.required': 'The "is_active" field is required.',
        'boolean.base': 'The "is_active" must be a valid boolean (true/false).'
    }),
    question_text: Joi.string().required().messages({
        'any.required': 'The "question_text" field is required.',
        'string.empty': 'The "question_text" cannot be empty.'
    }),
    difficulty_level: Joi.number().min(1).max(100).required().messages({
        'any.required': 'The "difficulty_level" field is required.',
        'number.base': 'The "difficulty_level" must be a number.',
        'number.min': 'The "difficulty_level" must be at least 1.',
        'number.max': 'The "difficulty_level" cannot exceed 100.'
    }),

    skill_types: Joi.array().items(Joi.number())
        .min(1)
        .required()
        .messages({
            'array.min': 'You must select at least one "skill_types"!',
            'any.required': 'The "skill_types" list is required!'
        }),
    objective_codes: Joi.string().allow(null, '').required().messages({
        'any.required': 'The "objective_codes" field is required.'
    }),
    question_options: Joi.array()
        .items(question_options_schema)
        .min(4)
        .required()
        .messages({
            'array.min': 'You must add at least 1 option to "question_options"!',
            'any.required': 'The "question_options" list is required!'
        }),
    subject_id: Joi.number().required().messages({
        'any.required': 'The "subject_id" must be selected.',
        'number.base': 'The "subject_id" must be a number.'
    }),
    exam_types: Joi.array().items(Joi.number())
        .min(1)
        .required()
        .messages({
            'array.min': 'You must select at least one "exam_types"!',
            'any.required': 'The "exam_types" list is required!'
        }),
    sub_topics: Joi.array().items(Joi.number())
        .min(1)
        .required()
        .messages({
            'array.min': 'You must select at least one "sub_topics"!',
            'any.required': 'The "sub_topics" list is required!'
        }),
    micro_sub_topics: Joi.array().items(Joi.number())
        .min(1)
        .required()
        .messages({
            'array.min': 'You must select at least one "micro_sub_topics"!',
            'any.required': 'The "micro_sub_topics" list is required!'
        }),
    vektor_txt: Joi.string().required().messages({
        'any.required': 'The "vektor_txt" field is required.',
        'string.empty': 'The "vektor_txt" cannot be empty.'
    }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'The request contains unknown fields.',
        'object.min': 'The submitted data cannot be empty!',
        'any.required': 'The request body was not found!'
    });