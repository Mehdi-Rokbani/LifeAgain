import "../assets/styles/chat.css";
import React from "react";
import { getAvatarUrl } from "../utils/avatar";

export default function ChatItem({ conversation, unread, onClick }) {
    const other = conversation.otherUser;
    const avatarUrl = getAvatarUrl(other);
    return (
        <div className="chat-item" onClick={onClick}>

            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt="Profile"
                    className="chat-item-avatar"
                />
            ) : (
                <div className="chat-item-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
            )}



            <div className="chat-item-info">
                <div className="chat-item-top">
                    <span className="chat-item-username">
                        {other.username}
                    </span>

                    {unread && <span className="unread-dot"></span>}
                </div>

                <div className="chat-item-last">
                    {conversation.lastMessage || "No messages yet"}
                </div>
            </div>
        </div>
    );
}
