import React from "react";
import Conversation from "../../../../betonquest/Conversation";

interface ConversationEditorProps {
    conversation: Conversation,
    syncYaml: Function,
}

export default function conversationEditor( props: ConversationEditorProps ) {
    console.log("prpos.test in conversation editor:", props.conversation);
    // props.conversation.setQuester("test quester");

    return(
        <>
            conversation editor<br />
            quester: {props.conversation.getQuester()}<br />
            first: {props.conversation.getFirst()}<br />
            stop: {props.conversation.getStop()}<br />
            ...
        </>
    );
}