import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WorkspaceNavbar.css";

const WorkspaceNavbar = ({ active, onLogout }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [active]);

  const handleNavigate = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false);
    onLogout?.();
  };

  return (
    <div className="workspace-navbar">
      <div className="workspace-navbar-inner">
        <div className="workspace-navbar-top">
          <button className="workspace-brand" onClick={() => handleNavigate("/")}>
            Unixora
          </button>

          <button
            type="button"
            className={`workspace-menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
            onClick={() => setIsMobileMenuOpen((previous) => !previous)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="workspace-menu-toggle-line"></span>
            <span className="workspace-menu-toggle-line"></span>
            <span className="workspace-menu-toggle-line"></span>
          </button>
        </div>

        <div className={`workspace-navbar-sections ${isMobileMenuOpen ? "open" : ""}`}>
          <div className="workspace-nav-links">
            <button
              className={`workspace-link ${active === "chat" ? "active" : ""}`}
              onClick={() => handleNavigate("/chat")}
            >
              Advisor
            </button>
            <button
              className={`workspace-link ${active === "match" ? "active" : ""}`}
              onClick={() => handleNavigate("/match")}
            >
              Matcher
            </button>
          </div>

          <div className="workspace-nav-actions">
            <button className="workspace-action" onClick={() => handleNavigate("/")}>
              Home
            </button>
            <button className="workspace-action workspace-action-primary" onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceNavbar;
