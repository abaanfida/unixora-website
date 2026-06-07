import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WorkspaceNavbar from "../components/WorkspaceNavbar";
import "../styles/MatcherPage.css";

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || "http://127.0.0.1:8000";

const ImportanceSelector = ({ label, value, onChange, description }) => (
  <div className="form-group importance-card">
    <div className="importance-copy">
      <label className="form-label">{label}</label>
      <p>{description}</p>
    </div>
    <div className="importance-buttons">
      {["not_important", "somewhat_important", "very_important"].map((option) => (
        <button
          key={option}
          type="button"
          className={`importance-btn ${value === option ? "active" : ""}`}
          onClick={() => onChange(option)}
        >
          {option === "not_important" ? "Low" : option === "somewhat_important" ? "Medium" : "High"}
        </button>
      ))}
    </div>
  </div>
);

const CATEGORY_META = {
  safety: { label: "Safety", color: "#9eb69a", bg: "rgba(143, 157, 137, 0.16)" },
  target: { label: "Target", color: "#d4cab1", bg: "rgba(212, 202, 177, 0.12)" },
  reach: { label: "Reach", color: "#b89583", bg: "rgba(184, 149, 131, 0.14)" },
  unknown: { label: "Review", color: "#9b968a", bg: "rgba(155, 150, 138, 0.12)" },
};

const ProgramCard = ({ prog }) => (
  <div className="program-card">
    <div className="program-name">{prog.name}</div>
    <div className="program-meta">
      {prog.degree_type && <span className="prog-tag">{prog.degree_type}</span>}
      {prog.duration && <span className="prog-tag">{prog.duration}</span>}
      {prog.mode && <span className="prog-tag">{prog.mode}</span>}
      {prog.fees_overseas && <span className="prog-tag prog-fees">GBP {prog.fees_overseas.toLocaleString()} / year</span>}
    </div>
    {prog.specializations?.length > 0 && (
      <div className="prog-specs">
        {prog.specializations.map((specialization, index) => (
          <span key={index} className="spec-chip">{specialization}</span>
        ))}
      </div>
    )}
    {prog.career_prospects?.length > 0 && (
      <div className="prog-careers">
        <span className="careers-label">Career outcomes</span>
        <p>{prog.career_prospects.join(", ")}</p>
      </div>
    )}
  </div>
);

const UniversityCard = ({ match, isExpanded, onToggle }) => {
  const category = CATEGORY_META[match.admission_category || "unknown"];

  return (
    <div className={`university-card ${isExpanded ? "expanded" : ""}`}>
      <div className="card-header" onClick={onToggle}>
        <div className="card-rank">#{match.rank}</div>
        <div className="card-main-info">
          <h3 className="card-title">{match.name}</h3>
          <div className="card-subtitle">
            {match.location?.city && <span>{match.location.city}</span>}
            {match.location?.region && <span>{match.location.region}</span>}
            {match.university_ranking?.uk_rank && <span>UK Rank {match.university_ranking.uk_rank}</span>}
          </div>
        </div>
        <div className="card-badges">
          <span className="admission-badge" style={{ color: category.color, background: category.bg }}>
            {category.label}
          </span>
          {match.web_data_used && <span className="web-badge">Web-enriched</span>}
        </div>
        <div className="card-score">
          <span className="score-value">{match.total_score}</span>
          <span className="score-label">Match score</span>
        </div>
        <div className="card-expand-icon">{isExpanded ? "Hide" : "View"}</div>
      </div>

      {isExpanded && (
        <div className="card-details">
          <div className="card-justification">
            <p>{match.justification}</p>
            {match.website && (
              <a href={match.website} target="_blank" rel="noopener noreferrer" className="visit-btn">
                Visit university site
              </a>
            )}
          </div>

          {match.matching_programs?.length > 0 && (
            <div className="detail-section">
              <h4>Matching programs</h4>
              <div className="programs-grid">
                {match.matching_programs.map((prog, index) => (
                  <ProgramCard key={index} prog={prog} />
                ))}
              </div>
            </div>
          )}

          <div className="card-sections">
            <div className="card-section">
              <h4>Score breakdown</h4>
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

            {match.admission_requirements?.length > 0 && (
              <div className="card-section">
                <h4>Admission requirements</h4>
                <ul>
                  {match.admission_requirements.map((requirement, index) => <li key={index}>{requirement}</li>)}
                </ul>
              </div>
            )}

            {match.scholarships?.length > 0 && (
              <div className="card-section">
                <h4>Scholarships</h4>
                <ul className="scholarships-list">
                  {match.scholarships.map((scholarship, index) => (
                    <li key={index}>
                      <strong>{scholarship.name}</strong>
                      {scholarship.amount && <span>{scholarship.amount}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {match.research_highlights?.length > 0 && (
              <div className="card-section">
                <h4>Research</h4>
                <ul>{match.research_highlights.map((item, index) => <li key={index}>{item}</li>)}</ul>
              </div>
            )}

            {match.faculty_highlights?.length > 0 && (
              <div className="card-section">
                <h4>Faculty</h4>
                <ul>{match.faculty_highlights.map((item, index) => <li key={index}>{item}</li>)}</ul>
              </div>
            )}

            {match.student_life_highlights?.length > 0 && (
              <div className="card-section">
                <h4>Student life</h4>
                <div className="sl-tags">
                  {match.student_life_highlights.map((item, index) => (
                    <span key={index} className="sl-tag">{item}</span>
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

const MatcherPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [step, setStep] = useState(0);

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
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (!formData.field_of_study) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const payload = {
        field_of_study: formData.field_of_study,
        degree_level: formData.degree_level,
        interests: (formData.interests || "").split(",").map((item) => item.trim()).filter(Boolean),
        current_grades: formData.current_grades || null,
        ielts_score: formData.ielts_score ? parseFloat(formData.ielts_score) : null,
        career_goals: formData.career_goals || null,
        preferred_mode: formData.preferred_mode,
        max_duration_years: formData.max_duration_years ? parseInt(formData.max_duration_years) : null,
        location_preference: formData.location_preference,
        preferred_locations:
          formData.location_preference === "specific"
            ? (formData.preferred_locations || "").split(",").map((item) => item.trim()).filter(Boolean)
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

      const response = await fetch(`${RAG_API_URL}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setResults(data);
      setExpandedCard(data.matches?.[0]?.rank || null);
    } catch (err) {
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
          interests: (formData.interests || "").split(",").map((item) => item.trim()).filter(Boolean),
          current_grades: formData.current_grades || null,
          ielts_score: formData.ielts_score ? parseFloat(formData.ielts_score) : null,
          career_goals: formData.career_goals || null,
          preferred_mode: formData.preferred_mode,
          max_duration_years: formData.max_duration_years ? parseInt(formData.max_duration_years) : null,
          location_preference: formData.location_preference,
          preferred_locations:
            formData.location_preference === "specific"
              ? (formData.preferred_locations || "").split(",").map((item) => item.trim()).filter(Boolean)
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
        matches: results,
      };

      const response = await fetch(`${RAG_API_URL}/export-matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `University_Comparison_Report_${formData.field_of_study.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (err) {
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

  const steps = ["Study", "Profile", "Preferences", "Priorities"];

  return (
    <div className="matcher-page">
      <div className="matcher-backdrop"></div>
      <WorkspaceNavbar active="match" onLogout={handleLogout} />

      <div className="matcher-shell">
        <section className="matcher-hero">
          <span className="matcher-hero-kicker">Advisor flow</span>
          <h1>Build a shortlist that feels reasoned, not random.</h1>
          <p>Share what you want to study, how selective you can be, and which tradeoffs matter most. Unixora will turn that into a more structured university shortlist.</p>
        </section>

        {!results ? (
          <section className="matcher-stage">
            <div className="matcher-stage-intro">
              <div className="intro-card">
                <span className="intro-kicker">How this works</span>
                <p>Start broad, then narrow. This flow translates your academic direction, profile, and constraints into a shortlist you can actually compare.</p>
              </div>
              <div className="intro-card">
                <span className="intro-kicker">Outcome</span>
                <p>Expect safety, target, and reach interpretation plus program and scholarship context for each recommendation.</p>
              </div>
            </div>

            <form className="matcher-form" onSubmit={handleSubmit}>
              {!isLoading && (
                <div className="step-progress">
                  {steps.map((stepName, index) => (
                    <button
                      key={stepName}
                      type="button"
                      className={`step-item ${index === step ? "active" : ""} ${index < step ? "done" : ""}`}
                      onClick={() => setStep(index)}
                    >
                      <div className="step-dot">{index < step ? "OK" : index + 1}</div>
                      <span>{stepName}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 0 && (
                <div className="form-section">
                  <h2 className="section-title">What do you want to study?</h2>
                  <p className="section-hint">Define the academic direction first, then shape the shortlist around fit and constraints.</p>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Field of study</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Computer Science, Finance, Engineering"
                        value={formData.field_of_study}
                        onChange={(event) => handleInputChange("field_of_study", event.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Degree level</label>
                      <div className="degree-buttons">
                        {["UG", "PG"].map((level) => (
                          <button
                            key={level}
                            type="button"
                            className={`degree-btn ${formData.degree_level === level ? "active" : ""}`}
                            onClick={() => handleInputChange("degree_level", level)}
                          >
                            {level === "UG" ? "Undergraduate" : "Postgraduate"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specific interests</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="AI, machine learning, data science"
                      value={formData.interests}
                      onChange={(event) => handleInputChange("interests", event.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Career goals</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Software engineer, quantitative analyst, researcher"
                        value={formData.career_goals}
                        onChange={(event) => handleInputChange("career_goals", event.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Study mode</label>
                      <select
                        className="form-input form-select"
                        value={formData.preferred_mode}
                        onChange={(event) => handleInputChange("preferred_mode", event.target.value)}
                      >
                        <option value="any">Any mode</option>
                        <option value="full_time">Full-time</option>
                        <option value="part_time">Part-time</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Maximum duration (years)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="1, 2, 3"
                      min="1"
                      max="6"
                      value={formData.max_duration_years}
                      onChange={(event) => handleInputChange("max_duration_years", event.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="form-section">
                  <h2 className="section-title">Tell us about your academic profile</h2>
                  <p className="section-hint">This helps interpret whether a recommendation is more likely to be safety, target, or reach.</p>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Current grades</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="First Class Honours, 3.8 GPA, AAB A-Levels"
                        value={formData.current_grades}
                        onChange={(event) => handleInputChange("current_grades", event.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">IELTS score</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="6.5, 7.0, 8.0"
                        min="0"
                        max="9"
                        step="0.5"
                        value={formData.ielts_score}
                        onChange={(event) => handleInputChange("ielts_score", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="advisor-hint-card">
                    <div className="hint-row"><strong>Safety</strong><span>Your profile comfortably meets the likely entry range.</span></div>
                    <div className="hint-row"><strong>Target</strong><span>Your profile is competitive and reasonably aligned.</span></div>
                    <div className="hint-row"><strong>Reach</strong><span>The fit is more ambitious and may require stronger evidence.</span></div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="form-section">
                  <h2 className="section-title">Set your practical preferences</h2>

                  <div className="form-group">
                    <label className="form-label">Location preference</label>
                    <div className="preference-selector">
                      {[["not_important", "Open to anywhere"], ["specific", "I have preferred regions"]].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          className={`pref-btn ${formData.location_preference === value ? "active" : ""}`}
                          onClick={() => handleInputChange("location_preference", value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.location_preference === "specific" && (
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="London, Scotland, Manchester"
                        value={formData.preferred_locations}
                        onChange={(event) => handleInputChange("preferred_locations", event.target.value)}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Tuition preference</label>
                    <div className="preference-selector">
                      {[["not_important", "Flexible"], ["max_limit", "Set a ceiling"]].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          className={`pref-btn ${formData.fee_preference === value ? "active" : ""}`}
                          onClick={() => handleInputChange("fee_preference", value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.fee_preference !== "not_important" && (
                    <div className="form-group fee-input-group">
                      <span className="currency-symbol">GBP</span>
                      <input
                        type="number"
                        className="form-input fee-input"
                        placeholder="Maximum annual fee"
                        value={formData.max_fees}
                        onChange={(event) => handleInputChange("max_fees", event.target.value)}
                      />
                      <span className="fee-suffix">per year</span>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="form-section">
                  <h2 className="section-title">What should the shortlist optimize for?</h2>
                  <div className="importance-grid">
                    <ImportanceSelector
                      label="University ranking"
                      description="Use this if brand recognition and published league tables matter strongly."
                      value={formData.ranking_importance}
                      onChange={(value) => handleInputChange("ranking_importance", value)}
                    />
                    <ImportanceSelector
                      label="Scholarships"
                      description="Increase this when funding flexibility is critical to your decision."
                      value={formData.scholarship_importance}
                      onChange={(value) => handleInputChange("scholarship_importance", value)}
                    />
                    <ImportanceSelector
                      label="Research strength"
                      description="Useful if you care about labs, publications, or academic depth."
                      value={formData.research_importance}
                      onChange={(value) => handleInputChange("research_importance", value)}
                    />
                    <ImportanceSelector
                      label="Faculty expertise"
                      description="Prioritize this when teaching reputation and specialist staff matter."
                      value={formData.faculty_importance}
                      onChange={(value) => handleInputChange("faculty_importance", value)}
                    />
                    <ImportanceSelector
                      label="Student life"
                      description="Raise this when environment and day-to-day experience shape your fit."
                      value={formData.student_life_importance}
                      onChange={(value) => handleInputChange("student_life_importance", value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-nav">
                {step > 0 && (
                  <button type="button" className="nav-back-btn" onClick={() => setStep(step - 1)}>
                    Back
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    className="nav-next-btn"
                    onClick={() => setStep(step + 1)}
                    disabled={step === 0 && !formData.field_of_study}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={`submit-btn ${isLoading ? "loading" : ""}`}
                    disabled={isLoading || !formData.field_of_study}
                  >
                    {isLoading ? "Building shortlist..." : "Generate shortlist"}
                  </button>
                )}
              </div>

              {error && <div className="error-message">{error}</div>}
            </form>
          </section>
        ) : (
          <section className="results-stage">
            <div className="results-header">
              <button className="back-btn" onClick={() => { setResults(null); setStep(0); }}>
                Start another search
              </button>
              <div className="results-actions">
                <button className="export-btn" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? "Generating report..." : "Export comparison report"}
                </button>
                <div className="results-stats">
                  <span>{results.total_evaluated} universities reviewed</span>
                  <span className="divider">•</span>
                  <span>{results.matches?.length || 0} shortlist matches</span>
                </div>
              </div>
            </div>

            {results.summary && (
              <div className="results-summary">
                <span className="summary-kicker">Shortlist summary</span>
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
          </section>
        )}
      </div>
    </div>
  );
};

export default MatcherPage;
