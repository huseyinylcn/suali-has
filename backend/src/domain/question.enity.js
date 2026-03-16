const Joi = require('joi');

const question_options_schema = Joi.object({
    option_text: Joi.string().required().messages({
        'any.required': 'Seçenek metni (option_text) zorunludur.',
        'string.base': 'Seçenek metni (option_text) bir metin (string) olmalıdır.',
        'string.empty': 'Seçenek metni (option_text)boş bırakılamaz.'
    }),
    option_image_url: Joi.string().allow(null, '').required().messages({
        'any.required': 'option_image_url alanı gönderilmelidir (boş olsa dahi).',
        'string.base': 'Görsel yolu metin formatında olmalıdır.'
    }),
    is_correct: Joi.number().integer().valid(0, 1).required().messages({
        'any.required': 'Doğru seçenek bilgisi (is_correct) zorunludur.',
        'number.base': 'is_correct alanı sayı (0 veya 1) olmalıdır.',
        'any.only': 'is_correct sadece 0 veya 1 değerini alabilir.'
    })
});

exports.questionSchema = Joi.object({
    is_active: Joi.boolean().required().messages({
        'any.required': 'is_active alanı zorunludur.',
        'boolean.base': 'is_active geçerli bir boolean (true/false) olmalıdır.'
    }),
    question_text: Joi.string().required().messages({
        'any.required': 'question_text zorunludur.',
        'string.empty': 'question_text boş bırakılamaz.'
    }),
    difficulty_level: Joi.number().min(1).max(100).required().messages({
        'any.required': 'difficulty_level zorunludur.',
        'number.base': 'difficulty_level bir sayı olmalıdır.'
    }),
    question_image_url: Joi.string().allow(null, '').required().messages({
        'any.required': 'question_image_url alanı JSON içerisinde mutlaka gönderilmelidir (boş olsa bile).',
        'string.base': 'Görsel yolu metin formatında olmalıdır.'
    }),
    source: Joi.string().required().messages({
        'any.required': 'Kaynak (source) bilgisi zorunludur.'
    }),
    skill_type: Joi.number().required().messages({
        'any.required': 'Beceri türü (skill_type) zorunludur.',
        'number.base': 'Beceri türü sayı formatında olmalıdır.'
    }),
    objective_codes: Joi.string().allow(null, '').required().messages({
        'any.required': 'Kazanım kodları zorunludur.'
    }),
    question_options: Joi.array()
        .items(question_options_schema)
        .min(1)
        .required()
        .messages({
            'array.min': 'En az 4 adet seçenek eklemelisiniz!',
            'any.required': 'Seçenek listesi zorunludur!'
        }),
    subject_id: Joi.number().required().messages({
        'any.required': 'Konu (subject_id) seçilmelidir.',
        'number.base': 'subject_id sayı olmalıdır.'
    }),
    exam_types: Joi.array().items(Joi.number())
        .min(1)
        .required()
        .messages({
            'array.min': 'En az bir sınav türü seçmelisiniz!',
            'any.required': 'Sınav türü (exam_types) listesi zorunludur!'
        }),
    sub_topics: Joi.array().items(Joi.number())
        .min(1)
        .required()
        .messages({
            'array.min': 'En az bir alt konu türü seçmelisiniz!',
            'any.required': 'alt konu türü (sub_topics) listesi zorunludur!'
        }),
    micro_sub_topics: Joi.array().items(Joi.number())
        .min(1)
        .required()
        .messages({
            'array.min': 'En az bir micro alt konu türü seçmelisiniz!',
            'any.required': 'micro alt konu türü (micro_sub_topics) listesi zorunludur!'
        }),
        vektor_txt: Joi.string().required().messages({
        'any.required': 'vektor_txt zorunludur.',
        'string.empty': 'vektor_txt boş bırakılamaz.'
    }),
})
    .unknown(false)
    .messages({
        'object.min': 'Gönderilen veri boş olamaz!',
        'any.required': 'İstek gövdesi bulunamadı!'
    });