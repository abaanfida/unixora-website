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
        
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                } else {
                    entry.target.classList.remove('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe all animatable elements
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        animateElements.forEach(el => observer.observe(el));

        const featureBoxes = document.querySelectorAll('.feature-box');
        featureBoxes.forEach((box) => {
            box.addEventListener('mousemove', (e) => {
                const rect = box.getBoundingClientRect();
                box.style.setProperty('--x', `${e.clientX - rect.left}px`);
                box.style.setProperty('--y', `${e.clientY - rect.top}px`);
            });
        });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            animateElements.forEach(el => observer.unobserve(el));
        };
    }, []);

    const scrollToSection = (ref, navName) => {
        setActiveNav(navName);
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleGetStarted = () => {
        navigate('/signup');
    };

    return (
        <div className="main-page">
            {/* Navigation Bar */}
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
                            About Us
                        </button>
                        <button
                            className={`nav-link ${activeNav === 'contact' ? 'active' : ''}`}
                            onClick={() => scrollToSection(footerRef, 'contact')}
                        >
                            Contacts
                        </button>
                        <button className="nav-link chat-btn" onClick={() => navigate('/chat')}>
                            💬 {user ? 'Chat' : 'Dashboard'}
                        </button>
                        {user ? (
                            <button className="nav-link signup-btn" onClick={() => navigate('/chat')}>
                                Go to App
                            </button>
                        ) : (
                            <button className="nav-link signup-btn" onClick={handleGetStarted}>
                                Sign Up
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section
                ref={homeRef}
                className="hero-section"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-text-container">
                        <h1 className="hero-title">
                            Your Gateway to <span className="highlight">Academic Excellence</span>
                        </h1>
                        <p className="hero-subtitle">
                            Discover 100+ Universities Worldwide. Explore Programs. Find Your Perfect Fit.
                        </p>
                        <button className="cta-button" onClick={() => navigate(user ? '/chat' : '/signup')}>
                            {user ? 'Go to Dashboard' : 'Get Started'}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section ref={aboutRef} className="about-section">
                <div className="about-container">
                    <div className="about-header animate-on-scroll">
                        <h2 className="animate-on-scroll">About Us</h2>
                        <p className="about-description animate-on-scroll">
                            Unixora is your comprehensive platform for exploring educational opportunities across the globe. We connect students with over 100 prestigious universities, helping them find institutions that match their academic aspirations and career goals. Our mission is to simplify your university search journey and empower you to make informed decisions about your educational future. Discover programs, explore faculties, and connect with opportunities worldwide.
                        </p>
                    </div>

                    <div className="features-container">
                        <div className="feature-box animate-on-scroll">
                            <div className="feature-number">100+</div>
                            <h3>Universities</h3>
                            <p>Access detailed information about top universities worldwide with comprehensive data on programs and specializations.</p>
                        </div>
                        <div className="feature-box animate-on-scroll">
                            <div className="feature-number">500+</div>
                            <h3>Programs</h3>
                            <p>Explore diverse academic programs from engineering to humanities across multiple disciplines and fields.</p>
                        </div>
                        <div className="feature-box animate-on-scroll">
                            <div className="feature-number">1000+</div>
                            <h3>Data Points</h3>
                            <p>Access comprehensive information on programs, scholarships, faculty, research labs, and opportunities at each university.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer" ref={footerRef}>
                <div className="footer-content">
                    <div className="footer-section animate-on-scroll">
                        <h4>Unixora</h4>
                        <p>Your gateway to academic excellence worldwide. Connecting students with their perfect university match across the globe. Explore 100+ institutions and discover your ideal educational path. Empowering dreams, one student at a time.</p>
                    </div>
                    <div className="footer-section animate-on-scroll">
                        <h4>Contact Info</h4>
                        <ul>
                            <li><strong>Email:</strong> support@unixora.com</li>
                            <li><strong>Phone:</strong> +1 (800) 123-4567</li>
                            <li><strong>Address:</strong> 123 Education Avenue, NY 10001</li>
                            <li><strong>Hours:</strong> Mon-Fri 9AM-6PM</li>
                        </ul>
                    </div>
                    <div className="footer-section animate-on-scroll">
                        <h4>Follow Us</h4>
                        <div className="social-links">
                            <a href="#facebook">Facebook</a>
                            <a href="#twitter">Twitter</a>
                            <a href="#linkedin">LinkedIn</a>
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
