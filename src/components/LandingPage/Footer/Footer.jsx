import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";
import styles from "./Footer.module.css";

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <h2 className={styles.brandName}>LinkGuard</h2>
          <p className={styles.brandDescription}>Secure URL shortening for the modern web.</p>
        </div>
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Solutions</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/url-shortener" className={styles.link}>URL Shortener</Link>
              </li>
              <li>
                <Link href="/link-security" className={styles.link}>Link Security</Link>
              </li>
              <li>
                <Link href="/sandbox-testing" className={styles.link}>Sandbox Testing</Link>
              </li>
              <li>
                <Link href="/analytics-dashboard" className={styles.link}>Analytics Dashboard</Link>
              </li>
            </ul>
          </div>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Company</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/about" className={styles.link}>About Us</Link>
              </li>
              <li>
                <Link href="/careers" className={styles.link}>Careers</Link>
              </li>
            </ul>
          </div>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Connect</h3>
            <div className={styles.socialLinks}>
              <Link href="https://github.com/linkguard" className={styles.socialLink}>
                <Github className={styles.socialIcon} />
                <span className={styles.srOnly}>GitHub</span>
              </Link>
              <Link href="https://twitter.com/linkguard" className={styles.socialLink}>
                <Twitter className={styles.socialIcon} />
                <span className={styles.srOnly}>Twitter</span>
              </Link>
              <Link href="https://linkedin.com/company/linkguard" className={styles.socialLink}>
                <Linkedin className={styles.socialIcon} />
                <span className={styles.srOnly}>LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} LinkGuard, Inc. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
