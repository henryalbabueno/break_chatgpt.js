# BreakChatGPT

The ultimate compact huge-number library for JavaScript — symbolic, numeric, and record-breaking.

---

## Overview

BreakChatGPT is a lightweight big-number library that can handle:

- Small towers: fully computed numerically (e.g., 2↑↑3 → 16)
- Medium towers: computed iteratively using log10 + mantissa/exponent (up to a cutoff)
- Huge towers: symbolic representation when exceeding numeric cutoff
- Arithmetic: addition, subtraction, multiplication, division, powers
- Partial comparisons: eq, lt, lte, gt, gte

It is inspired by ExpantaNum but is ultra-compact and fast, while still handling numbers far beyond JavaScript’s native limits.

---

## MAX_NUM Cutoff Explanation

BreakChatGPT uses a custom numeric cutoff:

const MAX_NUM = 9.999e+9007199254740991;

Important notes:

1. This is NOT a real JavaScript float.  
   JS floats max out at Number.MAX_VALUE ≈ 1.7976931348623157e+308.  
   Numbers larger than that are treated as Infinity in JS.  

2. MAX_NUM is symbolic: it acts as an artificial threshold for when the library should switch from numeric to symbolic computation.  

3. Behavior:
   - Any number below MAX_NUM (small/medium towers) is computed numerically.  
   - Any number above MAX_NUM automatically becomes symbolic, preventing overflows or Infinity.  

This allows BreakChatGPT to handle extremely large numbers, including tetrations and up-arrow towers, without ever trying to store them as actual floats.

---

## Features

1. Up-arrow notation (Knuth's ↑, ↑↑, ↑↑↑, …)  
2. Exponentiation objects for 10^1000, 2^2^10, etc.  
3. Arithmetic handling with numeric computation fallback to symbolic  
4. Partial symbolic comparisons  
5. Approximate numeric evaluation with approximate()  
6. Compact design — small, fast, and readable  

Notes:  
- Tetrations (↑↑) are computed iteratively using log10 + mantissa/exponent.  
- Higher up-arrows (↑↑↑ and above) compute numerically if small, otherwise fallback to symbolic.  
- Example: 2↑↑↑2 = 2↑↑2 = 4 (computed numerically).  

---

## Installation

Using npm:

npm install break-chatgpt

Or clone the repo directly:

git clone https://github.com/henryalbabueno/BreakChatGPT.git

---

## Usage

const { BreakChatGPT } = require("./break_chatgpt");

// Small towers (numeric)
const a = new BreakChatGPT(2).upArrow(3); // 2 ↑↑ 3
console.log(a.approximate()); // 16

// Medium towers (log10 iteration)
const b = new BreakChatGPT(2).upArrow(6); // 2 ↑↑ 6
console.log(b.approximate()); // numeric if ≤ MAX_NUM, symbolic otherwise

// Huge towers (symbolic)
const c = new BreakChatGPT(3).upArrow(4, 3); // 3 ↑↑↑ 4
console.log(c.approximate()); // symbolic

// Arithmetic
const sum = a.add(new BreakChatGPT(3).upArrow(2));
console.log(sum.approximate());

// Comparisons
console.log(a.lt(sum)); // true
console.log(a.eq(new BreakChatGPT(16))); // true

// Exponentiation
const power = a.power(new BreakChatGPT(2)); // (2 ↑↑ 3)^2
console.log(power.approximate());

// Combining huge and small numbers
const combo = b.add(new BreakChatGPT(10).exp(1000));
console.log(combo.approximate()); // symbolic if over numeric cutoff

---

## Numeric vs Symbolic Examples

Expression | Result Type | Notes
---------- | ----------- | -----
2 ↑↑ 3 | Numeric | Computed: 2^(2^2) = 16
2 ↑↑ 6 | Numeric/Symbolic | Computed if ≤ MAX_NUM
2 ↑↑↑ 2 | Numeric | 2 ↑↑ 2 = 4
3 ↑↑↑ 4 | Symbolic | Too large to compute numerically
10^1000 | Symbolic | Exceeds MAX_NUM

---

## Why BreakChatGPT?

- Compact: far fewer lines than similar libraries  
- Powerful: handles symbolic numbers far beyond 10↑↑(2^1024)  
- Safe: numeric computations automatically fallback to symbolic  
- Flexible: supports numeric operations, towers, and partial comparisons  

---

## Contribution

Pull requests and suggestions are welcome! This is intended to be the most compact symbolic big-number library for JavaScript.

---

## License

MIT License
