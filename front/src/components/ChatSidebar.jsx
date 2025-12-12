import { useEffect, useState } from "react";
import axios from "axios";
import ChatItem from "./ChatItem";
import "../assets/styles/chat.css";
import { socket } from "../socket";
import React from "react";

export default function ChatSidebar({ userId, onSelectConversation }) {
    const [search, setSearch] = useState("");
    const [conversations, setConversations] = useState([]);

    // ---------------------------------------------
    // LOAD USER CONVERSATIONS
    // ---------------------------------------------
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(
                    `http://localhost:5000/api/conversations`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                setConversations(res.data);
            } catch (err) {
                console.log("LOAD CONVERSATIONS ERROR:", err);
            }
        };

        fetchConversations();
    }, [userId]);

    // ---------------------------------------------
    // SOCKET REAL-TIME UPDATES
    // ---------------------------------------------
    useEffect(() => {
        const handleConversationUpdate = (data) => {
            setConversations(prev =>
                prev
                    .map(conv =>
                        conv._id === data.conversationId
                            ? {
                                ...conv,
                                lastMessage: data.lastMessage,
                                lastSender: data.lastSender,
                                updatedAt: data.updatedAt,
                                unread: data.lastSender !== userId, // unread if message is not mine
                            }
                            : conv
                    )
                    // MOVE updated conversation to TOP
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            );
        };

        // Listen to updates from backend
        socket.on("conversationUpdated", handleConversationUpdate);

        return () => {
            socket.off("conversationUpdated", handleConversationUpdate);
        };
    }, [userId]);

    // ---------------------------------------------
    // OPEN CONVERSATION + MARK AS READ
    // ---------------------------------------------
    const handleSelect = async (conv) => {
        let updatedConv = conv;

        if (conv.unread) {
            try {
                await axios.post(
                    "http://localhost:5000/api/conversations/mark-read",
                    { conversationId: conv._id },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );

                updatedConv = { ...conv, unread: false };

                setConversations(prev =>
                    prev.map(c =>
                        c._id === conv._id ? { ...c, unread: false } : c
                    )
                );
            } catch (err) {
                console.log("MARK READ ERROR:", err);
            }
        }

        onSelectConversation(updatedConv);
    };

    // ---------------------------------------------
    // RENDER UI
    // ---------------------------------------------
    return (
        <div className="chat-sidebar">

            <div className="chat-search">
                <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="chat-list">
                {conversations
                    .filter((c) =>
                        c.otherUser.username
                            .toLowerCase()
                            .includes(search.toLowerCase())
                    )
                    .map((c) => (
                        <ChatItem
                            key={c._id}
                            conversation={c}
                            unread={c.unread}
                            onClick={() => handleSelect(c)}
                        />
                    ))}
            </div>
        </div>
    );
}
