// const AccessToken = require("twilio").jwt.AccessToken;
const { TOKEN_TTL_IN_SECONDS } = require(Runtime.getFunctions()["helpers/constants"].path);
const { createToken } = require(Runtime.getFunctions()["helpers/createToken"].path);
exports.handler = async function (context, event, callback) {
    const client = context.getTwilioClient();
    // Create a custom Twilio Response
    const response = new Twilio.Response();

    // Set the CORS headers to allow Flex to make an error-free HTTP request
    // to this Function
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

    const contactWebchatOrchestrator = async (request, customerFriendlyName) => {
        console.log("Calling Webchat Orchestrator");
        let orchestratorResponse;
        try {
            orchestratorResponse = await client.flexApi.v2.webChannels.create({
                chatFriendlyName: "Webchat widget",
                customerFriendlyName: customerFriendlyName,
                addressSid: process.env.ADDRESS_SID,
                PreEngagementData: JSON.stringify({
                    ...request.body?.formData,
                    friendlyName: customerFriendlyName
                })
            });
            console.log("Webchat Orchestrator successfully called");
        } catch (e) {
            console.log("Something went wrong during the orchestration:", e.response?.data?.message);
            throw e.response.data;
        }

        return orchestratorResponse;
    };

    const sendWelcomeMessage = async (conversationSid) => {
        try {
            const message = await client.conversations.v1.conversations(conversationSid).messages.create({
                body: "Welcome to the NAMI HelpLine. If you are in crisis, text CRISIS. Before you proceed, please review our terms of use, linked above. If you understand and agree to the terms of use, text GO.",
                author: "NAMI HelpLine"
            });
            console.log(message.sid);
        } catch (e) {
            console.log(`Couldn't send welcome message: ${e?.message}`);
        }
    };

    const initWebchatController = async (request, response) => {
        console.log("Initiating webchat");

        const customerFriendlyName = event.formData?.friendlyName || "Anonymous";

        let conversationSid;
        let identity;

        // Hit Webchat Orchestration endpoint to generate conversation and get customer participant sid
        try {
            const result = await contactWebchatOrchestrator(request, customerFriendlyName);
            ({ identity, conversationSid } = result);
        } catch (error) {
            response.appendHeader("Content-Type", "plain/text");
            response.setBody(err.message);
            response.setStatusCode(500);
        }

        // Generate token for customer
        const token = createToken(identity);
        await sendWelcomeMessage(conversationSid);
        response.appendHeader("Content-Type", "application/json");
        response.body = {
            token,
            conversationSid,
            expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000
        };
    };

    // Execute the Twilio Serverless Function
    try {
        await initWebchatController(event, response);
        return callback(null, response);
    } catch (error) {
        return callback(error);
    }
};
