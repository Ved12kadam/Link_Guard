import { Link } from "react-router-dom"
import { Github } from "lucide-react";
import styles from "./Navbar.module.css";
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const HandleGetStarted = () => {
    navigate('/signin');
  };
  
  return(
  <header className={styles.header}>
    <div className={styles.container}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoText}>LinkGuard</span>
      </Link>
      <nav className={styles.nav}>
        <Link href="/features" className={styles.navLink}>Features</Link>
        <Link href="/security" className={styles.navLink}>Security</Link>
        <Link href="/about" className={styles.navLink}>About Us</Link>
      </nav>
      <div className={styles.actions}>
        <Link href="https://github.com/your-org/linkguard" target="_blank" rel="noreferrer">
          <button className={styles.iconButton}>
            <Github className={styles.icon} />
            <span className={styles.srOnly}>GitHub</span>
          </button>
        </Link>
        <button className={styles.ghostButton}>Try Free</button>
        <button className={styles.primaryButton} onClick={HandleGetStarted}>Get Started</button>
      </div>
    </div>
  </header>
);
};
export default Navbar;
