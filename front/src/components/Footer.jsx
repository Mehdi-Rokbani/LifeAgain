import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-left">
          <strong>LifeAgain</strong> — Tous droits réservés © {new Date().getFullYear()}
        </div>
        <div className="footer-right">
          <a className="footer-link" href="#">À propos</a>
          <a className="footer-link" href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
