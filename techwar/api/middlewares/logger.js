const logger = (req, res, next)=>{
  const { method, url } = req;
  console.log(JSON.stringify({
    method,
    url,
    timestamp: new Date().toLocaleTimeString()
  }));
  next();
};

export default logger;