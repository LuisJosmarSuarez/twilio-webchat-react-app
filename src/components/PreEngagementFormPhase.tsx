import { Box } from "@twilio-paste/core/box";
import { FormEvent } from "react";
import { Button } from "@twilio-paste/core/button";
import { useDispatch, useSelector } from "react-redux";
import { Text } from "@twilio-paste/core/text";
import { ChatIcon } from "@twilio-paste/icons/esm/ChatIcon";

import { sessionDataHandler } from "../sessionDataHandler";
import { addNotification, changeEngagementPhase } from "../store/actions/genericActions";
import { initSession } from "../store/actions/initActions";
import { AppState, EngagementPhase } from "../store/definitions";
import { Header } from "./Header";
import { notifications } from "../notifications";
import { NotificationBar } from "./NotificationBar";
import { introStyles, titleStyles, formStyles } from "./styles/PreEngagementFormPhase.styles";

export const PreEngagementFormPhase = () => {
    const { name } = useSelector((state: AppState) => state.session.preEngagementData) || {};
    const dispatch = useDispatch();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        dispatch(changeEngagementPhase({ phase: EngagementPhase.Loading }));
        try {
            const data = await sessionDataHandler.fetchAndStoreNewSession({
                formData: {
                    friendlyName: name
                }
            });
            dispatch(initSession({ token: data.token, conversationSid: data.conversationSid }));
        } catch (err) {
            dispatch(addNotification(notifications.failedToInitSessionNotification((err as Error).message)));
            dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        }
    };

    return (
        <>
            <Header />
            <NotificationBar />
            <Box
                as="form"
                data-test="pre-engagement-chat-form"
                onSubmit={handleSubmit}
                {...formStyles}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
            >
                <ChatIcon decorative={false} title="Chat icon" size="sizeIcon100" />
                <Text {...titleStyles} as="h3">
                    Nami Helpline
                </Text>
                <Text {...introStyles} as="p">
                    We&#39;re here to help. Click Start Chat.
                </Text>

                <Button variant="primary" type="submit" data-test="pre-engagement-start-chat-button">
                    Start chat
                </Button>
            </Box>
        </>
    );
};
