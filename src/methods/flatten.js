import { Segment } from "../models/segment";
import { Interval } from "../models/interval";

/**
 * The algorithm first calculates real start and end times of each segment,
 * sorts them by priority, then start time.
 *
 * Finally it merges the segments by index so there are no overlapping
 * segments and those with highest index are on top.
 *
 * @export
 * @param {Segment[]} segments
 * @returns {Interval[]}
 */
export function flattenSegments(segments) {
  var normalized = normalizeIndex(segments);
  var intervals = mapToIntervals(normalized);
  var sorted = sort(intervals);
  var grouped = groupBy(sorted, "index");

  return weightedMerge(grouped);
}

function normalizeIndex(segments) {
  let index = 0;
  segments.sort((a, b) => cmp(a.index, b.index)).forEach(el => {
    if (el.index > index) {
      el.index = ++index;
    }
    else {
      el.index = index;
    }
  });
  return segments;
}

function mapToIntervals(segments) {
  return segments
    .map(s => {
      return {
        id: s.id,
        start: s.start + s.offsetStart,
        end: s.start + s.duration - s.offsetEnd,
        index: s.index,
        originalStart: s.start,
        data: s.data
      };
    });
}

function sort(intervals) {
  intervals.sort((a, b) => {
    return cmp(a.index, b.index) || cmp(a.start, b.start);
  });
  return intervals;
}

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

/**
 * 
 * @param {Map<number, Interval[]} grouped 
 */
function weightedMerge(grouped) {
  var flattened;
  for (var index of Object.keys(grouped)) {
    merge(grouped[index]);
    if (flattened == null) {
      flattened = grouped[index];
    }
    else {
      flattened = combine(grouped[index], flattened);
    }
  }
  return flattened;
}

/**
 * Merges a set of intervals with the same index that are 
 * completely overlapped by another
 * 
 * @param {Interval[]} intervals 
 * @returns {Interval[]}
 */
function merge(intervals) {
  if (intervals == null || intervals.length <= 1) return intervals;

  var result = [];
  var prev = intervals[0];
  for (var i = 1; i < intervals.length; i++) {
    var curr = intervals[i];

    if (prev.end >= curr.end) {
      // merged case
      var merged = Object.assign({}, prev, { end: Math.max(prev.end, curr.end)});
      prev = merged;
    } else {
      result.push(prev);
      prev = curr;
    }
  }

  result.push(prev);
  return result;
}

/**
 *
 *
 * @param {Interval[]} highIndexes
 * @param {Interval[]} lowIndexes
 */
function combine(highIndexes, lowIndexes) {
  var highCount = 0;
  var lowCount = 0;
  var merged = [];

  while (highCount < highIndexes.length || lowCount < lowIndexes.length) {
    // Only low priority left so push it on the stack
    if (highCount === highIndexes.length) {
      merged.push(Object.assign({}, lowIndexes[lowCount]));
      lowCount++;
      // Only high priority left so push it on the stack
    } else if (lowCount === lowIndexes.length) {
      merged.push(Object.assign(highIndexes[highCount]));
      highCount++;
      // if high priority starts first
    } else if (highIndexes[highCount].start <= lowIndexes[lowCount].start) {
      lowIndexes[lowCount].start = Math.max(lowIndexes[lowCount].start, highIndexes[highCount].end);
      if (lowIndexes[lowCount].start >= lowIndexes[lowCount].end) {
        lowCount++;
      }
      merged.push(Object.assign({}, highIndexes[highCount]));
      highCount++;
    } else if (highIndexes[highCount].start >= lowIndexes[lowCount].start) {
      // end point of weak interval before the start of the strong
      if (lowIndexes[lowCount].end <= highIndexes[highCount].start) {
        merged.push(Object.assign({}, lowIndexes[lowCount]));
        lowCount++;
      } else if (highIndexes[highCount].start <= lowIndexes[lowCount].end && lowIndexes[lowCount].end <= highIndexes[highCount].end) {
        lowIndexes[lowCount].end = highIndexes[highCount].start;
        merged.push(Object.assign({}, lowIndexes[lowCount]));
        lowCount++;
      } else if (lowIndexes[lowCount].end >= highIndexes[highCount].end) {
        merged.push(
          Object.assign({}, lowIndexes[lowCount], {
            end: highIndexes[highCount].start
          })
        );
        lowIndexes[lowCount].start = highIndexes[highCount].end;
      }
    }
  }

  return merged;
}

/**
 *
 * @param {number} a
 * @param {number} b
 */
const cmp = (a, b) => {
  if (a > b) return +1;
  if (a < b) return -1;
  return 0;
};