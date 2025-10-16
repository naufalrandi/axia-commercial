const { ResponseError } = require("./../errors/response-error");

const errorMiddleware = async (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  console.log({
    level: "error",
    message: err.message,
    stack: err.stack,
  });

  if (err instanceof ResponseError) {
    res
      .status(err.status)
      .json({
        success: false,
        errors: err.message,
      })
      .end();
  } else {
    res
      .status(500)
      .json({
        success: false,
        errors: err.message,
      })
      .end();
  }
};

module.exports = errorMiddleware;
