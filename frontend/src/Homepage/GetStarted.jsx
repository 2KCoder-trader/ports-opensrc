import styles from './GetStarted.module.css';
import { Link } from 'react-router-dom';

export default function GetStarted() {
    return (
      <section className={styles.getStarted}>
        <h2 className={styles.getStartedTitle}>Let's get started!</h2>
        <div className={styles.steps}>
          <Link to="/register" className={styles.step}>Sign Up</Link>
          <Link to="/demo" className={styles.step}>Browse Ports</Link>
          <div className={styles.step}>Invest</div>
        </div>
      </section>
    )
}
