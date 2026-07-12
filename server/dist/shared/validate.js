"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const errors_1 = require("./errors");
const response_1 = require("./response");
/**
 * Factory that returns an Express middleware validating the specified part
 * of the request against a Zod schema. Attaches the parsed, typed value back
 * to req[target] so downstream handlers receive clean data.
 */
function validate(schema, target = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[target]);
        if (!result.success) {
            const err = new errors_1.ValidationError('Request validation failed', result.error.flatten());
            (0, response_1.sendError)(res, err);
            return;
        }
        // Replace with the parsed, coerced value (e.g. Zod strips unknown keys)
        req[target] = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map