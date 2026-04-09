import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout title="Home" description="Frontend Deep Dive Sheets">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Frontend Deep Dive Sheets</h1>
        <p style={{ fontSize: '1.25rem', color: '#888', marginBottom: '2rem' }}>Master modern frontend concepts with clarity.</p>
        <Link className="button button--secondary button--lg" to="/docs/intro" style={{ border: '1px solid #333' }}>
          Enter Notes
        </Link>
      </div>
    </Layout>
  );
}

