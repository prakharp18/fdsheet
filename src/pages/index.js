import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

// Safe inline SVGs to guarantee SSR works perfectly without external libs.
const Icons = {
  Concept: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 16 4-4-4-4"/><path d="M8 12h8"/></svg>
  ),
  Architecture: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
  ),
  Performance: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
  ),
  Arrow: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '4px', verticalAlign: 'middle'}}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
};

function FeatureCard({ title, description, Icon, className, to }) {
  return (
    <Link to={to} className={clsx(styles.bentoCard, className)}>
      <div>
        <div className={styles.cardIconWrapper}>
          <Icon />
        </div>
        <Heading as="h3" className={styles.cardTitle}>{title}</Heading>
        <p className={styles.cardDesc}>{description}</p>
      </div>
    </Link>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          Frontend Deep Dive Sheets
        </Heading>
        <p className={styles.heroSubtitle}>
          Master modern frontend concepts with absolute clarity.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/intro">
            Start Learning <Icons.Arrow />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Home`}
      description="Modern Frontend Engineering Documentation">
      <HomepageHeader />
      <main>
        <section className={styles.bentoContainer}>
          <FeatureCard 
            title="Hydration"
            description="Deep dive into the bridge between server and client. Mechanics of interactive DOM."
            Icon={Icons.Concept}
            className={styles.spanLarge}
            to="/docs/frontend/hydration"
          />
          <FeatureCard 
            title="Islands Architecture"
            description="Islands Architecture: Shipping zero JS where it matters."
            Icon={Icons.Architecture}
            to="/docs/frontend/islands-architecture"
          />
          <FeatureCard 
            title="Partial Hydration"
            description="Selective hydration patterns for peak performance."
            Icon={Icons.Performance}
            to="/docs/frontend/partial-hydration"
          />
        </section>
      </main>
    </Layout>
  );
}
