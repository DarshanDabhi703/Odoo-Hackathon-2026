/**
 * Shared response helpers — enforces the standard envelope:
 *  Success: { success: true,  data: {},   message: "" }
 *  Error:   { success: false, error: { code: "", message: "" } }
 */

/**
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message]
 * @param {number} [statusCode=200]
 */
const successResponse = (res, data, message = '', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

/**
 * @param {import('express').Response} res
 * @param {string} code
 * @param {string} message
 * @param {number} [statusCode=400]
 */
const errorResponse = (res, code, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};

module.exports = { successResponse, errorResponse };
