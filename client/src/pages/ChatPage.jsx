import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import WorkspaceNavbar from "../components/WorkspaceNavbar";
import "../styles/ChatPage.css";

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || "http://localhost:8000";

const formatMessageText = (text) => {
  if (!text) return "";

  const lines = text.split("\n");
  const formattedLines = [];
  let inList = false;
  let listItems = [];
  let inTable = false;
  let tableRows = [];

  const processInlineFormatting = (line) => {
    line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    line = line.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return line;
  };

  const flushList = () => {
    if (inList && listItems.length > 0) {
      formattedLines.push(`<ul class="formatted-list">${listItems.map((item) => `<li>${item}</li>`).join("")}</ul>`);
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
            <tr>${headerRow.map((cell) => `<th>${cell}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      `);
      inTable = false;
      tableRows = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      flushList();
      inTable = true;
      if (trimmedLine.match(/^[|\s-]+$/)) return;
      const rawCells = trimmedLine.split("|").slice(1, -1);
      tableRows.push(rawCells.map((cell) => processInlineFormatting(cell.trim())));
      return;
    } else {
      flushTable();
    }

    if (trimmedLine.startsWith("> ")) {
      flushList();
      formattedLines.push(`<blockquote class="formatted-blockquote">${processInlineFormatting(trimmedLine.slice(2))}</blockquote>`);
      return;
    }

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

const FormattedMessage = ({ text, isBot }) => {
  if (!isBot) {
    return <span>{text}</span>;
  }

  return <div className="formatted-content" dangerouslySetInnerHTML={{ __html: formatMessageText(text) }} />;
};

const SourcesSection = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-section">
      <button className="sources-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <span>Reference material</span>
        <span className="sources-count">{sources.length}</span>
      </button>
      {isExpanded && (
        <div className="sources-list">
          {sources.map((source, idx) => (
            <div key={idx} className="source-item">
              <div className="source-header">
                <span className="source-university">{source.university}</span>
                {source.program && <span className="source-program">{source.program}</span>}
              </div>
              <p className="source-text">{source.text.substring(0, 180)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TypingIndicator = () => (
  <div className="typing-indicator">
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
  </div>
);

const getAvatarColor = (name) => {
  const colors = ["#8f9d89", "#9f8f87", "#7d8f9c", "#a08f74"];
  if (!name) return colors[0];
  const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return colors[charCode % colors.length];
};

const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  return `${first}${last}`;
};

const QUICK_ACTIONS = [
  "Find universities in the UK for data science",
  "Compare scholarship options for postgraduate study",
  "Show strong engineering universities with better career outcomes",
  "Help me build a safety and target shortlist",
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setMessages([
        {
          id: 0,
          type: "bot",
          text: `Good morning, ${parsedUser.firstName}.`,
          subtext: "Ask about fit, scholarships, rankings, fees, or shortlist refinement.",
        },
      ]);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const queryRAGAPI = async (query) => {
    const response = await fetch(`${RAG_API_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, top_k: 8 }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { id: messages.length + 1, type: "user", text: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setError(null);
    setIsLoading(true);

    if (currentChatId === null && messages.length <= 1) {
      const newChatId = Math.max(...chatHistory.map((chat) => chat.id), 0) + 1;
      const newChat = {
        id: newChatId,
        title: inputValue.substring(0, 44),
        messages: newMessages,
        timestamp: new Date().toLocaleString(),
      };

      let updatedHistory = [newChat, ...chatHistory];
      if (updatedHistory.length > 8) {
        updatedHistory = updatedHistory.slice(0, 8);
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
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError("Unable to complete that request right now. Please confirm the API server is available and try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          type: "bot",
          text: "I could not retrieve an answer for that request. Please try again in a moment.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setError(null);
    if (user) {
      setMessages([
        {
          id: 0,
          type: "bot",
          text: `Good morning, ${user.firstName}.`,
          subtext: "Ask about fit, scholarships, rankings, fees, or shortlist refinement.",
        },
      ]);
    }
  };

  const handleLoadChat = (chatId) => {
    const chat = chatHistory.find((item) => item.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setError(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="chat-page">
      <div className="chat-backdrop"></div>
      <WorkspaceNavbar active="chat" onLogout={handleLogout} />

      <div className="chat-shell">
        <section className="chat-hero">
          <span className="chat-hero-kicker">Advisor workspace</span>
          <h1>Academic direction, clarified through conversation.</h1>
          <p>Use this space to refine fit, compare options, and move from broad exploration to a smarter shortlist.</p>
        </section>

        <section className="chat-stage">
          <div className="chat-stage-header">
            <div>
              <span className="chat-stage-kicker">Current workspace</span>
              <h2>University advisor</h2>
            </div>
            <button className="chat-secondary-btn" onClick={handleNewChat}>
              New conversation
            </button>
          </div>

          {chatHistory.length > 0 && (
            <div className="chat-history-strip">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  className={`history-chip ${currentChatId === chat.id ? "active" : ""}`}
                  onClick={() => handleLoadChat(chat.id)}
                >
                  {chat.title}
                </button>
              ))}
            </div>
          )}

          <div className="chat-window">
            <div className="chat-messages">
              {messages.length === 1 && (
                <div className="welcome-section">
                  <div className="welcome-greeting">
                    <p className="greeting-main">{messages[0].text}</p>
                    <p className="greeting-sub">{messages[0].subtext}</p>
                  </div>

                  <div className="quick-actions">
                    {QUICK_ACTIONS.map((action) => (
                      <button key={action} className="quick-action-item" onClick={() => setInputValue(action)}>
                        <span className="quick-action-label">Suggested prompt</span>
                        <p className="quick-action-title">{action}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => {
                if (msg.id === 0 && messages.length === 1) return null;

                return (
                  <div key={idx} className={`message ${msg.type}`}>
                    {msg.type === "bot" && <div className="message-avatar">UX</div>}
                    <div className={`message-content ${msg.type} ${msg.isError ? "error" : ""}`}>
                      <div className="message-label">{msg.type === "bot" ? "Advisor response" : "Student prompt"}</div>
                      <FormattedMessage text={msg.text} isBot={msg.type === "bot"} />
                      {msg.sources && msg.sources.length > 0 && <SourcesSection sources={msg.sources} />}
                      {msg.confidence !== undefined && (
                        <div className="confidence-indicator">
                          <span className="confidence-label">Confidence</span>
                          <div className="confidence-bar">
                            <div className="confidence-fill" style={{ width: `${msg.confidence * 100}%` }} />
                          </div>
                          <span className="confidence-value">{Math.round(msg.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>
                    {msg.type === "user" && (
                      <div className="message-avatar user-avatar" style={{ backgroundColor: getAvatarColor(user?.firstName) }}>
                        {user ? getInitials(user.firstName, user.lastName) : "You"}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="message bot">
                  <div className="message-avatar">UX</div>
                  <div className="message-content bot">
                    <div className="message-label">Advisor response</div>
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="error-banner">
                <span>{error}</span>
                <button className="error-dismiss" onClick={() => setError(null)}>Close</button>
              </div>
            )}

            <div className="chat-input-section">
              <div className="input-box">
                <input
                  type="text"
                  placeholder="Ask about admission fit, scholarships, rankings, fees, or shortlist refinement..."
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSendMessage()}
                  className="chat-input"
                  disabled={isLoading}
                />
                <button
                  className={`send-btn ${isLoading ? "disabled" : ""}`}
                  onClick={handleSendMessage}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "->"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatPage;
