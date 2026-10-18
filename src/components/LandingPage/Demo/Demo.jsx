"use client";

import { useState } from "react";
import { Copy, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import styles from "./Demo.module.css";

const Demo = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [securityStatus, setSecurityStatus] = useState(null);

  const handleShorten = async () => {
    if (!url) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setShortUrl("https://lnkg.rd/abc123");
    setSecurityStatus(url.includes("malicious") ? "warning" : "safe");
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
  };

  return (
    <section className={styles.demo}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Try LinkGuard Now</h2>
          <p className={styles.description}>
            Paste any URL below to see our security scanning and shortening in action
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                placeholder="Enter your long URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button className={styles.submitButton} onClick={handleShorten} disabled={!url || isLoading}>
                {isLoading ? "Scanning..." : "Shorten & Scan"}
              </button>
            </div>

            {isLoading && (
              <div className={styles.loading}>
                <Shield className={styles.loadingIcon} />
                <span>Scanning for threats and generating short link...</span>
              </div>
            )}

            {shortUrl && (
              <div className={styles.result}>
                <div className={styles.status}>
                  {securityStatus === "safe" ? (
                    <CheckCircle className={styles.safeIcon} />
                  ) : (
                    <AlertTriangle className={styles.warningIcon} />
                  )}
                  <span className={styles.statusText}>
                    {securityStatus === "safe" ? "Link is safe" : "Potential security risk detected"}
                  </span>
                </div>

                <div className={styles.urlResult}>
                  <code className={styles.shortUrlCode}>{shortUrl}</code>
                  <button className={styles.copyButton} onClick={copyToClipboard}>
                    <Copy className={styles.copyIcon} />
                    Copy
                  </button>
                </div>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>Security Scan</div>
                    <div className={styles.statValue}>Completed in 0.8s</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>Link Generated</div>
                    <div className={styles.statValue}>Custom domain ready</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>Analytics</div>
                    <div className={styles.statValue}>Tracking enabled</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
