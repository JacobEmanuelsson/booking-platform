function validate(schema) {
  return function (req, res, next) {
    console.log("Request body:", req.body);
    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.log("Validation errors:", result.error.errors);
      return res.status(400).json({
        error: "Invalid input",
        details: result.error.errors
      });
    }

    req.body = result.data; // sanitized
    next();
  };
}

module.exports = {
    validate,
}