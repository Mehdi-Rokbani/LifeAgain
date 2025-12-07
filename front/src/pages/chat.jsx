import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import { useState } from "react";

export default function Chat() {
    const user = JSON.parse(localStorage.getItem("user"));
    const [selected, setSelected] = useState(null);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <ChatSidebar userId={user.user._id} onSelectConversation={setSelected} />
            {selected ? (
                <ChatWindow conversation={selected} user={user.user} />
            ) : (
                <div style={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#999"
                }}>
                    Select a conversation
                </div>
            )}
        </div>
    );
}
