const logger = (req, res, next) => {
    const method = req.method;
    const url = req.url;
    console.log(`Requête ${method} à l'URL: ${url}`);
    
    next();
};

export default logger;
