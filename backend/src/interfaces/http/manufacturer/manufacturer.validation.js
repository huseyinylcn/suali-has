exports.validation = (schema) => (req, res, next) => {

    const data = (req.method === "GET" ? req.query : req.body) || {};

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ err: "Request body cannot be empty!" });
    }

    const { error, value } = schema.validate(data);
    if (error) return res.status(400).json({ err: error.details[0].message });
    req.body = value;
    next();
};