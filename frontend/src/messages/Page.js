import React, { useEffect, useState, useRef } from 'react';
import './messages.css';
import Sidebar from '../components/Sidebar';
import TabBar from '../components/TabBar';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState(null);
  const applicationId = localStorage.getItem('application_id');
  const messagesEndRef = useRef(null);

  const faqs = [
    { question: "What are the admission requirements?" },
    { question: "How can I check my application status?" },
    { question: "What are the available payment methods?" },
    { question: "When is the enrollment period?" }
  ];

  useEffect(() => {
    if (!applicationId) return;
    fetch(`http://localhost:5000/messages/${applicationId}`)
      .then(res => res.json())
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [applicationId]);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);
   useEffect(() => {
    if (!applicationId) return;
    fetch(`http://localhost:5000/profile/${applicationId}`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(() => setProfile(null));
  }, [applicationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = {
      application_id: applicationId,
      sender: 'user',
      message: input
    };
    await fetch('http://localhost:5000/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    });
    setMessages([...messages, { ...newMsg, created_at: new Date().toISOString() }]);
    setInput('');
  };

  return (
       <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Only render TabBar when profile is loaded to ensure avatar and name show up immediately */}
            <TabBar profile={profile} />
            <Sidebar />
    <div className="messages-container">
      {/* Sidebar */}

      {/* Main content */}
      <div className="messages-content">
        <div className="messages-panel">
          <div className="messages-title">Messages</div>
          <div className="messages-subtitle">
            Contact admissions staff for inquiries about your application.
          </div>
          <div className="messages-list">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-row ${msg.sender === 'user' ? 'user' : 'admin'}`}>
                <div className={`message-bubble ${msg.sender === 'user' ? 'user' : 'admin'}`}>
                  <strong>{msg.sender === 'user' ? 'You' : 'Admin'}</strong>
                  {msg.message}
                  <div className="message-date">
                    {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="messages-form">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="messages-input"
            />
            <button type="submit" className="messages-send-btn">➤</button>
          </form>
          <div className="messages-response-time">
            <span>⏱️ Typical response time: 24-48 hours</span>
          </div>
        </div>
        {/* FAQ Section */}
        <div className="messages-faq-section">
          <h3>Frequently Asked Questions</h3>
          <div className="messages-faq-list">
            {faqs.map((faq, idx) => (
              <button
                key={idx}
                type="button"
                className="messages-faq-item"
                onClick={() => setInput(faq.question)}
                title="Click to use this question"
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div> 
    </div>
  );
}

export default Messages;