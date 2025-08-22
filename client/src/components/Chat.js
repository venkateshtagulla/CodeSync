import React, { useState, useEffect, useRef } from 'react';

function Chat({ messages, onSendMessage, currentUser }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="d-flex flex-column" style={{ height: '400px' }}>
      <div className="chat-container flex-grow-1 p-3 border-bottom">
        {messages.length === 0 ? (
          <div className="text-center text-muted">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="mb-2">
              <div className="d-flex justify-content-between">
                <strong className={`small ${message.userId === currentUser?.id ? 'text-primary' : 'text-secondary'}`}>
                  {message.user}
                </strong>
                <small className="text-muted">
                  {formatTime(message.timestamp)}
                </small>
              </div>
              <div className="text-break">
                {message.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3">
        <form onSubmit={handleSendMessage} className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;