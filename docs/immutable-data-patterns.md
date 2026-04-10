---
title: Immutable Data Patterns
description: A comprehensive guide on immutable data patterns in Javascript, their role in Redux/React, and tools like Immer and Immutable.js.
keywords: ["immutable data patterns", "javascript immutability", "react state mutation", "immer", "immutable.js", "frontend best practices"]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Immutable Data Patterns

In modern frontend architecture (especially inside frameworks like React or state machines like Redux), **Immutability** is a foundational rule.

Immutability means that once a data structure is created, it cannot be changed. To modify the structure, you must create a new copy with the updated values.

## The "Why" of Immutability

1. **Predictability:** State mutations create side effects that are extremely hard to track in large applications. Immutable data ensures state traces remain strictly linear.
2. **Performance (Reference Equality):** React determines when to re-render by comparing the old state versus the new state using `Object.is`. If `prevObj === nextObj` evaluates to `false`, React knows it needs to re-render. If data was forcefully mutated inside the old object, React has no cheap way of detecting the change.
3. **Time Travel Debugging:** Tools like the Redux DevTools can easily rewind application state because previous snapshots of state aren't destroyed.

## Vanilla JavaScript Patterns

The majority of immutable updates in React can be done natively using ES6 syntax.

### Updating Objects (Spread Operator)

```javascript
const user = { name: "Alice", age: 25 };

// BAD: Mutation
user.age = 26; 

// GOOD: Immutable Update
const updatedUser = {
  ...user,
  age: 26 
};
```

### Updating Arrays

**Appending/Prepending:**
```javascript
const list = [1, 2, 3];
// BAD: list.push(4) or list.unshift(0)
const newList = [...list, 4]; // Append
const prependedList = [0, ...list]; // Prepend
```

**Removing items:**
```javascript
// Remove element at index 1
const list = [1, 2, 3];
// BAD: list.splice(1, 1)
const newList = list.filter((_, index) => index !== 1);
```

**Modifying specific items:**
```javascript
const list = [{id: 1, active: false}, {id: 2, active: false}];
const newList = list.map(item => 
  item.id === 1 ? { ...item, active: true } : item
);
```

## The Nested Object Problem

Vanilla JS `...` (spread operator) only performs a **shallow copy**. Updating deeply nested state natively becomes unreadable:

```javascript
const state = { a: { b: { c: { d: 1 } } } };

// Updating 'd' native immutable way
const newState = {
  ...state,
  a: {
    ...state.a,
    b: {
      ...state.a.b,
      c: {
        ...state.a.b.c,
        d: 2
      }
    }
  }
};
```

## Tooling: Immer & Immutable.js

To avoid the verbose code above, the community uses structural sharing libraries.

### Immer
Immer allows you to write mutating logic that safely translates into an immutable update under the hood through JS Proxies. Redux Toolkit uses Immer out of the box.

```javascript
import produce from "immer";

const nextState = produce(state, draft => {
  draft.a.b.c.d = 2; // Looks like a mutation, but is fully immutable!
});
```

### Immutable.js
Created by Facebook, it provides its own API (`Map`, `List`) using advanced persistent data structures (Tries). While very powerful, it forces you to use unique setter/getter APIs instead of native JS objects, leading to a steep adoption curve.
