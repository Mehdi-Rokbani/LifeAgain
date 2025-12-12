import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import "../assets/styles/chatwindow.css";
import axios from "axios";
import { socket } from "../socket";
import React from "react";

export default function ChatWindow({ conversation, user }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typingUser, setTypingUser] = useState(null);

    const bottomRef = useRef(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // ============================================================
    // LOAD MESSAGES WHEN OPENING A CONVERSATION
    // ============================================================
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

                // Join socket room
                socket.emit("joinConversation", conversation._id);

            } catch (err) {
                console.log("LOAD MESSAGES ERROR:", err);
            }
        };

        loadMessages();
    }, [conversation]);

    // ============================================================
    // SOCKET LISTENERS (new messages + typing indicator)
    // ============================================================
    useEffect(() => {
        if (!conversation) return;

        const handleNewMessage = (msg) => {
            const senderId =
                typeof msg.sender === "string" ? msg.sender : msg.sender?._id;

            // Ignore my own message because optimistic UI already added it
            if (senderId === user._id || senderId === user.id) return;

            if (msg.conversation === conversation._id) {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            }
        };


        const handleTyping = ({ userId }) => {
            if (userId !== user._id && userId !== user.id) {
                setTypingUser(userId);

                setTimeout(() => {
                    setTypingUser(null);
                }, 1200);
            }
        };

        const stopTyping = ({ userId }) => {
            if (userId !== user._id && userId !== user.id) {
                setTypingUser(null);
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("typing", handleTyping);
        socket.on("stopTyping", stopTyping);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("typing", handleTyping);
            socket.off("stopTyping", stopTyping);
        };
    }, [conversation, user._id, user.id]);

    // ============================================================
    // SEND MESSAGE
    // ============================================================
    const handleSend = async () => {
        if (!input.trim()) return;

        const payload = {
            conversationId: conversation._id,
            senderId: user._id,
            text: input.trim(),
        };

        // ⚡ OPTIMISTIC UI UPDATE (shows instantly)
        setMessages(prev => [
            ...prev,
            {
                conversation: conversation._id,
                sender: { _id: user._id },
                content: input.trim(),
                createdAt: new Date().toISOString()
            }
        ]);

        scrollToBottom();

        // stop typing animation
        socket.emit("stopTyping", {
            conversationId: conversation._id,
            userId: user._id
        });

        try {
            const res = await axios.post(
                "http://localhost:5000/api/messages/send",
                payload,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

        } catch (err) {
            console.log("SEND MESSAGE ERROR:", err);
        }

        setInput("");
    };

    // ============================================================
    // TYPING INDICATOR
    // ============================================================
    let typingTimeout;

    const handleTyping = (value) => {
        setInput(value);

        socket.emit("typing", {
            conversationId: conversation._id,
            userId: user._id
        });

        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
            socket.emit("stopTyping", {
                conversationId: conversation._id,
                userId: user._id
            });
        }, 700);
    };

    // ============================================================
    // RENDER UI
    // ============================================================
    return (
        <div className="chat-window">

            <div className="chat-header">
                <img
                    src={conversation.otherUser?.profilePicture || "/default-avatar.png"}
                    className="chat-header-avatar"
                    alt=""
                />
                <span>{conversation.otherUser?.username}</span>
            </div>

            <div className="chat-messages">
                {messages.map((msg, i) => {
                    const senderId =
                        typeof msg.sender === "string"
                            ? msg.sender
                            : msg.sender?._id;

                    return (
                        <MessageBubble
                            key={i}
                            message={msg}
                            isOwn={senderId === user._id || senderId === user.id}
                        />
                    );
                })}

                {typingUser && (
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                )}

                <div ref={bottomRef}></div>
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Write a message…"
                    value={input}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}
