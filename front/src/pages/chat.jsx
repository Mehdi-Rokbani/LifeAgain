import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import { useState } from "react";

export default function Chat() {
    const authData = JSON.parse(localStorage.getItem("user"));
    const user = authData?.user || authData;   // supports both formats

    const [selected, setSelected] = useState(null);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <ChatSidebar userId={user.id} onSelectConversation={setSelected} />

            {selected ? (
                <ChatWindow conversation={selected} user={user} />
            ) : (
                <div style={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#777",
                    fontSize: "18px"
                }}>
                    Select a conversation
                </div>
            )}
        </div>
    );
}
