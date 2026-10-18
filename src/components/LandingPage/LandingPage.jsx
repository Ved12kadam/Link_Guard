import Navbar from "./Navbar/Navbar";
import Hero from "./Hero/Hero";
import Features from "./Features/Features";
import Demo from "./Demo/Demo";
import CTA from "./CTA/CTA";
import Footer from "./Footer/Footer";
import styles from "./LandingPage.module.css";
import MouseEffect from "../MouseEffect/MouseEffect";
const LandingPage = () => (
  <div className={styles.landing}>
    <MouseEffect />
    {/* Background gradients */}
    <div className={styles.backgroundGradients}>
      <div className={styles.backgroundOverlay} />
      <div className={styles.gradientBlue} />
      <div className={styles.gradientPurple} />
    </div>

    <div className={styles.content}>
      <Navbar />
      <Hero />
      <Features />
      <Demo />
      <CTA />
      <Footer />
    </div>
  </div>
);

export default LandingPage;
