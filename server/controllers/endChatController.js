const { getTwilioClient } = require("../helpers/getTwilioClient");

const endChatController = async (req, res) => {
    const possibleTaskStatus = ["pending", "reserved", "assigned"];
    try {
        const workspaceSid = "WS883e01c3256624aff9ef2c3271ee67e1";
        const conversationSid = req.body?.conversationSid;
        // Close Conversation
        const client = await getTwilioClient();
        const conversation = await client.conversations.v1.conversations(conversationSid).fetch();
        if (conversation.state == "active") {
            await client.conversations.v1.conversations(conversationSid).update({ state: "closed" });
        }

        // Change Task status
        const tasks = await client.taskrouter.v1.workspaces(workspaceSid).tasks.list({
            evaluateTaskAttributes: `conversationSid =='${conversationSid}'`,
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
            console.log(assignmentStatus);
        }
        res.json("Something Message");
    } catch (err) {
        console.error(err);
    }
};

module.exports = { endChatController };
