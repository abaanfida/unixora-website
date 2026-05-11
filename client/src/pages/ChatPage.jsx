import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChatPage.css";
import robotGif from "../styles/output-onlinegiftools.gif";
import bgVideo from "../styles/10296180-hd_1920_1080_25fps.mp4";

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || "http://localhost:8000";

// Format text with basic markdown-like syntax
const formatMessageText = (text) => {
  if (!text) return "";

  const lines = text.split("\n");
  const formattedLines = [];
  let inList = false;
  let listItems = [];
  let inTable = false;
  let tableRows = [];

  const processInlineFormatting = (line) => {
    // Bold: **text**
    line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic: *text*
    line = line.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
    // Links: [text](url)
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return line;
  };

  const flushList = () => {
    if (inList && listItems.length > 0) {
      formattedLines.push(`<ul class="formatted-list">${listItems.map(item => `<li>${item}</li>`).join("")}</ul>`);
      inList = false;
      listItems = [];
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1);
      formattedLines.push(`
        <table>
          <thead>
            <tr>${headerRow.map(cell => `<th>${cell}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${bodyRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      `);
      inTable = false;
      tableRows = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Table detection
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      flushList();
      inTable = true;
      if (trimmedLine.match(/^[|\s-]+$/)) return; // Skip separator line
      const rawCells = trimmedLine.split("|").slice(1, -1);
      tableRows.push(rawCells.map(cell => processInlineFormatting(cell.trim())));
      return;
    } else {
      flushTable();
    }

    // Blockquote detection
    if (trimmedLine.startsWith("> ")) {
      flushList();
      formattedLines.push(`<blockquote class="formatted-blockquote">${processInlineFormatting(trimmedLine.slice(2))}</blockquote>`);
      return;
    }

    // List detection
    const bulletMatch = trimmedLine.match(/^[-*•]\s+(.+)$/);
    const numberedMatch = trimmedLine.match(/^(\d+)[.)]\s+(.+)$/);

    if (bulletMatch || numberedMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(processInlineFormatting(bulletMatch ? bulletMatch[1] : numberedMatch[2]));
    } else {
      flushList();

      // Headers
      if (trimmedLine.startsWith("### ")) {
        formattedLines.push(`<h4 class="formatted-h4">${processInlineFormatting(trimmedLine.slice(4))}</h4>`);
      } else if (trimmedLine.startsWith("## ")) {
        formattedLines.push(`<h3 class="formatted-h3">${processInlineFormatting(trimmedLine.slice(3))}</h3>`);
      } else if (trimmedLine.startsWith("# ")) {
        formattedLines.push(`<h2 class="formatted-h2">${processInlineFormatting(trimmedLine.slice(2))}</h2>`);
      } else if (trimmedLine === "") {
        formattedLines.push("<br/>");
      } else {
        formattedLines.push(`<p class="formatted-paragraph">${processInlineFormatting(trimmedLine)}</p>`);
      }
    }
  });

  flushList();
  flushTable();

  return formattedLines.join("");
};

// Message component with formatted text
const FormattedMessage = ({ text, isBot }) => {
  if (!isBot) {
    return <span>{text}</span>;
  }

  const formattedHtml = formatMessageText(text);
  return (
    <div
      className="formatted-content"
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
};

// Sources component
const SourcesSection = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-section">
      <button
        className="sources-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="sources-icon">{isExpanded ? "▼" : "▶"}</span>
        <span>Sources ({sources.length})</span>
      </button>
      {isExpanded && (
        <div className="sources-list">
          {sources.map((source, idx) => (
            <div key={idx} className="source-item">
              <div className="source-header">
                <span className="source-university">{source.university}</span>
                {source.program && (
                  <span className="source-program">• {source.program}</span>
                )}
              </div>
              <p className="source-text">{source.text.substring(0, 200)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Typing indicator component
const TypingIndicator = () => (
  <div className="typing-indicator">
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
  </div>
);

const ChatPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState("new-chat");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8; // Subtle slow motion
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setMessages([
        {
          id: 0,
          type: "bot",
          text: `Good Morning, ${parsedUser.firstName}!`,
          subtext: "I am ready to help you",
        },
      ]);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const queryRAGAPI = async (query) => {
    const response = await fetch(`${RAG_API_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        top_k: 8,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: inputValue,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setError(null);
    setIsLoading(true);

    // If this is a new chat, add it to history
    if (currentChatId === null && messages.length <= 1) {
      const newChatId = Math.max(...chatHistory.map((c) => c.id), 0) + 1;
      const newChat = {
        id: newChatId,
        title: inputValue.substring(0, 40),
        messages: newMessages,
        timestamp: new Date().toLocaleString(),
      };

      let updatedHistory = [newChat, ...chatHistory];
      if (updatedHistory.length > 10) {
        updatedHistory = updatedHistory.slice(0, 10);
      }
      setChatHistory(updatedHistory);
      setCurrentChatId(newChatId);
    }

    try {
      const response = await queryRAGAPI(inputValue);

      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text: response.answer,
        sources: response.sources,
        confidence: response.confidence,
        tavilyUsed: response.tavily_used,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("API Error:", err);
      setError(
        "Failed to get response. Please check if the API server is running."
      );

      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "Sorry, I encountered an error while processing your request. Please make sure the API server is running and try again.",
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveNav("new-chat");
    setCurrentChatId(null);
    setError(null);
    if (user) {
      setMessages([
        {
          id: 0,
          type: "bot",
          text: `Good Morning, ${user.firstName}!`,
          subtext: "I am ready to help you",
        },
      ]);
    }
  };

  const handleLoadChat = (chatId) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setOpenMenuId(null);
      setError(null);
    }
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    setChatHistory(chatHistory.filter((c) => c.id !== chatId));
    setOpenMenuId(null);
    if (currentChatId === chatId) {
      handleNewChat();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleQuickAction = (prompt) => {
    setInputValue(prompt);
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return first + last;
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#10a37f",
      "#7c3aed",
      "#2563eb",
      "#dc2626",
      "#ea580c",
      "#ca8a04",
    ];
    const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[charCode % colors.length];
  };

  return (
    <div className="chat-container">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="background-video"
      >
        <source src={bgVideo} type="video/mp4" />
      </video>
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-nav">
            <div
              className={`nav-item ${activeNav === "new-chat" ? "active" : ""}`}
              onClick={handleNewChat}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-text">New Chat</span>
            </div>
            <div
              className="nav-item"
              onClick={() => navigate("/match")}
            >
              <span className="nav-icon">🎯</span>
              <span className="nav-text">Find Matches</span>
            </div>
          </div>

          {/* Recent Section */}
          <div className="recent-section">
            <h4 className="recent-title">Recent</h4>
            <div className="recent-items">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="recent-item-wrapper"
                  onMouseEnter={() => setHoveredItemId(chat.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <div
                    className="recent-item"
                    onClick={() => handleLoadChat(chat.id)}
                  >
                    {chat.title}
                  </div>
                  {hoveredItemId === chat.id && (
                    <div className="item-menu-container">
                      <button
                        className="item-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === chat.id ? null : chat.id
                          );
                        }}
                      >
                        ⋯
                      </button>
                      {openMenuId === chat.id && (
                        <div className="item-menu-dropdown">
                          <button
                            className="menu-option"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="sidebar-profile">
          <div className="profile-info">
            {user && (
              <>
                <div
                  className="profile-avatar"
                  style={{
                    backgroundColor: getAvatarColor(user.firstName),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "white",
                  }}
                >
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className="profile-details">
                  <p className="profile-name">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-main">
            <div className="bot-greeting-pill">
              <img src={robotGif} alt="Robot Assistant" className="robot-icon-gif" />
              <div className="bot-text-group">
                <span className="bot-badge">UNIXORA_BOT_ACTIVE</span>
                <span className="bot-status-sub">SYSTEM READY</span>
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="home-btn" onClick={() => navigate("/")}>
              Home
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.length === 1 && (
            <div className="welcome-section">
              <div className="welcome-greeting">
                <p className="greeting-main">{messages[0].text}</p>
                <p className="greeting-sub">{messages[0].subtext}</p>
              </div>

              <div className="quick-actions">
                <div
                  className="quick-action-item"
                  onClick={() =>
                    handleQuickAction("Find universities by location")
                  }
                >
                  <p className="quick-action-title">
                    Find universities by location
                  </p>
                  <span className="quick-action-time">Right now</span>
                </div>
                <div
                  className="quick-action-item"
                  onClick={() =>
                    handleQuickAction("Compare scholarship programs")
                  }
                >
                  <p className="quick-action-title">
                    Compare scholarship programs
                  </p>
                  <span className="quick-action-time">2 min</span>
                </div>
                <div
                  className="quick-action-item"
                  onClick={() =>
                    handleQuickAction("Best universities for Engineering")
                  }
                >
                  <p className="quick-action-title">
                    Best universities for Engineering
                  </p>
                  <span className="quick-action-time">5 min</span>
                </div>
                <div
                  className="quick-action-item"
                  onClick={() =>
                    handleQuickAction("Top-ranked universities worldwide")
                  }
                >
                  <p className="quick-action-title">
                    Top-ranked universities in the UK
                  </p>
                  <span className="quick-action-time">12 min</span>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            if (msg.id === 0 && messages.length === 1) return null;
            return (
              <div key={idx} className={`message ${msg.type}`}>
                <div
                  className={`message-content ${msg.type} ${
                    msg.isError ? "error" : ""
                  }`}
                >
                  <FormattedMessage
                    text={msg.text}
                    isBot={msg.type === "bot"}
                  />
                  {msg.sources && msg.sources.length > 0 && (
                    <SourcesSection sources={msg.sources} />
                  )}
                  {msg.confidence !== undefined && (
                    <div className="confidence-indicator">
                      <span className="confidence-label">Confidence:</span>
                      <div className="confidence-bar">
                        <div
                          className="confidence-fill"
                          style={{ width: `${msg.confidence * 100}%` }}
                        />
                      </div>
                      <span className="confidence-value">
                        {Math.round(msg.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="message bot">
              <div className="message-content bot">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button className="error-dismiss" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}

        {/* Chat Input */}
        <div className="chat-input-section">
          <div className="input-box">
            <input
              type="text"
              placeholder="Ask a question or make a request..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="chat-input"
              disabled={isLoading}
            />
            <button
              className={`send-btn ${isLoading ? "disabled" : ""}`}
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              {isLoading ? "..." : "➤"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
