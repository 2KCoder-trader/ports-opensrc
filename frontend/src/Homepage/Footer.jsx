import React from 'react';
import './Footer.css';


function Footer() {
 return (
 <footer className="footer">
 <div className="footer-content">
 <div className="footer-links">
 <a href="/ports">Ports</a>
 <a href="/privacy">Terms of Service</a>
 <a href="/privacy">Privacy Policy</a>
 </div>
 </div>
 <div className="footer-bottom">
 <div className="footer-logo">
 <a href="/">
 <img src="/ports_logo.png" alt="Company Logo" />
 </a>
 </div>
 <div className="footer-copyright">
 <p>&copy; {new Date().getFullYear()} Ports. All rights reserved. Powered by <a href='https://www.tommaso.site'>TG</a>.</p>
 </div>
 </div>
 </footer>
 );
}


export default Footer;
