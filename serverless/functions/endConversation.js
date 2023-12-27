exports.handler = async (context, event, callback) => {
    // Access the NodeJS Helper Library by calling context.getTwilioClient()
    const client = context.getTwilioClient();

    // Create a custom Twilio Response
    const response = new Twilio.Response();
    // Set the CORS headers to allow Flex to make an error-free HTTP request
    // to this Function
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

    // Use the NodeJS Helper Library to make an API call and gather
    // statistics for the Flex Plugin.
    // Note that the workspace SID is passed from the event parameter
    // of the incoming request.
    try {
        const workspaceSid = "WS883e01c3256624aff9ef2c3271ee67e1";
        const conversationSid = event.conversationSid;
        const possibleTaskStatus = ["pending", "reserved", "assigned"];
        // Close Conversation
        const conversation = await client.conversations.v1.conversations(conversationSid).fetch();
        if (conversation.state == "active") {
            await client.conversations.v1.conversations(conversationSid).update({ state: "closed" });
        }

        // Change Task status
        const tasks = await client.taskrouter.v1.workspaces(workspaceSid).tasks.list({
            evaluateTaskAttributes: `conversationSid =='${conversationSid}'`,
            assignmentStatus: possibleTaskStatus.join(","),
            limit: 1
        });
        if (tasks.length > 0) {
            const task = tasks[0];
            let assignmentStatus = "wrapping";
            if (task.assignmentStatus === "pending" || task.assignmentStatus === "reserved") {
                assignmentStatus = "canceled";
            }
            if (possibleTaskStatus.includes(task.assignmentStatus)) {
                await client.taskrouter.v1.workspaces(workspaceSid).tasks(task.sid).update({
                    assignmentStatus: assignmentStatus
                });
            }
        }
        response.appendHeader("Content-Type", "application/json");
        response.setBody(conversation);
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
