---
title: Virtual DOM Diffing Complexity
description: An in-depth explanation of Virtual DOM diffing complexity, the $O(n^3)$ algorithm, and how React optimizes it to $O(n)$.
keywords: ["virtual dom", "diffing complexity", "react algorithm", "reconciliation heuristic", "tree edit distance algorithms", "O(n^3)", "O(n)"]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Virtual DOM Diffing Complexity

Creating a robust UI library relies not only on building a tree of nodes (Virtual DOM) but also efficiently figuring out what changed from one render to the next to update the actual DOM. This calculation is called **diffing**.

## The Problem: Tree Edit Distance Complexity

Computer science offers algorithms to find the minimum number of operations to transform one tree into another (known as the Tree Edit Distance problem). 

However, state-of-the-art algorithms have a complexity in the order of **$O(n^3)$**, where $n$ is the number of elements in the tree.

**Why $O(n^3)$ is problematic:**
- If you render 1000 elements in React, the calculation would require around **1,000,000,000** (one billion) comparisons per render cycle. This is computationally far too expensive for 60FPS browser environments.

## React's Heuristic O(n) Approach

To solve this, React implements a heuristic $O(n)$ algorithm during Reconciliation, based on two major assumptions:

1. **Two elements of different types will produce different trees.**
2. **The developer can hint at which child elements may be stable across different renders with a `key` prop.**

### 1. Elements Of Different Types

Whenever the root elements have different types, React will completely tear down the old tree and build the new tree from scratch.

- Example: Changing an `<a>` to a `<img>`, or from an `<Article>` component to a `<Comment>` component. 
- In this scenario, any state associated with the old tree is totally lost. React completely unmounts the old components (calling `componentWillUnmount` / cleanup functions) and mounts the new ones.

### 2. Elements Of The Same Type

When comparing two React DOM elements of the same type, React looks at the attributes of both, keeps the same underlying DOM node, and only updates the changed attributes.

```jsx
// Before
<div className="before" title="stuff" />

// After
<div className="after" title="stuff" />
```
React recognizes `title` is the same and only mutates the `className` on the underlying DOM node. After handling the DOM node, it then recurses on the children.

### 3. The `key` Prop For Lists

By default, when recursing on the children of a DOM node, React just iterates over both lists of children at the same time and generates a mutation whenever there's a difference.

If you insert an element at the *start* of the list, React will mutate every child because they all effectively shifted down, without realizing it could keep the old children intact.

To solve this, React supports a `key` attribute. When children have keys, React uses the key to match children in the original tree with children in the subsequent tree.

```jsx
// Before
<ul>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>

// After
<ul>
  <li key="2014">Connecticut</li>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>
```
Now React knows that the element with key `'2014'` is the new one, and the elements with keys `'2015'` and `'2016'` merely moved.

---

> By accepting these constraints, React effectively achieves an $O(n)$ complexity, resulting in blazing fast UI updates.
