---
title: Structural Sharing
description: Learn about structural sharing, a technique used in persistent data structures and modern frontend state management to optimize memory and performance.
keywords: ["structural sharing", "persistent data structures", "react state management", "immutable state", "memory optimization frontend"]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Structural Sharing

**Structural sharing** is a memory optimization technique closely linked to immutable data structures. When modifying an immutable object or array, instead of creating an entirely new deep copy of the structure, structural sharing reuses the unmodified parts of the old data structure in the new one.

## The Cost of Deep Copies

If state objects in a React application were deep copied on every change, it would drastically increase the memory footprint and trigger intense Garbage Collection (GC) operations, locking the main thread.

```javascript
const state = {
  user: { id: 1, name: "Alice" },
  settings: { theme: "dark", notifications: true },
  posts: [/* 1000 items */]
};

// A deep copy (Expensive!)
const newState = JSON.parse(JSON.stringify(state)); 
newState.settings.theme = "light";
```
Here, even though we only touched `.settings.theme`, the entire array of `posts` and the `user` object are fully duplicated in memory.

## How Structural Sharing Works

When using an immutable pattern properly, we perform shallow copies of only the nodes leading down to the mutation. The rest of the nodes are *shared* by reference.

```javascript
const state = {
  user: { id: 1, name: "Alice" },
  settings: { theme: "dark", notifications: true },
  posts: [/* 1000 items */]
};

// Structural Sharing via Spread Operator
const newState = {
  ...state, // Shallow copy top level
  settings: {
    ...state.settings, // Shallow copy settings
    theme: "light" // Mutate
  }
};
```

In the example above:
- `newState.posts === state.posts` (true) -> **Memory shared**
- `newState.user === state.user` (true) -> **Memory shared**
- `newState.settings === state.settings` (false) -> **New reference**

## Why This Matters in React

React relies heavily on reference equality (`===`) during reconciliation (like in `React.memo` or `useMemo/useCallback`). 

If you mutate an object or do a deep copy, React doesn't know what exactly changed inside massive objects. But with structural sharing, React can quickly skip re-rendering the `User` or `PostList` components if `newState.user === state.user` returns true, speeding up the React render cycle significantly.

---

> Libraries like **Immutable.js** and **Immer** use advanced structural sharing patterns (like hash array mapped tries) to handle incredibly complex state trees cleanly and with optimal performance.
