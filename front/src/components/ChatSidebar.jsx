import { useEffect, useState } from "react";
import axios from "axios";
import ChatItem from "./ChatItem";
import "../assets/styles/chat.css";
import React from "react";
export default function ChatSidebar({ userId, onSelectConversation }) {
    const [search, setSearch] = useState("");
    const [conversations, setConversations] = useState([]);

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
                            onClick={() => onSelectConversation(c)}
                        />
                    ))}
            </div>
        </div>
    );
}
