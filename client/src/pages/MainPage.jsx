import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../background.jpg';
import './MainPage.css';

const MainPage = () => {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('home');
    const [scrollPosition, setScrollPosition] = useState(0);
    const [user, setUser] = useState(null);
    const homeRef = useRef(null);
    const aboutRef = useRef(null);
    const footerRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px',
            }
        );

        const animateElements = document.querySelectorAll('.animate-on-scroll');
        animateElements.forEach((element) => observer.observe(element));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            animateElements.forEach((element) => observer.unobserve(element));
        };
    }, []);

    const scrollToSection = (ref, navName) => {
        setActiveNav(navName);
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="main-page">
            <nav className={`navbar ${scrollPosition > 50 ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    <div className="navbar-brand">Unixora</div>
                    <div className="navbar-links">
                        <button
                            className={`nav-link ${activeNav === 'home' ? 'active' : ''}`}
                            onClick={() => scrollToSection(homeRef, 'home')}
                        >
                            Home
                        </button>
                        <button
                            className={`nav-link ${activeNav === 'about' ? 'active' : ''}`}
                            onClick={() => scrollToSection(aboutRef, 'about')}
                        >
                            Platform
                        </button>
                        <button
                            className={`nav-link ${activeNav === 'contact' ? 'active' : ''}`}
                            onClick={() => scrollToSection(footerRef, 'contact')}
                        >
                            Contact
                        </button>
                        <button className="nav-link chat-btn" onClick={() => navigate('/chat')}>
                            {user ? 'Advisor' : 'Workspace'}
                        </button>
                        <button
                            className="nav-link signup-btn"
                            onClick={() => navigate(user ? '/chat' : '/signup')}
                        >
                            {user ? 'Open Workspace' : 'Begin Search'}
                        </button>
                    </div>
                </div>
            </nav>

            <section
                ref={homeRef}
                className="hero-section"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-text-container">
                        <span className="hero-eyebrow">Academic discovery, refined</span>
                        <h1 className="hero-title">
                            Choose your next university with clarity, structure, and confidence.
                        </h1>
                        <p className="hero-subtitle">
                            Unixora helps students explore universities, compare programs, and narrow
                            decisions through a calmer, more credible search experience.
                        </p>
                        <button className="cta-button" onClick={() => navigate(user ? '/chat' : '/signup')}>
                            {user ? 'Open Advisor Workspace' : 'Begin Your Search'}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>

                    <div className="hero-metrics animate-on-scroll">
                        <div className="hero-metric">
                            <strong>100+</strong>
                            <span>University profiles</span>
                        </div>
                        <div className="hero-metric">
                            <strong>500+</strong>
                            <span>Programs explored</span>
                        </div>
                        <div className="hero-metric">
                            <strong>01</strong>
                            <span>Guided path at a time</span>
                        </div>
                    </div>
                </div>
            </section>

            <section ref={aboutRef} className="about-section">
                <div className="about-container">
                    <div className="about-header animate-on-scroll">
                        <span className="section-kicker">Platform overview</span>
                        <h2 className="animate-on-scroll">A more deliberate way to explore higher education.</h2>
                        <p className="about-description animate-on-scroll">
                            Unixora brings together university discovery, program comparison, and guided
                            academic search in one focused environment. Instead of overwhelming students
                            with noise, the experience is designed to help them weigh fit, credibility,
                            affordability, and long-term direction with more confidence.
                        </p>
                    </div>

                    <div className="features-container">
                        <div className="feature-box animate-on-scroll">
                            <div className="feature-number">01</div>
                            <h3>Advisor Workspace</h3>
                            <p>Ask focused academic questions, review sourced answers, and refine choices through structured guidance.</p>
                        </div>
                        <div className="feature-box animate-on-scroll">
                            <div className="feature-number">02</div>
                            <h3>Matcher Flow</h3>
                            <p>Turn your preferences, budget, profile, and priorities into a shortlist that feels reasoned rather than random.</p>
                        </div>
                        <div className="feature-box animate-on-scroll">
                            <div className="feature-number">03</div>
                            <h3>Evidence-Led Search</h3>
                            <p>Review programs, scholarships, rankings, and context with presentation that supports trust and decision-making.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="footer" ref={footerRef}>
                <div className="footer-content">
                    <div className="footer-section animate-on-scroll">
                        <h4>Unixora</h4>
                        <p>A premium academic search platform designed to make university discovery feel clearer, calmer, and more credible.</p>
                    </div>
                    <div className="footer-section animate-on-scroll">
                        <h4>Focus Areas</h4>
                        <ul>
                            <li>University discovery</li>
                            <li>Program comparison</li>
                            <li>Scholarship-aware search</li>
                            <li>Guided shortlisting</li>
                        </ul>
                    </div>
                    <div className="footer-section animate-on-scroll">
                        <h4>Navigate</h4>
                        <div className="social-links">
                            <a href="#home">Home</a>
                            <a href="#about">Platform</a>
                            <a href="#contact">Contact</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Unixora. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;
