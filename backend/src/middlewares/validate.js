// The validate middleware function validates request data against a specified schema, ensuring correct input before proceeding.

export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.parse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  req.body = parsed.body ?? req.body;
  req.query = parsed.query ?? req.query;
  req.params = parsed.params ?? req.params;
  next();
};
