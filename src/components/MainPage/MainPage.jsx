"use client"

import { useState, useEffect }
from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Link as LinkIcon,
  Shield,
  BarChart3,
  Clock,
  Zap,
  Settings,
  LogOut,
} from "lucide-react"
import MouseEffect from "../MouseEffect/MouseEffect"
import UrlShortner from "../UrlShortner/UrlShortner"
import MaliciousDetector from "../MalciousLinkDetector/MaliciousDetector"
import styles from "./MainPage.module.css"

const API_BASE = "http://localhost:5000"

function MainPage() {
  const [activeTab, setActiveTab] = useState("shortener")

  const [user, setUser] = useState({
    name: "Loading...",
    email: "",
    avatar: "/placeholder.svg?height=40&width=40",
  })

  const [stats, setStats] = useState([
    { label: "Links Created", value: "—", icon: LinkIcon, color: "#3b82f6" },
    { label: "Threats Blocked", value: "—", icon: Shield, color: "#ef4444" },
    { label: "Total Clicks", value: "—", icon: BarChart3, color: "#10b981" },
  ])

  useEffect(() => {
    const fetchMainPageDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/mainpage-details`, { credentials: "include" })
        if (!res.ok) throw new Error("Failed to load dashboard data")
        const data = await res.json()

        setUser({
          name: data.name,
          email: data.email,
          avatar: data.avatar || "/placeholder.svg?height=40&width=40",
        })

        setStats([
          { label: "Links Created", value: data.stats.links_created, icon: LinkIcon, color: "#3b82f6" },
          { label: "Threats Blocked", value: data.stats.threats_blocked, icon: Shield, color: "#ef4444" },
          { label: "Total Clicks", value: data.stats.total_clicks, icon: BarChart3, color: "#10b981" },
        ])
      } catch (err) {
        console.error(err)
      }
    }

    fetchMainPageDetails()
  }, [])

  const tabs = [
    { id: "shortener", name: "URL Shortener", icon: LinkIcon, description: "Create short, trackable links" },
    { id: "detector", name: "Malicious Detector", icon: Shield, description: "Scan links for threats" },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "shortener":
        return <UrlShortner />
      case "detector":
        return <MaliciousDetector />
      default:
        return <UrlShortner />
    }
  }

  const handleSignOut = async () => {
    try {
      const res = await fetch(`${API_BASE}/signout`, {
        method: "POST",
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        window.location.href = data.redirect
      } else {
        alert("Failed to sign out.")
      }
    } catch (err) {
      console.error("Sign out error:", err)
      alert("Something went wrong during sign out.")
    }
  }

  return (
    <div className={styles.mainPage}>
      <MouseEffect />

      <div className={styles.backgroundGradients}>
        <div className={styles.backgroundOverlay} />
        <div className={styles.gradientBlue} />
        <div className={styles.gradientPurple} />
      </div>

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <RouterLink to="/" className={styles.logo}>
              <span className={styles.logoText}>LinkGuard</span>
              <span className={styles.logoSubtext}>Dashboard</span>
            </RouterLink>

            <div className={styles.userProfile}>
              <img src={user.avatar} alt={user.name} className={styles.avatar} />
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
              <button className={styles.profileButton}>
                <Settings className={styles.profileIcon} />
              </button>
              <button className={styles.profileButton} onClick={handleSignOut}>
                <LogOut className={styles.profileIcon} />
              </button>
            </div>
          </div>
        </header>

        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <s.icon className={styles.statIcon} style={{ color: s.color }} />
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <nav className={styles.tabNavigation}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""}`}
            >
              <tab.icon className={styles.tabIcon} />
              <div>
                <span className={styles.tabName}>{tab.name}</span>
                <span className={styles.tabDescription}>{tab.description}</span>
              </div>
              {activeTab === tab.id && <div className={styles.tabIndicator} />}
            </button>
          ))}
        </nav>

        <main className={styles.mainContent}>{renderTabContent()}</main>

        <section className={styles.quickActions}>
          <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
          <div className={styles.quickActionsList}>
            <button className={styles.quickActionButton}>
              <Zap className={styles.quickActionIcon} />
              <span>Bulk Shorten</span>
            </button>
            <button className={styles.quickActionButton}>
              <Clock className={styles.quickActionIcon} />
              <span>Recent Links</span>
            </button>
            <button className={styles.quickActionButton}>
              <BarChart3 className={styles.quickActionIcon} />
              <span>Analytics</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default MainPage
