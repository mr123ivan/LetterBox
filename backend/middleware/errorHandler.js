// backend/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    // Check if a specific status code was set, otherwise default to 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode);
    
    // Send back a JSON response for the error
    res.json({
        message: err.message,
        // Only include the stack trace if we are in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };