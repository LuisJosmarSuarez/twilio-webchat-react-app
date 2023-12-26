const Twilio = require("twilio");
const { TOKEN_TTL_IN_SECONDS } = require(Runtime.getFunctions()["helpers/constants"].path);

const createToken = (identity) => {
    console.log("Creating new token");

    const { AccessToken } = Twilio.jwt;
    const { ChatGrant } = AccessToken;

    const chatGrant = new ChatGrant({
        serviceSid: process.env.CONVERSATIONS_SERVICE_SID
    });

    const token = new AccessToken(process.env.ACCOUNT_SID, process.env.API_KEY, process.env.API_SECRET, {
        identity,
        ttl: TOKEN_TTL_IN_SECONDS
    });
    token.addGrant(chatGrant);
    const jwt = token.toJwt();
    console.log("New token created");
    return jwt;
};

module.exports = { createToken };
