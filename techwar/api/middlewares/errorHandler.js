const errorHandler = (err, req, res, next)=>{
  const status = err.status || 500;
  console.error(err.stack);
  res.status(status).json({
    success: false,
    message: err.message || "An unexpected error occurred"
  });
};

export default errorHandler;