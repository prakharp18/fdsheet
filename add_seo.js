const fs = require('fs');
const path = require('path');

const seoData = {
  'concurrent-rendering.md': {
    title: 'Concurrent Rendering',
    description: 'Deep dive into React 18 Concurrent Rendering, how it eliminates blocking renders, and alters the React runtime.',
    keywords: ['react concurrent rendering', 'react 18', 'startTransition', 'useDeferredValue', 'frontend performance']
  },
  'fiber-architecture.md': {
    title: 'Fiber Architecture',
    description: 'An in-depth explanation of React Fiber Architecture, how it queues state updates, and executes the rendering process.',
    keywords: ['react fiber', 'react internal architecture', 'react core algorithm', 'scheduling in react']
  },
  'hydration.md': {
    title: 'Hydration (Deep Dive)',
    description: 'Understand the mechanism of Hydration in modern JS frameworks like React and Vue, attaching event listeners to server-rendered DOM.',
    keywords: ['hydration in react', 'server side rendering hydration', 'react ssr', 'vue ssr', 'frontend hydration']
  },
  'islands-architecture.md': {
    title: 'Islands Architecture (Deep Dive)',
    description: 'Learn about Islands Architecture, a rendering paradigm for creating isolated interactive components within static HTML.',
    keywords: ['islands architecture', 'astro', 'partial hydration', 'zero javascript html', 'web performance islands']
  },
  'partial-hydration.md': {
    title: 'Partial Hydration (Selective Hydration)',
    description: 'Deep dive into Partial Hydration and Selective Hydration in React 18, deferring evaluation of non-interactive JavaScript.',
    keywords: ['partial hydration', 'selective hydration', 'react 18 suspension', 'frontend hydration optimization']
  },
  'reconciliation-algorithm.md': {
    title: 'Reconciliation Algorithm (Deep Dive)',
    description: 'Explore the React Reconciliation Algorithm, how diffing works, and the minimal set of mutations for DOM updates.',
    keywords: ['react reconciliation', 'react diffing algorithm', 'virtual dom diff', 'react render cycle']
  },
  'streaming-ssr.md': {
    title: 'Streaming SSR',
    description: 'A detailed look at Streaming Server-Side Rendering (SSR) in React, continuous chunking, and Suspense integration.',
    keywords: ['streaming ssr', 'react server streaming', 'suspense streaming', 'next.js streaming']
  },
  'time-slicing.md': {
    title: 'Time Slicing (Deep Dive)',
    description: 'Learn Time Slicing in React 18 Concurrent Mode, which prevents UI blocking by splitting rendering into micro-tasks.',
    keywords: ['react time slicing', 'concurrent mode', 'react micotasks', 'ui non-blocking renders', 'react performance']
  }
};

const dir = path.join(__dirname, 'docs');

for (const [filename, data] of Object.entries(seoData)) {
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (!content.startsWith('---')) {
      const frontmatter = `---
title: ${data.title}
description: ${data.description}
keywords: [${data.keywords.map(k => `"${k}"`).join(', ')}]
---

`;
      content = frontmatter + content;
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated frontmatter for ${filename}`);
    }
  }
}
