# Partial Hydration

Partial Hydration (also known as Selective Hydration) is an optimization technique where only specific portions of a server-rendered page are made interactive, rather than hydrating the entire application.

It aims to solve the "all-or-nothing" problem of traditional hydration by prioritizing critical interactions and reducing JavaScript execution time.

## Internal Working
In a traditional app, the entire page is treated as one large component tree. If you have a search bar and a massive footer, the browser must wait for the JavaScript for both to load and execute before the search bar becomes interactive.

1. **Static Analysis**: The code is analyzed to determine which components are truly interactive (stateful) and which are static (static content).
2. **Laziness**: JavaScript bundles are split. The browser only downloads the JS required for interactive components.
3. **Selective Boot**: The framework hydrates components independently. A "Heavy Dashboard" might hydrate only after a "Simple Toggle" is already live.

### Mermaid Diagram: Partial vs Total Hydration
```mermaid
graph TD
    subgraph "Traditional Hydration"
        A[Root Component] --> B[Navbar]
        A --> C[Hero Section]
        A --> D[Complex Chart]
        A --> E[Footer]
        Note bottom of A: Entire tree must hydrate at once
    end

    subgraph "Partial Hydration"
        F[Static HTML Page]
        G[Island: Navbar]
        H[Static Hero]
        I[Island: Complex Chart]
        J[Static Footer]
        F -.-> G
        F -.-> H
        F -.-> I
        F -.-> J
        style G fill:#f9f,stroke:#333
        style I fill:#f9f,stroke:#333
        Note bottom of G: Only purple nodes hydrate
    end
```

## Real-World Example: A Documentation Site
On a page like this one:
- The **Article Text** is static (it doesn't need JS to be read).
- The **Table of Contents** link clicks are handled by standard HTML.
- Only the **Search Modal** or **Theme Switcher** needs hydration.
By using partial hydration, we avoid downloading the JS for the article text processing on every page hit.

## Code Snippet: React 18 Selective Hydration (Conceptual)
```javascript
import { Suspense, lazy } from 'react';

const HeavyDashboard = lazy(() => import('./HeavyDashboard'));

function App() {
  return (
    <div>
      <Header /> {/* Constant/Static */}
      
      <Suspense fallback={<p>Loading interactive chart...</p>}>
        {/* React 18 allows this island to hydrate independently */}
        <HeavyDashboard />
      </Suspense>
      
      <Footer /> {/* Constant/Static */}
    </div>
  );
}
```

## Key Idea
Partial Hydration is about **prioritizing intelligence**—don't pay the JavaScript cost for nodes that don't need it.

## Why it Matters
- **TBT (Total Blocking Time)**: Lowering the execution time on the main thread.
- **Payload Size**: Only shipping JS for bits that actually move.
- **Resilience**: A crash in one "island" doesn't necessarily break the rest of the page.

## Interview Insights
- **Q: What problem does "Selective Hydration" solve in React 18?**
  - A: It allows React to start hydrating parts of the page even if some components are still waiting for data or code to load, preventing the main thread from being locked by a single slow component.
- **Q: How does it improve the "Uncanny Valley" effect?**
  - A: The Uncanny Valley is the gap between seeing a page and being able to interact with it. Partial hydration makes the critical bits interactive faster, closing that gap.

## Common Mistakes
- **Shared State Complexity**: If two partially hydrated islands need to share state, you often need a lightweight state manager outside the components (like nanostores or custom events).
- **Over-Splitting**: Creating too many tiny islands can lead to many small network requests, which has its own overhead.

## Comparison: Total vs. Partial Hydration
| Feature | Total Hydration | Partial Hydration |
| :--- | :--- | :--- |
| **Main Thread Tech** | One large task | Multiple micro-tasks |
| **JS Payload** | Includes code for static parts | Excludes code for static parts |
| **Component Model** | Monolithic Tree | Decoupled Islands |
| **Complexity** | Simple / Standard | Requires specialized architecture |
