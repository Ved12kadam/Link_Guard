import { ArrowRight } from "lucide-react";
import styles from "./Hero.module.css";

const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.content}>
      <div className={styles.textContent}>
        <h1 className={styles.title}>Shorten, Secure & Sandbox Your Links</h1>
        <p className={styles.description}>
          The most advanced URL shortener with built-in malicious link detection and secure sandbox testing. Protect
          your users while creating clean, trackable short links.
        </p>
      </div>
      <div className={styles.actions}>
        <button className={styles.primaryButton}>
          Start Shortening
          <ArrowRight className={styles.icon} />
        </button>
        <button className={styles.secondaryButton}>View Demo</button>
      </div>
    </div>
  </section>
);

export default Hero;
