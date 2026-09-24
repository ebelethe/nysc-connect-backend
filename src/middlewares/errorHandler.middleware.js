export const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // full error logged on your server for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong. Please try again.";

  res.status(statusCode).json({
    success: false,
    message,
  });
};