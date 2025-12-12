import "../assets/styles/chat.css";
import React from "react";
export default function ChatItem({ conversation, unread, onClick }) {
    const other = conversation.otherUser;

    return (
        <div className="chat-item" onClick={onClick}>
            <img
                src={other.profilePicture || "/default-avatar.png"}
                className="chat-item-avatar"
            />

            <div className="chat-item-info">
                <div className="chat-item-top">
                    <span className="chat-item-username">{other.username}</span>

                    {/* Unread dot */}
                    {unread && <span className="unread-dot"></span>}
                </div>

                <div className="chat-item-last">
                    {conversation.lastMessage || "No messages yet"}
                </div>
            </div>
        </div>
    );
}
