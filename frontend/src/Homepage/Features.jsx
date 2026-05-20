import { Shield, DollarSign, Clock, SmileIcon, Settings2, Eye } from 'lucide-react';
import styles from './Features.module.css';

export default function Features() {
  const features = [
    {
      title: "Secure Transactions",
      description: "By entering into positions through a centralized brokerage, we can ensure all positions are correctly allocated.",
      icon: Shield,
      iconClass: styles.iconSecure,
    },
    {
      title: "Creator Rewards",
      description: "As a creator, you earn a percentage of the investments in your port, encouraging you to perform consistently.",
      icon: DollarSign,
      iconClass: styles.iconRewards,
    },
    {
      title: "Partial Purchasing",
      description: "By investing in fractional shares, we can diversify your investments starting at just $5.",
      icon: Clock,
      iconClass: styles.iconPurchasing,
    },
    {
      title: "Beginner Friendly",
      description: "Whether you're a creator or an investor (or both!), we make it easy to sign up and get going.",
      icon: SmileIcon,
      iconClass: styles.iconBeginner,
    },
    {
      title: "Simplicity",
      description: "While we provide a wide variety of metrics to make a decision, we highlight the most important ones.",
      icon: Settings2,
      iconClass: styles.iconSimplicity,
    },
    {
      title: "Transparency",
      description: "Even though exact positions aren't disclosed, by making ports public you can view and compare their information.",
      icon: Eye,
      iconClass: styles.iconTransparency,
    },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>What features do we offer?</h2>
      <div className={styles.gridContainer}>
        {features.map((feature, index) => (
          <div key={index} className={styles.feature}>
            <feature.icon className={`${styles.icon} ${feature.iconClass}`} />
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}