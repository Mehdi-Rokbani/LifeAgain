import "../assets/styles/chatwindow.css";

export default function MessageBubble({ message, isOwn }) {
    return (
        <div className={`bubble-row ${isOwn ? "own" : ""}`}>
            <div className="bubble">
                {message.text}

                <div className="bubble-time">
                    {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            </div>
        </div>
    );
}
