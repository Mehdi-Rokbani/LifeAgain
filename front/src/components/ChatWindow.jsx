import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import "../assets/styles/chatwindow.css";
import axios from "axios";
import { socket } from "../socket";
import React from "react";
export default function ChatWindow({ conversation, user }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);

    const bottomRef = useRef(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // LOAD MESSAGES
    useEffect(() => {
        if (!conversation?._id) return;

        const loadMessages = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/messages/${conversation._id}/messages`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                setMessages(res.data);
                scrollToBottom();
            } catch (err) {
                console.log("LOAD MESSAGES ERROR:", err);
            }
        };

        loadMessages();
    }, [conversation]);

    // SOCKET LISTENERS
    useEffect(() => {
        const handleNewMessage = (msg) => {
            if (msg.conversation === conversation._id) {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            }
        };

        const handleTyping = (senderId) => {
            if (senderId !== user.id) {
                setTyping(true);
                setTimeout(() => setTyping(false), 1500);
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("typing", handleTyping);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("typing", handleTyping);
        };
    }, [conversation, user.id]);

    // SEND MESSAGE
    const handleSend = async () => {
        if (!input.trim()) return;

        const msg = {
            conversationId: conversation._id,
            senderId: user.id,
            text: input,
        };

        console.log("Sending:", msg);
        socket.emit("send_message", msg);

        try {
            const res = await axios.post(
                "http://localhost:5000/api/messages/send",
                msg,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setMessages(prev => [...prev, res.data]); // always add server version
        } catch (err) {
            console.log("SEND MESSAGE ERROR:", err);
        }

        setInput("");
        scrollToBottom();
    };

    const onType = (e) => {
        setInput(e.target.value);
        socket.emit("typing", {
            conversationId: conversation._id,
            senderId: user.id,
        });
    };

    return (
        <div className="chat-window">

            <div className="chat-header">
                <img
                    src={conversation.otherUser?.profilePicture || "/default-avatar.png"}
                    className="chat-header-avatar"
                />
                <span>{conversation.otherUser?.username}</span>
            </div>

            <div className="chat-messages">
                {messages.map((msg, i) => {
                    const senderId = msg.sender?.id || msg.sender;
                    return (
                        <MessageBubble
                            key={i}
                            message={msg}
                            isOwn={senderId === user.id}
                        />
                    );
                })}

                {typing && (
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                )}

                <div ref={bottomRef}></div>
            </div>

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
