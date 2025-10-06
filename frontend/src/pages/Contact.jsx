import React, { useState } from 'react';
import '../styles/contact.css';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState({
        message: '',
        type: '' // 'success' or 'error'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ message: 'Sending...', type: '' });

        // Simulate sending the message
        setTimeout(() => {
            setStatus({
                message: 'Thank you for your message! We will get back to you soon.',
                type: 'success'
            });
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        }, 1500);
    };

    return (
        <div className="contact-page">
            <div className="contact-container">
                <div className="contact-info">
                    <h1>Get in Touch</h1>
                    <p>Have questions about our museums or artifacts? We'd love to hear from you!</p>
                    
                    <div className="contact-details">
                        <div className="contact-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <div>
                                <h3>Visit Us</h3>
                                <p>123 Museum Street<br />Art District, City 12345</p>
                            </div>
                        </div>
                        
                        <div className="contact-item">
                            <i className="fas fa-phone"></i>
                            <div>
                                <h3>Call Us</h3>
                                <p>+1 (555) 123-4567<br />Mon-Fri, 9:00-17:00</p>
                            </div>
                        </div>
                        
                        <div className="contact-item">
                            <i className="fas fa-envelope"></i>
                            <div>
                                <h3>Email Us</h3>
                                <p>info@museumblog.com<br />support@museumblog.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="social-links">
                        <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                        <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
                        <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                </div>

                <div className="contact-form">
                    <h2>Send us a Message</h2>
                    {status.message && (
                        <div className={`status-message ${status.type}`}>
                            {status.message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Your Email"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Subject"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Your Message"
                                required
                                rows="5"
                            ></textarea>
                        </div>
                        <button type="submit" className="submit-btn">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Contact;