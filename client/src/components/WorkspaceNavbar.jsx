import React from "react";
import { useNavigate } from "react-router-dom";
import "./WorkspaceNavbar.css";

const WorkspaceNavbar = ({ active, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="workspace-navbar">
      <div className="workspace-navbar-inner">
        <button className="workspace-brand" onClick={() => navigate("/")}>
          Unixora
        </button>

        <div className="workspace-nav-links">
          <button
            className={`workspace-link ${active === "chat" ? "active" : ""}`}
            onClick={() => navigate("/chat")}
          >
            Advisor
          </button>
          <button
            className={`workspace-link ${active === "match" ? "active" : ""}`}
            onClick={() => navigate("/match")}
          >
            Matcher
          </button>
        </div>

        <div className="workspace-nav-actions">
          <button className="workspace-action" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="workspace-action workspace-action-primary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceNavbar;
