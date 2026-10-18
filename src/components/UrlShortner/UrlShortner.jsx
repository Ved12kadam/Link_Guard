"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, Copy, ExternalLink, Eye, Clock } from "lucide-react";
import styles from "./urlshortner.module.css";

function UrlShortner() {
  /* ---------- state ---------- */
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentUrls, setRecentUrls] = useState([]);
  const [checked, setChecked] = useState(false);
  const [inputURLValidationPassed, setInputURLValidationPassed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shortenedUrls, setShortenedUrls] = useState(null);
  const [customHash, setCustomHash] = useState("");


  /* run‑once refs */
  const fetchedRef   = useRef(false);
  const redirectRef  = useRef(false);

 const apiBaseUrl = "http://localhost:5000";

  /* ---------- helpers ---------- */
  const copyToClipboard = (text) => navigator.clipboard.writeText(text);
  const truncateUrl = (u, max = 40) => (u.length > max ? `${u.slice(0, max)}…` : u);

  /* ---------- input change ---------- */
  const handleInputChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    setInputURLValidationPassed(val.startsWith("http://") || val.startsWith("https://"));
    setErrorMsg("");
  };

  /* ---------- fetch URLs ---------- */
  const fetchData = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/urls`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) throw new Error(json.error || "Unable to fetch URLs");

      setShortenedUrls(json.urls);
      setRecentUrls(
        json.urls
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((u) => ({
            id: `${u.hash}-${u.timestamp}`,
            originalUrl: u.original_url,
            shortUrl: `${window.location.origin}/${u.hash}`,
            timestamp: new Date(u.timestamp).toLocaleString(),
            clicks: u.visits || 0,
          }))
      );
    } catch (err) {
      setErrorMsg(err.message || "Network error");
    }
  };

  /* ---------- redirect if path is a hash ---------- */
  const redirectToURL = () => {
  const hashPath = window.location.pathname.substring(1);

  // List of SPA frontend routes to ignore
  const reservedRoutes = new Set([
    "",              // root
    "mainpage",
    "signup",
    "signin",
    "landing",
    "urlshortner",
    // add more valid routes as needed
  ]);

  // Only check for redirect if it's not a known route
  if (!reservedRoutes.has(hashPath)) {
    fetch(`${apiBaseUrl}/api/redirect?` + new URLSearchParams({ hash: hashPath }), {
  credentials: "include",
})

      .then((res) => res.json())
      .then((data) => {
        if (data.original_url) {
          window.location.replace(data.original_url);
        }
      })
      .catch((err) => {
        console.warn("Redirect check failed:", err);
      });
  }
};



  /* ---------- component mount ---------- */
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (!redirectRef.current) {
      redirectRef.current = true;
      redirectToURL();
    }
  }, []);

  /* ---------- submit handler ---------- */
  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg("");
  const formData = new FormData(e.target);

  try {
    setIsLoading(true);

    const res = await fetch(`${apiBaseUrl}/api/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url_to_shorten: url,
        custom_hash: checked ? customHash : null,
      }),
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json.error)
      throw new Error(json.error || "Failed to shorten URL");
    if (!json.hash) throw new Error("Server response missing hash");

    const newShortUrl = `${window.location.origin}/${json.hash}`;
    setShortUrl(newShortUrl);

    setRecentUrls((prev) => [
      {
        id: Date.now(),
        originalUrl: json.original_url,
        shortUrl: newShortUrl,
        timestamp: new Date().toLocaleString(),
        clicks: 0,
      },
      ...prev,
    ]);
  } catch (err) {
    console.error(err);
    setErrorMsg(err.message || "Unknown error");
  } finally {
    setIsLoading(false);
  }
};


  /* ---------- JSX ---------- */
  return (
    <div className={styles.urlShortener}>
      {/* header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Link className={styles.icon} />
        </div>
        <div>
          <h2 className={styles.title}>URL Shortener</h2>
          <p className={styles.description}>Create short, trackable links instantly</p>
        </div>
      </div>

      {/* error banner */}
      {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

      {/* form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="url"
            name="url_to_shorten"
            placeholder="Enter your long URL here..."
            value={url}
            onChange={handleInputChange}
            className={styles.input}
          />
          {checked && (
            <input
    type="text"
    name="custom_hash"
    placeholder="Enter custom short path..."
    className={styles.customInput}
    value={customHash}
    onChange={(e) => setCustomHash(e.target.value)}
  />
          )}
        </div>

        <div className={styles.checkboxContainer}>
          <input
            id="customHashCheckbox"
            type="checkbox"
            className={styles.checkbox}
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          <label htmlFor="customHashCheckbox">Use custom short URL</label>
        </div>

        <button
          type="submit"
          disabled={!inputURLValidationPassed || isLoading}
          className={styles.button}
        >
          {isLoading ? "Shortening..." : "Shorten URL"}
        </button>
      </form>

      {/* latest result */}
      {shortUrl && (
        <div className={styles.result}>
          <div className={styles.resultLabel}>Your shortened URL:</div>
          <div className={styles.resultUrl}>
            <code className={styles.urlCode}>{shortUrl}</code>
            <button onClick={() => copyToClipboard(shortUrl)} className={styles.copyButton}>
              <Copy className={styles.copyIcon} />
              Copy
            </button>
          </div>
        </div>
      )}

      {/* recent URLs list */}
      {recentUrls.length > 0 && (
        <div className={styles.recentSection}>
          <h3 className={styles.recentTitle}>Recent URLs</h3>
          <div className={styles.recentList}>
            {recentUrls.map((entry) => (
              <div key={entry.id} className={styles.recentItem}>
                <div className={styles.urlInfo}>
                  <div className={styles.urlRow}>
                    <span className={styles.urlLabel}>Original:</span>
                    <div className={styles.urlValue}>
                      <a
                        href={entry.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.originalLink}
                      >
                        {truncateUrl(entry.originalUrl)}
                        <ExternalLink className={styles.externalIcon} />
                      </a>
                      <button
                        onClick={() => copyToClipboard(entry.originalUrl)}
                        className={styles.copyButtonSmall}
                        title="Copy original URL"
                      >
                        <Copy className={styles.copyIconSmall} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.urlRow}>
                    <span className={styles.urlLabel}>Short:</span>
                    <div className={styles.urlValue}>
                      <a
                        href={entry.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.shortLink}
                      >
                        {entry.shortUrl}
                      </a>
                      <button
                        onClick={() => copyToClipboard(entry.shortUrl)}
                        className={styles.copyButtonSmall}
                        title="Copy short URL"
                      >
                        <Copy className={styles.copyIconSmall} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.urlMeta}>
                  <div className={styles.metaItem}>
                    <Eye className={styles.metaIcon} />
                    <span>{entry.clicks} clicks</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock className={styles.metaIcon} />
                    <span className={styles.timestamp}>{entry.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UrlShortner;
