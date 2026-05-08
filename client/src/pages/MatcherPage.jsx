import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MatcherPage.css";

const RAG_API_URL = "http://127.0.0.1:8000";

const ImportanceSelector = ({ label, value, onChange, icon }) => (
  <div className="form-group">
    <label className="form-label">
      <span className="label-icon">{icon}</span>
      {label}
    </label>
    <div className="importance-buttons">
      {["not_important", "somewhat_important", "very_important"].map((v) => (
        <button
          key={v}
          type="button"
          className={`importance-btn ${value === v ? "active" : ""}`}
          onClick={() => onChange(v)}
        >
          {v === "not_important" ? "Doesn't Matter" : v === "somewhat_important" ? "Somewhat" : "Very"}
        </button>
      ))}
    </div>
  </div>
);

const CATEGORY_META = {
  safety:  { label: "Safety",  color: "#4ade80", bg: "rgba(74,222,128,0.1)",  icon: "✅" },
  target:  { label: "Target",  color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  icon: "🎯" },
  reach:   { label: "Reach",   color: "#f97316", bg: "rgba(249,115,22,0.1)",  icon: "🔥" },
  unknown: { label: "Assess",  color: "#a0a0a0", bg: "rgba(160,160,160,0.1)", icon: "❓" },
};

const ProgramCard = ({ prog }) => (
  <div className="program-card">
    <div className="program-name">{prog.name}</div>
    <div className="program-meta">
      {prog.degree_type && <span className="prog-tag">{prog.degree_type}</span>}
      {prog.duration    && <span className="prog-tag">⏱ {prog.duration}</span>}
      {prog.mode        && <span className="prog-tag">📖 {prog.mode}</span>}
      {prog.fees_overseas && <span className="prog-tag prog-fees">£{prog.fees_overseas.toLocaleString()}/yr</span>}
    </div>
    {prog.specializations?.length > 0 && (
      <div className="prog-specs">
        {prog.specializations.map((s, i) => <span key={i} className="spec-chip">{s}</span>)}
      </div>
    )}
    {prog.career_prospects?.length > 0 && (
      <div className="prog-careers">
        <span className="careers-label">Careers: </span>
        {prog.career_prospects.join(", ")}
      </div>
    )}
  </div>
);

const UniversityCard = ({ match, isExpanded, onToggle }) => {
  const cat = CATEGORY_META[match.admission_category || "unknown"];
  return (
    <div className={`university-card ${isExpanded ? "expanded" : ""}`}>
      <div className="card-header" onClick={onToggle}>
        <div className="card-rank">#{match.rank}</div>
        <div className="card-main-info">
          <h3 className="card-title">{match.name}</h3>
          <div className="card-subtitle">
            {match.location?.city && <span>{match.location.city}</span>}
            {match.location?.region && <span> • {match.location.region}</span>}
            {match.university_ranking?.uk_rank && (
              <span className="uk-rank">UK #{match.university_ranking.uk_rank}</span>
            )}
          </div>
        </div>
        <div className="card-badges">
          <span className="admission-badge" style={{ color: cat.color, background: cat.bg }}>
            {cat.icon} {cat.label}
          </span>
          {match.web_data_used && <span className="web-badge">🌐 Web</span>}
        </div>
        <div className="card-score">
          <span className="score-value">{match.total_score}</span>
          <span className="score-label">Match</span>
        </div>
        <div className="card-expand-icon">{isExpanded ? "▼" : "▶"}</div>
      </div>

      {isExpanded && (
        <div className="card-details">
          <div className="card-justification">
            <p>{match.justification}</p>
            {match.website && (
              <a href={match.website} target="_blank" rel="noopener noreferrer" className="visit-btn">
                🔗 Visit Website
              </a>
            )}
          </div>

          {/* Matching Programs */}
          {match.matching_programs?.length > 0 && (
            <div className="detail-section">
              <h4>🎓 Matching Programs</h4>
              <div className="programs-grid">
                {match.matching_programs.map((prog, i) => (
                  <ProgramCard key={i} prog={prog} />
                ))}
              </div>
            </div>
          )}

          <div className="card-sections">
            {/* Score Breakdown */}
            <div className="card-section">
              <h4>📊 Score Breakdown</h4>
              <div className="score-breakdown">
                {Object.entries(match.score_breakdown || {}).map(([key, value]) => (
                  <div key={key} className="score-item">
                    <span className="score-key">{key.replace(/_/g, " ")}</span>
                    <div className="score-bar-container">
                      <div className="score-bar" style={{ width: `${value}%` }} />
                    </div>
                    <span className="score-num">{Math.round(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admission Requirements */}
            {match.admission_requirements?.length > 0 && (
              <div className="card-section">
                <h4>📋 Admission Requirements</h4>
                <ul>
                  {match.admission_requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Scholarships */}
            {match.scholarships?.length > 0 && (
              <div className="card-section">
                <h4>💰 Scholarships</h4>
                <ul className="scholarships-list">
                  {match.scholarships.map((sch, i) => (
                    <li key={i}>
                      <strong>{sch.name}</strong>
                      {sch.amount && <span> — {sch.amount}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Research */}
            {match.research_highlights?.length > 0 && (
              <div className="card-section">
                <h4>🔬 Research</h4>
                <ul>{match.research_highlights.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}

            {/* Faculty */}
            {match.faculty_highlights?.length > 0 && (
              <div className="card-section">
                <h4>👨‍🏫 Faculty</h4>
                <ul>{match.faculty_highlights.map((f, i) => <li key={i}>{f}</li>)}</ul>
              </div>
            )}

            {/* Student Life */}
            {match.student_life_highlights?.length > 0 && (
              <div className="card-section">
                <h4>🎉 Student Life</h4>
                <div className="sl-tags">
                  {match.student_life_highlights.map((s, i) => (
                    <span key={i} className="sl-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getAvatarColor = (name) => {
  if (!name) return "#10a37f";
  const colors = [
    "#10a37f",
    "#7c3aed",
    "#2563eb",
    "#dc2626",
    "#ea580c",
    "#ca8a04",
  ];
  const charCode = name.charCodeAt(0) + (name.length > 1 ? name.charCodeAt(name.length - 1) : 0);
  return colors[charCode % colors.length];
};

const MatcherPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [step, setStep] = useState(0); // multi-step form

  const [formData, setFormData] = useState({
    field_of_study: "",
    degree_level: "PG",
    interests: "",
    current_grades: "",
    ielts_score: "",
    career_goals: "",
    preferred_mode: "any",
    max_duration_years: "",
    location_preference: "not_important",
    preferred_locations: "",
    fee_preference: "not_important",
    max_fees: "",
    ranking_importance: "somewhat_important",
    scholarship_importance: "somewhat_important",
    research_importance: "somewhat_important",
    faculty_importance: "somewhat_important",
    student_life_importance: "somewhat_important",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    else navigate("/login");
  }, [navigate]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    console.log("Submit initiated...");
    if (e && e.preventDefault) e.preventDefault();
    
    if (!formData.field_of_study) {
      console.warn("Submit aborted: field_of_study is empty");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log("Constructing payload with:", formData);
      const payload = {
        field_of_study: formData.field_of_study,
        degree_level: formData.degree_level,
        interests: (formData.interests || "").split(",").map((s) => s.trim()).filter(Boolean),
        current_grades: formData.current_grades || null,
        ielts_score: formData.ielts_score ? parseFloat(formData.ielts_score) : null,
        career_goals: formData.career_goals || null,
        preferred_mode: formData.preferred_mode,
        max_duration_years: formData.max_duration_years ? parseInt(formData.max_duration_years) : null,
        location_preference: formData.location_preference,
        preferred_locations:
          formData.location_preference === "specific"
            ? (formData.preferred_locations || "").split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        fee_preference: formData.fee_preference,
        max_fees:
          formData.fee_preference !== "not_important" && formData.max_fees
            ? parseInt(formData.max_fees)
            : null,
        ranking_importance: formData.ranking_importance,
        scholarship_importance: formData.scholarship_importance,
        research_importance: formData.research_importance,
        faculty_importance: formData.faculty_importance,
        student_life_importance: formData.student_life_importance,
      };

      console.log("Sending request to:", `${RAG_API_URL}/match`);
      const response = await fetch(`${RAG_API_URL}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log("Match data received:", data);
      setResults(data);
      setExpandedCard(data.matches?.[0]?.rank || null);
    } catch (err) {
      console.error("Match API Error:", err);
      setError(`Failed to find matches: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!results || !results.matches) return;
    
    setIsExporting(true);
    try {
      const payload = {
        profile: {
          field_of_study: formData.field_of_study,
          degree_level: formData.degree_level,
          interests: (formData.interests || "").split(",").map((s) => s.trim()).filter(Boolean),
          current_grades: formData.current_grades || null,
          ielts_score: formData.ielts_score ? parseFloat(formData.ielts_score) : null,
          career_goals: formData.career_goals || null,
          preferred_mode: formData.preferred_mode,
          max_duration_years: formData.max_duration_years ? parseInt(formData.max_duration_years) : null,
          location_preference: formData.location_preference,
          preferred_locations:
            formData.location_preference === "specific"
              ? (formData.preferred_locations || "").split(",").map((s) => s.trim()).filter(Boolean)
              : [],
          fee_preference: formData.fee_preference,
          max_fees:
            formData.fee_preference !== "not_important" && formData.max_fees
              ? parseInt(formData.max_fees)
              : null,
          ranking_importance: formData.ranking_importance,
          scholarship_importance: formData.scholarship_importance,
          research_importance: formData.research_importance,
          faculty_importance: formData.faculty_importance,
          student_life_importance: formData.student_life_importance,
        },
        matches: results
      };

      const response = await fetch(`${RAG_API_URL}/export-matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `University_Comparison_Report_${formData.field_of_study.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export Error:", err);
      alert("Failed to generate Excel report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const steps = ["Study", "Background", "Preferences", "Priorities"];

  return (
    <div className="matcher-container">
      {/* Sidebar */}
      <div className="matcher-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="3 9 21 9"></polyline><path d="M9 21V9"></path></svg>
          </span>
          <span className="brand-text">UNIMATCHER STUDIO</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate("/chat")}>
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </span>
            <span>Chat Assistant</span>
          </div>
          <div className="nav-item active">
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
            </span>
            <span>Find Matches</span>
          </div>
        </nav>
        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <div
                className="user-avatar"
                style={{
                  backgroundColor: getAvatarColor(user.firstName),
                }}
              >
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </div>
              <div className="user-details">
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <span className="profile-badge">PREMIUM STUDENT</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="matcher-main">
        <div className="matcher-header">
          <div>
            <h1 className="header-title">Find Your Perfect <span className="highlight-italic">University</span></h1>
            <p className="header-subtitle">DEFINE YOUR ACADEMIC FUTURE</p>
          </div>
          <div className="header-buttons">
            <button className="home-btn" onClick={() => navigate("/")}>Home</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="matcher-content">
          {!results ? (
            <form className="matcher-form" onSubmit={(e) => e.preventDefault()}>
              {/* Step Progress */}
              {!isLoading && (
                <div className="step-progress">
                  {steps.map((s, i) => (
                    <div
                      key={i}
                      className={`step-item ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
                      onClick={() => setStep(i)}
                    >
                      <div className="step-dot">{i < step ? "✓" : i + 1}</div>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 0: Study */}
              {step === 0 && (
                <div className="form-section">
                  <h2 className="section-title">📚 What do you want to study?</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Field of Study *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Computer Science, Finance, Engineering"
                        value={formData.field_of_study}
                        onChange={(e) => handleInputChange("field_of_study", e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Degree Level *</label>
                      <div className="degree-buttons">
                        {["UG", "PG"].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            className={`degree-btn ${formData.degree_level === lvl ? "active" : ""}`}
                            onClick={() => handleInputChange("degree_level", lvl)}
                          >
                            {lvl === "UG" ? "Undergraduate" : "Postgraduate"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specific Interests</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., AI, Machine Learning, Data Science (comma separated)"
                      value={formData.interests}
                      onChange={(e) => handleInputChange("interests", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">🎯 Career Goals</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Software Engineer at tech company, Academic Researcher"
                      value={formData.career_goals}
                      onChange={(e) => handleInputChange("career_goals", e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">📖 Study Mode</label>
                      <select
                        className="form-input form-select"
                        value={formData.preferred_mode}
                        onChange={(e) => handleInputChange("preferred_mode", e.target.value)}
                      >
                        <option value="any">Any Mode</option>
                        <option value="full_time">Full-time</option>
                        <option value="part_time">Part-time</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">⏱ Max Duration (years)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g., 1, 2, 3"
                        min="1" max="6"
                        value={formData.max_duration_years}
                        onChange={(e) => handleInputChange("max_duration_years", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Academic Background */}
              {step === 1 && (
                <div className="form-section">
                  <h2 className="section-title">🎓 Academic Background</h2>
                  <p className="section-hint">This helps us assess your admission chances (Safety / Target / Reach).</p>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">📝 Current Grades</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., First Class Honours, 3.8 GPA, AAB A-Levels"
                        value={formData.current_grades}
                        onChange={(e) => handleInputChange("current_grades", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">🌍 IELTS Score (0–9)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g., 6.5, 7.0, 8.0"
                        min="0" max="9" step="0.5"
                        value={formData.ielts_score}
                        onChange={(e) => handleInputChange("ielts_score", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ielts-hint">
                    <div className="hint-row"><span className="hint-badge safety">✅ Safety</span> Your profile comfortably meets requirements</div>
                    <div className="hint-row"><span className="hint-badge target">🎯 Target</span> Your profile meets or narrowly meets requirements</div>
                    <div className="hint-row"><span className="hint-badge reach">🔥 Reach</span> Your profile is below the typical requirements</div>
                  </div>
                </div>
              )}

              {/* Step 2: Preferences */}
              {step === 2 && (
                <div className="form-section">
                  <h2 className="section-title">⚙️ Preferences</h2>

                  <h3 className="subsection-title">📍 Location</h3>
                  <div className="preference-selector">
                    {[["not_important", "Doesn't Matter"], ["specific", "I have preferences"]].map(([v, label]) => (
                      <button
                        key={v}
                        type="button"
                        className={`pref-btn ${formData.location_preference === v ? "active" : ""}`}
                        onClick={() => handleInputChange("location_preference", v)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {formData.location_preference === "specific" && (
                    <div className="form-group" style={{ marginTop: "16px" }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., London, Scotland, Manchester (comma separated)"
                        value={formData.preferred_locations}
                        onChange={(e) => handleInputChange("preferred_locations", e.target.value)}
                      />
                    </div>
                  )}

                  <h3 className="subsection-title" style={{ marginTop: "24px" }}>💷 Budget</h3>
                  <div className="preference-selector">
                    {[["not_important", "Doesn't Matter"], ["max_limit", "Set Maximum"]].map(([v, label]) => (
                      <button
                        key={v}
                        type="button"
                        className={`pref-btn ${formData.fee_preference === v ? "active" : ""}`}
                        onClick={() => handleInputChange("fee_preference", v)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {formData.fee_preference !== "not_important" && (
                    <div className="form-group fee-input-group" style={{ marginTop: "16px" }}>
                      <span className="currency-symbol">£</span>
                      <input
                        type="number"
                        className="form-input fee-input"
                        placeholder="Maximum annual fee"
                        value={formData.max_fees}
                        onChange={(e) => handleInputChange("max_fees", e.target.value)}
                      />
                      <span className="fee-suffix">/year</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Priorities */}
              {step === 3 && (
                <div className="form-section">
                  <h2 className="section-title">⚖️ What's Important to You?</h2>
                  <div className="importance-grid">
                    <ImportanceSelector label="University Ranking" icon="🏆" value={formData.ranking_importance} onChange={(v) => handleInputChange("ranking_importance", v)} />
                    <ImportanceSelector label="Scholarships"       icon="💰" value={formData.scholarship_importance} onChange={(v) => handleInputChange("scholarship_importance", v)} />
                    <ImportanceSelector label="Research Facilities" icon="🔬" value={formData.research_importance} onChange={(v) => handleInputChange("research_importance", v)} />
                    <ImportanceSelector label="Faculty Expertise"  icon="👨‍🏫" value={formData.faculty_importance} onChange={(v) => handleInputChange("faculty_importance", v)} />
                    <ImportanceSelector label="Student Life"       icon="🎉" value={formData.student_life_importance} onChange={(v) => handleInputChange("student_life_importance", v)} />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="form-nav">
                {step > 0 && (
                  <button type="button" className="nav-back-btn" onClick={() => setStep(step - 1)}>
                    ← Back
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    className="nav-next-btn"
                    onClick={() => setStep(step + 1)}
                    disabled={step === 0 && !formData.field_of_study}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    key="submit-btn"
                    className={`submit-btn ${isLoading ? "loading" : ""}`}
                    disabled={isLoading || !formData.field_of_study}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <><span className="spinner" />Finding matches...</>
                    ) : (
                      <><span>🎯</span> Find My Matches</>
                    )}
                  </button>
                )}
              </div>

              {error && (
                <div className="error-message">
                  <span>⚠️</span>{error}
                </div>
              )}
            </form>
          ) : (
            <div className="results-container">
              <div className="results-header">
                <button className="back-btn" onClick={() => { setResults(null); setStep(0); }}>
                  ← New Search
                </button>
                <div className="results-actions">
                  <button 
                    className="export-btn" 
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <><span className="spinner" /> Generating...</>
                    ) : (
                      <><span>📊</span> Export to Excel</>
                    )}
                  </button>
                  <div className="results-stats">
                    <span>{results.total_evaluated} universities analyzed</span>
                    <span className="divider">•</span>
                    <span>{results.matches?.length || 0} matches found</span>
                  </div>
                </div>
              </div>

              {results.summary && (
                <div className="results-summary">
                  <h3>📋 Summary</h3>
                  <p>{results.summary}</p>
                </div>
              )}

              <div className="results-list">
                {results.matches?.map((match) => (
                  <UniversityCard
                    key={match.rank}
                    match={match}
                    isExpanded={expandedCard === match.rank}
                    onToggle={() => setExpandedCard(expandedCard === match.rank ? null : match.rank)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatcherPage;
