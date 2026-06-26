

const  errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Something went wrong";

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    status = "fail";
    message = "Invalid ID";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    status = "fail";
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(". ");
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    status = "fail";
    message = "Duplicate field value";
  }

  res.status(statusCode).json({
    status,
    message,
    code: err.code || null,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
}

module.exports = errorHandler;