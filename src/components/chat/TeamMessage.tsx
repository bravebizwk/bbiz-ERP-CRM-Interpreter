import { Message, useMessageContext } from 'stream-chat-react';

const TeamMessage = () => {
    const { handleOpenThread, message } = useMessageContext();

    return (
        <Message
            message={{ ...message, user: {} }}
        // handleOpenThread={handleOpenThread}
        />
    );
};

export default TeamMessage;
