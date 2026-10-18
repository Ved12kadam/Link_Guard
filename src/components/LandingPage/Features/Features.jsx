import { BarChart3, Link, Shield } from "lucide-react";
import styles from "./Features.module.css";

const features = [
  {
    name: "Smart URL Shortening",
    description: "Create clean, branded short links with advanced analytics and custom domains.",
    icon: Link,
  },
  {
    name: "Malicious Link Detection",
    description: "AI-powered threat detection scans every link for malware, phishing, and suspicious content.",
    icon: Shield,
  },
  {
    name: "Advanced Analytics",
    description: "Track clicks, geographic data, referrers, and user behavior with detailed insights.",
    icon: BarChart3,
  },
];

const Features = () => (
  <section className={styles.features}>
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Powerful Link Management</h2>
        <p className={styles.description}>
          Discover how LinkGuard revolutionizes URL shortening with enterprise-grade security features.
        </p>
      </div>
      <div className={styles.grid}>
        {features.map((feature) => (
          <div key={feature.name} className={styles.card}>
            <div className={styles.cardHeader}>
              <feature.icon className={styles.icon} />
              <h3 className={styles.cardTitle}>{feature.name}</h3>
            </div>
            <p className={styles.cardDescription}>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
