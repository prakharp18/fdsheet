---
title: Transferable Objects
description: A deep dive into Transferable Objects, zero-copy data passing between threads, and optimizing Web Worker performance.
keywords: ["transferable objects", "postMessage", "performance", "arraybuffer transfer", "zero copy", "neutered buffer"]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Transferable Objects

**Transferable Objects** are a mechanism for passing data between threads (Main Thread to Worker, or Worker to Worker) with **zero-copy** performance. Instead of cloning the data, the browser "moves" the ownership of the memory from one context to another.

:::info[Core Philosophy]
**Ownership, Not Copies**. Moving a 1GB file via standard cloning takes seconds and double the RAM. Moving it as a Transferable takes milliseconds because only the internal "address" of the data is handed over.
:::

---

## 1. Easy: Cloning vs. Transferring

- **Structured Cloning (Default)**: When you `postMessage({ data: myArr })`, the browser recursively copies every value. `myArr` still exists in the Main Thread and is new in the Worker.
- **Transferring**: When you use the transfer list, the browser detaches `myArr` from the Main Thread (it becomes "neutered") and attaches it directly to the Worker.

```mermaid
graph TD
    subgraph "Main Thread"
    A[Original Memory Block]
    end
    
    subgraph "Web Worker"
    B[Worker Context]
    end
    
    A -- postMessage(..., [A]) --> B
    Note over A: Memory is now empty/neutered!
```

---

## 2. Medium: The Neutered State

Once an object is transferred, it becomes **unusable** in the original context. If you attempt to access an `ArrayBuffer` that has been transferred, its `.byteLength` will be 0, and any attempt to read its values will fail or return `undefined`.

---

## 3. Hard: Implementing Transfereables

Only specific types can be transferred: `ArrayBuffer`, `MessagePort`, `ImageBitmap`, `OffscreenCanvas`, and `ReadableStream/WritableStream`.

<Tabs groupId="lang" queryString>
<TabItem value="js" label="JavaScript">

```javascript
// main.js
const worker = new Worker('worker.js');
const buffer = new ArrayBuffer(1024 * 1024 * 10); // 10MB

// Syntax: postMessage(message, [transferList])
worker.postMessage({ data: buffer }, [buffer]);

console.log(buffer.byteLength); // 0 (The buffer is now "neutered")

// worker.js
self.onmessage = (evt) => {
  const buffer = evt.data.data;
  console.log(buffer.byteLength); // 10485760 (Ownership received!)
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```typescript
// main.ts
const largeArray = new Float32Array(1000000); // 1 million floats
const worker = new Worker(new URL("./processor.ts", import.meta.url));

// We transfer the underlying buffer, not the typed array view
worker.postMessage({ array: largeArray }, [largeArray.buffer]);

// processor.ts
self.onmessage = (event: MessageEvent<{ array: Float32Array }>) => {
  const { array } = event.data;
  // Process data...
  
  // Return the result and transfer the buffer back
  const result = array.map(x => x * 2);
  self.postMessage({ result }, [result.buffer]);
};
```

</TabItem>
</Tabs>

---

## 4. Advanced: MessagePort and Streaming

Transferables aren't just for data; they are for **capabilities**.
1. **MessagePort**: You can create a `MessageChannel`, keep one port, and transfer the other port to a Worker. This allows two Workers to talk to each other directly without going through the Main Thread.
2. **Streams**: Transferring a `ReadableStream` allows a Worker to process a large network download chunk-by-chunk without the Main Thread ever touching the data.

---

## 5. Interview Prep: 4 Key Questions

### Q1: What happens to an ArrayBuffer after it is transferred?
**A:** It enters a "Neutered" state. The internal memory reference is removed from the original thread, its `.byteLength` becomes 0, and the `ArrayBuffer` becomes essentially an empty shell. This prevents multi-threaded race conditions because only one thread can ever "own" the memory at a time.

### Q2: How does Transferring differ from SharedArrayBuffer?
**A:** Transferring is **exclusive ownership**—only one thread can use the memory, but the "handoff" is instant. `SharedArrayBuffer` is **shared ownership**—multiple threads can use the memory simultaneously, but you must manually manage thread safety using the `Atomics` API.

### Q3: Why can't you transfer a regular JavaScript Object or a String?
**A:** Standard JS objects and strings are managed by the V8 Garbage Collector and their memory structure is complex and highly optimized for the current thread. Only "flat" memory structures like `ArrayBuffer` or browser-managed handles like `ImageBitmap` have the internal plumbing required to be detached and re-attached to a new thread.

### Q4: When should you use the "Transfer List" in postMessage?
**A:** You should use it whenever you are passing large datasets (typically $>1$MB) between threads. While structured cloning is fast for small objects, for large arrays (like image data, physics coordinates, or file contents), transferring avoids the CPU and memory cost of deep-copying, keeping the frame rate stable.
