import { validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation?.run(req);
      if (result?.errors?.length) break;
    }
    const results = validationResult(req);
    if (results?.isEmpty()) {
      return next();
    }

    let errors = results?.array()?.map((error) => {
      return error?.msg;
    });

    console.log('errors', errors)
    return next({ code: errors[0], status: 401 });
  };
};
