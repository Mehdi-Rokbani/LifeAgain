import "../assets/styles/chatwindow.css";

export default function MessageBubble({ message, isOwn }) {
    const time = new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className={`bubble-row ${isOwn ? "own" : ""}`}>
            <div className="bubble">
                {message.text}

                <div className="bubble-time">
                    {time}
                </div>
            </div>
        </div>
    );
}
