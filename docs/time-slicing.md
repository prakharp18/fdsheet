---
title: Time Slicing (Deep Dive)
description: Learn Time Slicing in React 18 Concurrent Mode, which prevents UI blocking by splitting rendering into micro-tasks.
keywords: ["react time slicing", "concurrent mode", "react micotasks", "ui non-blocking renders", "react performance"]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Time Slicing (Deep Dive)

Time Slicing is the scheduling mechanism introduced within React's Concurrent Mode (React 18) that completely eliminates the concept of single, massive, UI-blocking render cycles. 

Instead of freezing the browser the moment an intensive data array changes, React breaks the virtual calculation into tiny chunks measured in milliseconds, interleaving rendering work with user interactions (typing, scrolling).

:::info[Core Philosophy]
**Cooperative Multitasking.** Because JavaScript executes strictly on a single thread alongside layout paints and user events, any JS code that runs uninterrupted for longer than 16ms drops the browser’s frame rate below 60fps. Time Slicing solves this by manually yielding control back to the browser explicitly.
:::

---

## 1. How React Yields Control

Before Time Slicing, if React needed to render 10,000 `<TableRow />` child components, the Virtual DOM mapping would lock the entire main thread for up to 300ms. If the user tried to type in a search box perfectly during those 300ms, the input would physically freeze, heavily degrading perceived performance.

In the Time Slicing paradigm, React checks a timer every time it processes exactly one element in the Fiber Tree. If `5ms` has passed, React stops.

```mermaid
sequenceDiagram
    participant EventQueue as Browser Event Queue
    participant Scheduler as React ReactScheduler
    participant Fiber as React Reconciler
    
    EventQueue->>Scheduler: User typed "a" (Input state change)
    Scheduler->>Fiber: Begin Render Phase (High Priority)
    Fiber-->>Scheduler: Done calculating input diff (1ms). Commit to screen.
    
    EventQueue->>Scheduler: Data fetched from API (Low Priority)
    Scheduler->>Fiber: Begin calculating heavy 5000-item list diff
    loop Every 5ms Deadlines
        Fiber->>Fiber: Diff 50 items
        Fiber-->>EventQueue: ⏱️ Yield Control back to Browser!
        Note over EventQueue: Browser process mouse clicks/CSS paints
        EventQueue->>Fiber: Pick up where we left off...
    end
    Fiber-->>Scheduler: Finished Draft WIP Tree. Execute DOM Update.
```

---

## 2. Low-Level Implementation (MessageChannel API)

Modern JS provides APIs to request idle time (`requestIdleCallback`), but React explicitly abandoned it because it isn't aggressive enough. Apple's Safari caps `requestIdleCallback` to 30fps.

React implemented its own precise scheduler utilizing the `MessageChannel` Web API to force extremely tight, aggressive micro-task delays that yield exactly when React wants to.

<Tabs groupId="lang" queryString>
<TabItem value="js" label="JavaScript">

```javascript
const channel = new MessageChannel();
const port = channel.port2;
let isMessageLoopRunning = false;

// When the port receives a message, React does a chunk of work.
channel.port1.onmessage = function performWorkUntilDeadline() {
  const currentTime = performance.now();
  const deadline = currentTime + 5; // React's classic 5ms slice
  
  while (performance.now() < deadline) {
    // Traverse Fiber Linked List and do reconciliation math
    const hasMoreWork = reconcileNextFiberNode();
    
    if (!hasMoreWork) {
      isMessageLoopRunning = false;
      return; // Tree is completely diffed! Time to commit.
    }
  }
  
  // 5ms passed. The loop broke. We send another message to ourselves.
  // This physically yields control to the Browser, letting it paint input before running again!
  port.postMessage(null);
};

function scheduleConcurrentWork() {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null); 
  }
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```typescript
const channel: MessageChannel = new MessageChannel();
const port: MessagePort = channel.port2;
let isMessageLoopRunning: boolean = false;

channel.port1.onmessage = function performWorkUntilDeadline(): void {
  const currentTime: number = performance.now();
  const deadline: number = currentTime + 5; // React's classic 5ms slice
  
  while (performance.now() < deadline) {
    const hasMoreWork: boolean = reconcileNextFiberNode();
    
    if (!hasMoreWork) {
      isMessageLoopRunning = false;
      return; 
    }
  }
  
  port.postMessage(null);
};

function scheduleConcurrentWork(): void {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null); 
  }
}
```

</TabItem>
</Tabs>

:::tip[Developer Control]
You explicitly opt-in to Time Slicing. By default, standard state updates (like `setState`) are historically synchronous. To force React to chunk a heavy mathematical task via Time Slicing, you must wrap the state setter in the `useTransition()` hook.
:::

---

## 3. The Replay and Bailout Mechanics

What happens if React yields control during Time Slicing, and the user triggers a completely entirely new update that completely invalidates the work React was just doing?

For example:
1. User searches `"React"`.
2. React starts Time Slicing the massive array of results for `"React"`.
3. 2ms in, the user types `" Framework"`. The query is now `"React Framework"`.

In this scenario, React's scheduler is smart enough to conceptually "**trash**" the Work-In-Progress tree it was calculating. It intentionally abandons the sliced mathematical work for `"React"`, instantly absorbs the `"React Framework"` query into the highest priority slot, and begins a brand new background Time Sliced render from top to bottom.

---

## 4. Interview Prep: 4 Key Questions

### Q1: Can a user see a "half-rendered" component during Time Slicing?
**A:** No. Time Slicing exclusively interrupts the *Render Phase* (the mathematical Diffing of the Virtual DOM). The *Commit Phase* (which physically alters the DOM on the user's screen) is completely uninterruptible. React calculates the diff in chunks, but commits the unified result strictly simultaneously.

### Q2: Why does React use `MessageChannel` for its scheduling polyfill instead of `setTimeout(0)`?
**A:** `setTimeout(0)` seems like it yields to the browser instantly, but the HTML5 spec actually clamps nested `setTimeout` calls to a minimum of ~4ms after a few layers. This completely destroys React's frame budgeting. `MessageChannel` bypasses this minimum clamping, allowing sub-millisecond yielding loops.

### Q3: When should a developer completely avoid triggers that rely on Time Slicing (`startTransition`)?
**A:** Never use `startTransition` for controlled inputs (e.g., standard text box keystrokes). Your text inputs must always receive synchronous state tracking, or the user's cursor will skip and glitch wildly. Put the heavy derived-state rendering in the transition, but keep the raw input state totally synchronous.

### Q4: How is Time Slicing conceptually similar to Web Workers?
**A:** Both attempt to solve Main Thread blocking. Web Workers legitimately run code on a separate OS thread, natively allowing heavy math without blocking the DOM UI. Time Slicing is an illusion; it still runs on the main thread but achieves "parallel-like" responsiveness through extremely aggressive, surgical pausing.
