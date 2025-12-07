import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import "../assets/styles/chatwindow.css";
import axios from "axios";
import { socket } from "../socket"; // your socket instance

export default function ChatWindow({ conversation, user }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);

    const bottomRef = useRef(null);

    // Scroll to latest message
    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load messages when conversation changes
    useEffect(() => {
        if (!conversation?._id) return;

        const loadMessages = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/messages/${conversation._id}/messages`
                );
                setMessages(res.data);
                scrollToBottom();
            } catch (err) {
                console.log("LOAD MESSAGES ERROR:", err);
            }
        };

        loadMessages();
    }, [conversation]);

    // SOCKET RECEIVING MESSAGE
    useEffect(() => {
        socket.on("receive_message", (msg) => {
            if (msg.conversationId === conversation._id) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            }
        });

        socket.on("typing", (senderId) => {
            if (senderId !== user._id) {
                setTyping(true);
                setTimeout(() => setTyping(false), 1500);
            }
        });

        return () => {
            socket.off("receive_message");
            socket.off("typing");
        };
    }, [conversation]);

    // Send message
    const handleSend = async () => {
        if (!input.trim()) return;

        const msg = {
            sender: user._id,
            conversationId: conversation._id,
            text: input,
        };

        // Emit via socket
        socket.emit("send_message", msg);

        // Update UI immediately
        setMessages((prev) => [...prev, msg]);

        // Send to API
        try {
            await axios.post("http://localhost:5000/api/messages/send", msg);
        } catch (err) {
            console.log("SEND ERROR:", err);
        }

        setInput("");
        scrollToBottom();
    };

    // Typing indicator
    const onType = (e) => {
        setInput(e.target.value);
        socket.emit("typing", {
            conversationId: conversation._id,
            senderId: user._id,
        });
    };

    return (
        <div className="chat-window">
            {/* HEADER */}
            <div className="chat-header">
                <img
                    src={conversation.otherUser.profilePicture || "/default-avatar.png"}
                    className="chat-header-avatar"
                />
                <span className="chat-header-name">
                    {conversation.otherUser.username}
                </span>
            </div>

            {/* MESSAGES */}
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <MessageBubble
                        key={i}
                        message={msg}
                        isOwn={msg.sender === user._id}
                    />
                ))}

                {typing && (
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                )}

                <div ref={bottomRef}></div>
            </div>

            {/* INPUT BAR */}
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Write a message..."
                    value={input}
                    onChange={onType}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}
