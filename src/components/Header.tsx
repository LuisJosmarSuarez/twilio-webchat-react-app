import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { Button } from "@twilio-paste/core/button";
import { useSelector } from "react-redux";

import { AppState } from "../store/definitions";
import { containerStyles, titleStyles } from "./styles/Header.styles";
import { contactBackend } from "../sessionDataHandler";

export const Header = ({ customTitle }: { customTitle?: string }) => {
    const { conversation } = useSelector((state: AppState) => ({
        conversation: state.chat.conversation
    }));

    const endChat = async () => {
        await contactBackend("/endConversation", {
            conversationSid: conversation?.sid
        });
    };
    return (
        <Box as="header" {...containerStyles}>
            <Text as="h2" {...titleStyles}>
                {customTitle || "Live Chat"}
            </Text>
            <Box paddingRight="space30">
                <Button variant="destructive" size="small" onClick={endChat}>
                    End Chat
                </Button>
            </Box>
        </Box>
    );
};
