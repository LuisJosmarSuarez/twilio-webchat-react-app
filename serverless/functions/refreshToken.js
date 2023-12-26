const jwt = require("jsonwebtoken");
const { TOKEN_TTL_IN_SECONDS } = require(Runtime.getFunctions()["helpers/constants"].path);
const { createToken } = require(Runtime.getFunctions()["helpers/createToken"].path);
exports.handler = async (context, event, callback) => {
    console.log("Refreshing token");

    // Access the NodeJS Helper Library by calling context.getTwilioClient()
    const client = context.getTwilioClient();

    // Create a custom Twilio Response
    const response = new Twilio.Response();
    // Set the CORS headers to allow Flex to make an error-free HTTP request
    // to this Function
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

    try {
        let providedIdentity;
        const validatedToken = await new Promise((res, rej) =>
            jwt.verify(event.token, process.env.API_SECRET, {}, (err, decoded) => {
                if (err) return rej(err);
                return res(decoded);
            })
        );
        providedIdentity = validatedToken?.grants?.identity;
        console.log("Token is valid for", providedIdentity);
        const refreshedToken = createToken(providedIdentity);
        console.log("Token refreshed");
        response.appendHeader("Content-Type", "application/json");
        response.setBody({
            token: refreshedToken,
            expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000
        });
        // Return a success response using the callback function
        return callback(null, response);
    } catch (err) {
        response.appendHeader("Content-Type", "plain/text");
        response.setBody(err.message);
        response.setStatusCode(500);
        // If there's an error, send an error response.
        // Keep using the response object for CORS purposes.
        return callback(null, response);
    }
};
