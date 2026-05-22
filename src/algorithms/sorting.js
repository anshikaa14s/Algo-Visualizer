/**
 * Sorting Algorithm Generators for NexusAlgo Algorithm Visualizer
 * All functions are ES6 generators that yield step details:
 * {
 *   array: number[],
 *   compared: number[],
 *   swapped: number[],
 *   active: number[],
 *   sorted: number[],
 *   desc: string,
 *   stats: { comparisons: number, swaps: number },
 *   codeLine: number
 * }
 */

// 1. BUBBLE SORT
export function* bubbleSort(arr) {
  let a = [...arr];
  let n = a.length;
  let stats = { comparisons: 0, swaps: 0 };
  let sortedIndices = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      stats.comparisons++;
      yield {
        array: [...a],
        compared: [j, j + 1],
        swapped: [],
        active: [],
        sorted: [...sortedIndices],
        desc: `Comparing element at index ${j} (${a[j]}) and index ${j + 1} (${a[j + 1]}).`,
        stats: { ...stats },
        codeLine: 2
      };

      if (a[j] > a[j + 1]) {
        let temp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = temp;
        stats.swaps++;
        yield {
          array: [...a],
          compared: [],
          swapped: [j, j + 1],
          active: [],
          sorted: [...sortedIndices],
          desc: `Swapping ${a[j + 1]} and ${a[j]} since ${a[j + 1]} > ${a[j]}.`,
          stats: { ...stats },
          codeLine: 3
        };
      }
    }
    sortedIndices.push(n - 1 - i);
    yield {
      array: [...a],
      compared: [],
      swapped: [],
      active: [],
      sorted: [...sortedIndices],
      desc: `Index ${n - 1 - i} (${a[n - 1 - i]}) is now fully in place.`,
      stats: { ...stats },
      codeLine: 4
    };
  }
  // All sorted
  yield {
    array: [...a],
    compared: [],
    swapped: [],
    active: [],
    sorted: Array.from({ length: n }, (_, k) => k),
    desc: "Bubble Sort complete! The array is fully sorted.",
    stats: { ...stats },
    codeLine: 5
  };
}

// 2. SELECTION SORT
export function* selectionSort(arr) {
  let a = [...arr];
  let n = a.length;
  let stats = { comparisons: 0, swaps: 0 };
  let sortedIndices = [];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    yield {
      array: [...a],
      compared: [],
      swapped: [],
      active: [minIdx],
      sorted: [...sortedIndices],
      desc: `Setting index ${i} (${a[i]}) as the initial minimum.`,
      stats: { ...stats },
      codeLine: 1
    };

    for (let j = i + 1; j < n; j++) {
      stats.comparisons++;
      yield {
        array: [...a],
        compared: [j, minIdx],
        swapped: [],
        active: [minIdx],
        sorted: [...sortedIndices],
        desc: `Comparing element at index ${j} (${a[j]}) with current minimum at index ${minIdx} (${a[minIdx]}).`,
        stats: { ...stats },
        codeLine: 2
      };

      if (a[j] < a[minIdx]) {
        minIdx = j;
        yield {
          array: [...a],
          compared: [],
          swapped: [],
          active: [minIdx],
          sorted: [...sortedIndices],
          desc: `Found a smaller element. New minimum set to index ${minIdx} (${a[minIdx]}).`,
          stats: { ...stats },
          codeLine: 3
        };
      }
    }

    if (minIdx !== i) {
      let temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
      stats.swaps++;
      yield {
        array: [...a],
        compared: [],
        swapped: [i, minIdx],
        active: [],
        sorted: [...sortedIndices],
        desc: `Swapping index ${i} (${a[minIdx]}) with minimum element at index ${minIdx} (${a[i]}).`,
        stats: { ...stats },
        codeLine: 4
      };
    }

    sortedIndices.push(i);
  }
  
  yield {
    array: [...a],
    compared: [],
    swapped: [],
    active: [],
    sorted: Array.from({ length: n }, (_, k) => k),
    desc: "Selection Sort complete! The array is fully sorted.",
    stats: { ...stats },
    codeLine: 5
  };
}

// 3. INSERTION SORT
export function* insertionSort(arr) {
  let a = [...arr];
  let n = a.length;
  let stats = { comparisons: 0, swaps: 0 };
  let sortedIndices = [0];

  for (let i = 1; i < n; i++) {
    let key = a[i];
    let j = i - 1;
    
    yield {
      array: [...a],
      compared: [],
      swapped: [],
      active: [i],
      sorted: [...sortedIndices],
      desc: `Picking key element ${key} at index ${i} to insert into the sorted partition.`,
      stats: { ...stats },
      codeLine: 1
    };

    while (j >= 0) {
      stats.comparisons++;
      yield {
        array: [...a],
        compared: [j, j + 1],
        swapped: [],
        active: [i],
        sorted: [...sortedIndices],
        desc: `Comparing element at index ${j} (${a[j]}) with key ${key}.`,
        stats: { ...stats },
        codeLine: 2
      };

      if (a[j] > key) {
        a[j + 1] = a[j];
        stats.swaps++; // Treat element movement as operations swap
        j--;
        yield {
          array: [...a],
          compared: [],
          swapped: [j + 1, j + 2],
          active: [],
          sorted: [...sortedIndices],
          desc: `Shifting ${a[j + 2]} to index ${j + 2} since it's greater than key ${key}.`,
          stats: { ...stats },
          codeLine: 3
        };
      } else {
        break;
      }
    }
    
    a[j + 1] = key;
    stats.swaps++;
    sortedIndices = Array.from({ length: i + 1 }, (_, k) => k);
    
    yield {
      array: [...a],
      compared: [],
      swapped: [j + 1],
      active: [],
      sorted: [...sortedIndices],
      desc: `Inserted key ${key} into position ${j + 1}.`,
      stats: { ...stats },
      codeLine: 4
    };
  }

  yield {
    array: [...a],
    compared: [],
    swapped: [],
    active: [],
    sorted: Array.from({ length: n }, (_, k) => k),
    desc: "Insertion Sort complete! The array is fully sorted.",
    stats: { ...stats },
    codeLine: 5
  };
}

// 4. MERGE SORT
export function* mergeSort(arr) {
  let a = [...arr];
  let stats = { comparisons: 0, swaps: 0 };
  
  function* mergeSortHelper(left, right) {
    if (left >= right) return;
    let mid = Math.floor((left + right) / 2);
    yield* mergeSortHelper(left, mid);
    yield* mergeSortHelper(mid + 1, right);
    yield* merge(left, mid, right);
  }

  function* merge(left, mid, right) {
    let temp = [];
    let i = left;
    let j = mid + 1;

    yield {
      array: [...a],
      compared: [],
      swapped: [],
      active: [left, right],
      sorted: [],
      desc: `Splitting and preparing to merge subarrays: [${left}...${mid}] and [${mid + 1}...${right}].`,
      stats: { ...stats },
      codeLine: 1
    };

    while (i <= mid && j <= right) {
      stats.comparisons++;
      yield {
        array: [...a],
        compared: [i, j],
        swapped: [],
        active: [],
        sorted: [],
        desc: `Comparing element at index ${i} (${a[i]}) with element at index ${j} (${a[j]}).`,
        stats: { ...stats },
        codeLine: 2
      };

      if (a[i] <= a[j]) {
        temp.push(a[i++]);
      } else {
        temp.push(a[j++]);
      }
    }

    while (i <= mid) {
      temp.push(a[i++]);
    }
    while (j <= right) {
      temp.push(a[j++]);
    }

    for (let k = 0; k < temp.length; k++) {
      a[left + k] = temp[k];
      stats.swaps++; // writes counted as swap operations
      let isFinalMerge = (left === 0 && right === a.length - 1);
      let sortedPart = isFinalMerge ? Array.from({ length: k + 1 }, (_, sIdx) => sIdx) : [];
      
      yield {
        array: [...a],
        compared: [],
        swapped: [left + k],
        active: [],
        sorted: sortedPart,
        desc: `Merging: Copied element ${temp[k]} back to main array at index ${left + k}.`,
        stats: { ...stats },
        codeLine: 3
      };
    }
  }

  yield* mergeSortHelper(0, a.length - 1);
  yield {
    array: [...a],
    compared: [],
    swapped: [],
    active: [],
    sorted: Array.from({ length: a.length }, (_, k) => k),
    desc: "Merge Sort complete! The array is fully merged and sorted.",
    stats: { ...stats },
    codeLine: 4
  };
}

// 5. QUICK SORT
export function* quickSort(arr) {
  let a = [...arr];
  let stats = { comparisons: 0, swaps: 0 };
  let sortedIndices = new Set();

  function* quickSortHelper(left, right) {
    if (left >= right) {
      if (left >= 0 && left < a.length) sortedIndices.add(left);
      return;
    }
    let pivotIdx = yield* partition(left, right);
    sortedIndices.add(pivotIdx);
    yield* quickSortHelper(left, pivotIdx - 1);
    yield* quickSortHelper(pivotIdx + 1, right);
  }

  function* partition(left, right) {
    let pivotValue = a[right];
    let i = left - 1;

    yield {
      array: [...a],
      compared: [],
      swapped: [],
      active: [right],
      sorted: Array.from(sortedIndices),
      desc: `Selected pivot value ${pivotValue} at index ${right}.`,
      stats: { ...stats },
      codeLine: 1
    };

    for (let j = left; j < right; j++) {
      stats.comparisons++;
      yield {
        array: [...a],
        compared: [j, right],
        swapped: [],
        active: [right],
        sorted: Array.from(sortedIndices),
        desc: `Comparing element ${a[j]} (index ${j}) with pivot ${pivotValue}.`,
        stats: { ...stats },
        codeLine: 2
      };

      if (a[j] < pivotValue) {
        i++;
        let temp = a[i];
        a[i] = a[j];
        a[j] = temp;
        stats.swaps++;
        yield {
          array: [...a],
          compared: [],
          swapped: [i, j],
          active: [right],
          sorted: Array.from(sortedIndices),
          desc: `Swapping ${a[i]} (index ${i}) and ${a[j]} (index ${j}) since ${a[j]} < pivot ${pivotValue}.`,
          stats: { ...stats },
          codeLine: 3
        };
      }
    }

    let temp = a[i + 1];
    a[i + 1] = a[right];
    a[right] = temp;
    stats.swaps++;
    yield {
      array: [...a],
      compared: [],
      swapped: [i + 1, right],
      active: [i + 1],
      sorted: Array.from(sortedIndices),
      desc: `Placed pivot ${pivotValue} in its final sorted position at index ${i + 1}.`,
      stats: { ...stats },
      codeLine: 4
    };

    return i + 1;
  }

  yield* quickSortHelper(0, a.length - 1);
  yield {
    array: [...a],
    compared: [],
    swapped: [],
    active: [],
    sorted: Array.from({ length: a.length }, (_, k) => k),
    desc: "Quick Sort complete! The array is fully partitioned and sorted.",
    stats: { ...stats },
    codeLine: 5
  };
}
