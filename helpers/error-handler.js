function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    // jwt authentication error
    return res.status(401).json({ message: "The user is not authorized" });
  }

  if (err.name === "ValidationError") {
    // validation error
    return res.status(422).json({ message: err.message }); // Using 422 Unprocessable Entity for validation errors
  }

  // default to 500 server error
  return res.status(500).json({ message: "Internal Server Error" });
}

module.exports = errorHandler;
