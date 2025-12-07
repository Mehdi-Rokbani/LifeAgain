import "../assets/styles/chat.css";

export default function ChatItem({ conversation, onClick }) {
    const {
        otherUser,
        lastMessage,
        updatedAt,
        unread,
    } = conversation;

    return (
        <div className="chat-item" onClick={onClick}>
            <img
                src={otherUser.profilePicture || "/default-avatar.png"}
                className="chat-item-avatar"
            />

            <div className="chat-item-body">
                <div className="chat-item-header">
                    <span className="chat-item-name">{otherUser.username}</span>
                    <span className="chat-item-time">
                        {new Date(updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>

                <div className="chat-item-message">
                    {lastMessage?.length > 30
                        ? lastMessage.slice(0, 30) + "..."
                        : lastMessage}
                </div>
            </div>

            {/* UNREAD BADGE */}
            {unread > 0 && (
                <div className="chat-item-unread">
                    {unread}
                </div>
            )}
        </div>
    );
}
