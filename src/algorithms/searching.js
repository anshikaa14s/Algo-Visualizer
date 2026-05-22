/**
 * Searching Algorithm Generators for NexusAlgo Algorithm Visualizer
 * All functions are ES6 generators that yield step details:
 * {
 *   array: number[],
 *   active: number | null,       // current element being inspected
 *   found: number | null,        // index where element is found
 *   checked: number[],           // elements already inspected and discarded
 *   low: number | null,          // Binary Search low boundary
 *   high: number | null,         // Binary Search high boundary
 *   desc: string,
 *   codeLine: number,
 *   stats: { comparisons: number }
 * }
 */

// 1. LINEAR SEARCH
export function* linearSearch(arr, target) {
  let a = [...arr];
  let n = a.length;
  let checked = [];
  let stats = { comparisons: 0 };

  for (let i = 0; i < n; i++) {
    stats.comparisons++;
    yield {
      array: [...a],
      active: i,
      found: null,
      checked: [...checked],
      low: null,
      high: null,
      desc: `Checking index ${i}. Comparing element ${a[i]} with target ${target}.`,
      codeLine: 2,
      stats: { ...stats }
    };

    if (a[i] === target) {
      yield {
        array: [...a],
        active: null,
        found: i,
        checked: [...checked],
        low: null,
        high: null,
        desc: `Target ${target} found successfully at index ${i}!`,
        codeLine: 3,
        stats: { ...stats }
      };
      return;
    }
    
    checked.push(i);
    yield {
      array: [...a],
      active: null,
      found: null,
      checked: [...checked],
      low: null,
      high: null,
      desc: `Element ${a[i]} at index ${i} is not equal to target ${target}. Moving to next.`,
      codeLine: 4,
      stats: { ...stats }
    };
  }

  // Not found
  yield {
    array: [...a],
    active: null,
    found: -1,
    checked: [...checked],
    low: null,
    high: null,
    desc: `Target ${target} was not found in the array after checking all ${n} elements.`,
    codeLine: 5,
    stats: { ...stats }
  };
}

// 2. BINARY SEARCH (Expects a sorted array)
export function* binarySearch(arr, target) {
  // Sort the array first to ensure binary search is valid, but copy it so we don't mutate input
  let a = [...arr].sort((x, y) => x - y);
  let n = a.length;
  let low = 0;
  let high = n - 1;
  let checked = [];
  let stats = { comparisons: 0 };

  yield {
    array: [...a],
    active: null,
    found: null,
    checked: [],
    low: low,
    high: high,
    desc: `Starting Binary Search. Low is set to 0, High is set to ${high}.`,
    codeLine: 1,
    stats: { ...stats }
  };

  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    stats.comparisons++;

    yield {
      array: [...a],
      active: mid,
      found: null,
      checked: [...checked],
      low: low,
      high: high,
      desc: `Calculating middle index: Mid = (${low} + ${high}) / 2 = ${mid}. Inspecting value ${a[mid]}.`,
      codeLine: 2,
      stats: { ...stats }
    };

    if (a[mid] === target) {
      yield {
        array: [...a],
        active: null,
        found: mid,
        checked: [...checked],
        low: low,
        high: high,
        desc: `Target ${target} matches element at index ${mid}! Search successful!`,
        codeLine: 3,
        stats: { ...stats }
      };
      return;
    }

    if (a[mid] < target) {
      // Discard left half
      for (let k = low; k <= mid; k++) {
        if (!checked.includes(k)) checked.push(k);
      }
      let oldLow = low;
      low = mid + 1;
      yield {
        array: [...a],
        active: null,
        found: null,
        checked: [...checked],
        low: low,
        high: high,
        desc: `Since middle value ${a[mid]} is less than target ${target}, we discard indices [${oldLow} to ${mid}]. Adjust Low to ${low}.`,
        codeLine: 4,
        stats: { ...stats }
      };
    } else {
      // Discard right half
      for (let k = mid; k <= high; k++) {
        if (!checked.includes(k)) checked.push(k);
      }
      let oldHigh = high;
      high = mid - 1;
      yield {
        array: [...a],
        active: null,
        found: null,
        checked: [...checked],
        low: low,
        high: high,
        desc: `Since middle value ${a[mid]} is greater than target ${target}, we discard indices [${mid} to ${oldHigh}]. Adjust High to ${high}.`,
        codeLine: 5,
        stats: { ...stats }
      };
    }
  }

  // Not found
  yield {
    array: [...a],
    active: null,
    found: -1,
    checked: [...checked],
    low: low,
    high: high,
    desc: `Low (${low}) exceeded High (${high}). Target ${target} is not present in the array.`,
    codeLine: 6,
    stats: { ...stats }
  };
}
