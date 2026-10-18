import React from "react";
import styles from "./CTA.module.css";

const CTA = () => (
  <section className={styles.cta}>
    <div className={styles.container}>
      <h2 className={styles.title}>Ready to secure your links?</h2>
      <p className={styles.description}>
        Join thousands of businesses and individuals who trust LinkGuard to shorten, secure, and analyze their links
        safely.
      </p>
      <button className={styles.button}>Start Free Trial</button>
    </div>
  </section>
);

export default CTA;
