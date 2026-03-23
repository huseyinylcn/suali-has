const Joi = require('joi');


exports.microSubTopicsSchema = Joi.object({
    sub_topic_id: Joi.number().required().messages({
        'any.required': 'The "sub_topic_id" is required.',
        'number.base': 'The "sub_topic_id" must be a number format.'
    })

})
    .unknown(false)
    .messages({
        'object.unknown': 'The request contains unknown fields.',
        'object.min': 'The submitted data cannot be empty!',
        'any.required': 'The request body was not found!'
    });



exports.subTopicsSchema = Joi.object({
    subject_id: Joi.number().required().messages({
        'any.required': 'The "subject_id" is required.',
        'number.base': 'The "subject_id" must be a number format.'
    })

})
    .unknown(false)
    .messages({
        'object.unknown': 'The request contains unknown fields.',
        'object.min': 'The submitted data cannot be empty!',
        'any.required': 'The request body was not found!'
    });


    exports.mathpix_translateSchema = Joi.object({
    image: Joi.string().required().messages({
        'any.required': 'The "image" is required.',
        'number.base': 'The "image" must be a string format.'
    })

})
    .unknown(false)
    .messages({
        'object.unknown': 'The request contains unknown fields.',
        'object.min': 'The submitted data cannot be empty!',
        'any.required': 'The request body was not found!'
    });



