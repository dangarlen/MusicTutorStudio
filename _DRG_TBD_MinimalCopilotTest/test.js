// Simple fallback test file
// The goal: demonstrate that `withTimeout` uses the fallback when the
// primary operation is slower than the provided timeout.

// withTimeout: run an async operation and fall back if it takes too long.
function withTimeout(fn, timeoutMs, fallback) {
  return new Promise((resolve) => {
    let didTimeout = false;
    const timer = setTimeout(() => {
      didTimeout = true;
      console.warn("⏱️ Timed out — using fallback");
      resolve(fallback());
    }, timeoutMs);

    // Expect fn to be a function returning a Promise.
    Promise.resolve()
      .then(() => fn())
      .then((result) => {
        if (!didTimeout) {
          clearTimeout(timer);
          resolve(result);
        }
      })
      .catch((err) => {
        if (!didTimeout) {
          clearTimeout(timer);
          console.warn("Primary failed — using fallback", err);
          resolve(fallback());
        }
      });
  });
}

// Fallback function to be used when the primary is too slow.
function testFallback() {
  return "🔁 Fallback result from Claude-2";
}

// Simulated slow primary (resolves after 3000ms). Timeout is 1000ms so
// the fallback should be used.
withTimeout(
  () => new Promise((res) => setTimeout(() => res("Primary result (late)"), 3000)),
  1000,
  testFallback
).then((result) => console.log("fallback-test:", result));

// Use agent profile: claude-2
function testClaude() {
  return "Claude-2 routed successfully";
}
