"use client";

import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
} from "lucide-react";
import styles from "./MaliciousDetector.module.css";

/** ------------------------------------------------------------------
 *  This component keeps the **same UI** as before ‑ only the back‑end
 *  call logic is replaced with the real `/predict` endpoint.
 * ------------------------------------------------------------------*/
export default function MaliciousDetector() {
  /* ----------------‑ local state ---------------- */
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);   // { status, riskScore, … }
  const [errorMsg, setErrorMsg] = useState("");

  const [scanHistory, setScanHistory] = useState([
    /* initial mock items just for the UI demo; will be
       replaced / appended to when real scans run */
    {
      id: 1,
      url: "https://suspicious-site.com",
      status: "malicious",
      scanned: "5 minutes ago",
      riskScore: 95,
    },
    {
      id: 2,
      url: "https://legitimate-site.com",
      status: "safe",
      scanned: "1 hour ago",
      riskScore: 5,
    },
  ]);

  /* ----------------‑ helpers ---------------- */
  const apiEndpoint = "http://localhost:5000/predict";


  const statusFromPrediction = (p) =>
    p === 1 ? "malicious" : p === -1 ? "warning" : "safe";

  const iconForStatus = (status) =>
    status === "safe"      ? <CheckCircle className={styles.statusIconSafe}    /> :
    status === "warning"   ? <AlertTriangle className={styles.statusIconWarning} /> :
    status === "malicious" ? <XCircle    className={styles.statusIconDanger}  /> :
                             <Shield      className={styles.statusIcon}        />;

  const colorForStatus = (status) =>
    status === "safe"      ? "#10b981" :
    status === "warning"   ? "#f59e0b" :
    status === "malicious" ? "#ef4444"  :
                             "#6b7280";

  /* ----------------‑ main action ---------------- */
  const handleScan = async () => {
    if (!url.trim()) return;
    setIsScanning(true);
    setErrorMsg("");
    setScanResult(null);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: url }),
      });

      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || "Scan failed");

      const status = statusFromPrediction(data.prediction);

      /* build the object the old UI expects */
      const result = {
        status,                         // safe | warning | malicious
        riskScore: data.risk,           // percentage
        threats:
          status === "malicious"
            ? ["Phishing", "Malware"]
            : status === "warning"
            ? ["Suspicious Content"]
            : [],
        details:
          status === "malicious"
            ? "This URL has been identified as malicious and should not be accessed."
            : status === "warning"
            ? "This URL shows suspicious characteristics. Proceed with caution."
            : "This URL appears safe based on the security analysis.",
        recommendations:
          status === "malicious"
            ? [
                "Do not visit this website",
                "Report this URL to security authorities",
                "Run an antivirus scan if you already visited",
              ]
            : status === "warning"
            ? [
                "Exercise caution when visiting",
                "Avoid entering personal information",
                "Consider using a sandbox environment",
              ]
            : ["URL appears safe to visit"],
      };

      setScanResult(result);

      /* prepend to history */
      setScanHistory((prev) => [
        {
          id: Date.now(),
          url,
          status,
          scanned: new Date().toLocaleTimeString(),
          riskScore: data.risk,
        },
        ...prev.slice(0, 9), // keep last 10
      ]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Unexpected error");
    } finally {
      setIsScanning(false);
    }
  };

  /* ----------------‑ JSX ---------------- */
  return (
    <div className={styles.maliciousDetector}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Shield className={styles.icon} />
        </div>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Malicious Link Detector</h2>
          <p className={styles.description}>
            AI‑powered threat detection to scan URLs for malware, phishing,
            and suspicious content
          </p>
        </div>
      </div>

      {/* Error banner */}
      {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

      {/* Scan Form */}
      <div className={styles.scannerForm}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>URL to Scan</label>
          <input
            type="url"
            placeholder="Enter URL to check for threats…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={styles.input}
          />
        </div>

        <button
          onClick={handleScan}
          disabled={!url || isScanning}
          className={styles.scanButton}
        >
          {isScanning ? "Scanning…" : "Scan for Threats"}
        </button>

        {/* Scanning Progress */}
        {isScanning && (
          <div className={styles.scanningProgress}>
            <div className={styles.scanningIcon}>
              <Shield className={styles.spinningIcon} />
            </div>
            <div className={styles.scanningSteps}>
              {[
                "Analyzing URL structure…",
                "Querying threat databases…",
                "Running deep content scan…",
              ].map((step) => (
                <div key={step} className={styles.scanStep}>
                  <span className={styles.stepText}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div
            className={`${styles.scanResult} ${styles[scanResult.status]}`}
          >
            <div className={styles.resultHeader}>
              <div className={styles.resultStatus}>
                {iconForStatus(scanResult.status)}
                <span className={styles.statusText}>
                  {scanResult.status === "safe" && "Safe"}
                  {scanResult.status === "warning" && "Potentially Suspicious"}
                  {scanResult.status === "malicious" && "Malicious Detected"}
                </span>
              </div>
              <div className={styles.riskScore}>
                <span className={styles.riskLabel}>Risk Score:</span>
                <span
                  className={styles.riskValue}
                  style={{ color: colorForStatus(scanResult.status) }}
                >
                  {scanResult.riskScore}/100
                </span>
              </div>
            </div>

            <div className={styles.resultDetails}>
              <p className={styles.detailsText}>{scanResult.details}</p>

              {scanResult.threats.length > 0 && (
                <div className={styles.threatsSection}>
                  <h4 className={styles.threatsTitle}>Detected Threats:</h4>
                  <div className={styles.threatsList}>
                    {scanResult.threats.map((t) => (
                      <span key={t} className={styles.threatTag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.recommendationsSection}>
                <h4 className={styles.recommendationsTitle}>
                  Recommendations:
                </h4>
                <ul className={styles.recommendationsList}>
                  {scanResult.recommendations.map((rec) => (
                    <li key={rec} className={styles.recommendationItem}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scan History */}
      <div className={styles.scanHistory}>
        <h3 className={styles.sectionTitle}>Recent Scans</h3>
        <div className={styles.historyList}>
          {scanHistory.map((scan) => (
            <div key={scan.id} className={styles.historyItem}>
              <div className={styles.historyInfo}>
                <div className={styles.historyUrl}>
                  <div className={styles.urlText}>{scan.url}</div>
                  <div className={styles.scanTime}>
                    <Clock className={styles.clockIcon} />
                    {scan.scanned}
                  </div>
                </div>
                <div className={styles.historyStatus}>
                  {iconForStatus(scan.status)}
                  <span className={styles.historyStatusText}>
                    Risk Score: {scan.riskScore}/100
                  </span>
                </div>
              </div>
              <div className={styles.historyActions}>
                <button className={styles.historyActionButton}>
                  <Eye className={styles.historyActionIcon} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
