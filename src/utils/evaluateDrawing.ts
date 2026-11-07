export interface InkRaster {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
}

export type DrawingEvaluation =
  | { status: 'accepted' }
  | { status: 'rejected'; reason: 'no-match' | 'excess-ink' | 'scribble' }
  | { status: 'ambiguous'; reason: 'competing-letters'; letterIds: string[] }
  | {
      status: 'invalid-input';
      reason: 'blank' | 'tiny-mark' | 'malformed-raster' | 'raster-too-large';
    }
  | {
      status: 'evaluation-failure';
      reason:
        | 'missing-target-reference'
        | 'missing-competing-references'
        | 'invalid-reference'
        | 'processing-failure';
    };

export type DrawingReferences = Readonly<Record<string, readonly InkRaster[]>>;

const RESOLUTION = 48;
const CONTENT_SIZE = 40;
const INK_THRESHOLD = 127;
const MAX_RASTER_AREA = 1_000_000;
const MAX_RASTER_DIMENSION = 2048;
const MIN_INK_PIXELS = 8;
const MIN_INK_BOUNDS = 3;
const MIN_INK_EXTENT_RATIO = 0.04;
const MAX_CANVAS_COVERAGE = 0.45;
const MAX_MATCH_DISTANCE = 0.12;
const AMBIGUITY_MARGIN = 0.02;

interface NormalizedInk {
  pixels: Uint8Array;
  count: number;
}

function isRaster(value: unknown): value is InkRaster {
  if (!value || typeof value !== 'object') return false;
  const raster = value as InkRaster;
  return (
    Number.isInteger(raster.width) &&
    Number.isInteger(raster.height) &&
    raster.width > 0 &&
    raster.height > 0 &&
    (raster.data instanceof Uint8Array || raster.data instanceof Uint8ClampedArray) &&
    raster.data.length === raster.width * raster.height
  );
}

function normalize(raster: InkRaster): NormalizedInk | DrawingEvaluation {
  if (!isRaster(raster)) return { status: 'invalid-input', reason: 'malformed-raster' };
  if (
    raster.width > MAX_RASTER_DIMENSION ||
    raster.height > MAX_RASTER_DIMENSION ||
    raster.width * raster.height > MAX_RASTER_AREA
  ) {
    return { status: 'invalid-input', reason: 'raster-too-large' };
  }

  let left = raster.width;
  let top = raster.height;
  let right = -1;
  let bottom = -1;
  let inkCount = 0;
  for (let y = 0; y < raster.height; y++) {
    for (let x = 0; x < raster.width; x++) {
      if (raster.data[y * raster.width + x] <= INK_THRESHOLD) {
        inkCount++;
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (inkCount === 0) return { status: 'invalid-input', reason: 'blank' };
  if (inkCount < MIN_INK_PIXELS) return { status: 'invalid-input', reason: 'tiny-mark' };
  if (inkCount / raster.data.length > MAX_CANVAS_COVERAGE) {
    return { status: 'rejected', reason: 'excess-ink' };
  }

  const boundsWidth = right - left + 1;
  const boundsHeight = bottom - top + 1;
  if (boundsWidth < MIN_INK_BOUNDS || boundsHeight < MIN_INK_BOUNDS) {
    return { status: 'invalid-input', reason: 'tiny-mark' };
  }
  if (
    Math.min(boundsWidth / raster.width, boundsHeight / raster.height) < MIN_INK_EXTENT_RATIO
  ) {
    return { status: 'invalid-input', reason: 'tiny-mark' };
  }

  const scale = Math.min(CONTENT_SIZE / boundsWidth, CONTENT_SIZE / boundsHeight);
  const scaledWidth = Math.max(1, Math.round(boundsWidth * scale));
  const scaledHeight = Math.max(1, Math.round(boundsHeight * scale));
  const offsetX = Math.floor((RESOLUTION - scaledWidth) / 2);
  const offsetY = Math.floor((RESOLUTION - scaledHeight) / 2);
  const cropped = new Uint8Array(RESOLUTION * RESOLUTION);

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      if (raster.data[y * raster.width + x] > INK_THRESHOLD) continue;
      const targetX = offsetX + Math.min(scaledWidth - 1, Math.floor((x - left) * scale));
      const targetY = offsetY + Math.min(scaledHeight - 1, Math.floor((y - top) * scale));
      cropped[targetY * RESOLUTION + targetX] = 1;
    }
  }

  const skeleton = thin(cropped);
  const branchPoints = countBranchPoints(skeleton);
  if (branchPoints > 12 && countInk(skeleton) > 100) {
    return { status: 'rejected', reason: 'scribble' };
  }

  const pixels = thicken(skeleton);
  const count = countInk(pixels);
  if (count === 0) {
    return { status: 'evaluation-failure', reason: 'processing-failure' };
  }
  return { pixels, count };
}

function thin(source: Uint8Array): Uint8Array {
  const pixels = source.slice();
  let changed = true;
  let iterations = 0;

  while (changed && iterations++ < RESOLUTION) {
    changed = false;
    for (let phase = 0; phase < 2; phase++) {
      const remove: number[] = [];
      for (let y = 1; y < RESOLUTION - 1; y++) {
        for (let x = 1; x < RESOLUTION - 1; x++) {
          const index = y * RESOLUTION + x;
          if (!pixels[index]) continue;
          const neighbors = [
            pixels[index - RESOLUTION],
            pixels[index - RESOLUTION + 1],
            pixels[index + 1],
            pixels[index + RESOLUTION + 1],
            pixels[index + RESOLUTION],
            pixels[index + RESOLUTION - 1],
            pixels[index - 1],
            pixels[index - RESOLUTION - 1],
          ];
          const neighborCount = neighbors.reduce((sum, value) => sum + value, 0);
          if (neighborCount < 2 || neighborCount > 6) continue;
          let transitions = 0;
          for (let i = 0; i < neighbors.length; i++) {
            if (!neighbors[i] && neighbors[(i + 1) % neighbors.length]) transitions++;
          }
          if (transitions !== 1) continue;
          const [north, , east, , south, , west] = neighbors;
          if (
            phase === 0
              ? north * east * south !== 0 || east * south * west !== 0
              : north * east * west !== 0 || north * south * west !== 0
          ) {
            continue;
          }
          remove.push(index);
        }
      }
      for (const index of remove) pixels[index] = 0;
      if (remove.length > 0) changed = true;
    }
  }
  return pixels;
}

function countBranchPoints(pixels: Uint8Array): number {
  let count = 0;
  for (let y = 1; y < RESOLUTION - 1; y++) {
    for (let x = 1; x < RESOLUTION - 1; x++) {
      const index = y * RESOLUTION + x;
      if (!pixels[index]) continue;
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if ((dx !== 0 || dy !== 0) && pixels[index + dy * RESOLUTION + dx]) neighbors++;
        }
      }
      if (neighbors >= 4) count++;
    }
  }
  return count;
}

function thicken(skeleton: Uint8Array): Uint8Array {
  const pixels = new Uint8Array(skeleton.length);
  for (let y = 1; y < RESOLUTION - 1; y++) {
    for (let x = 1; x < RESOLUTION - 1; x++) {
      if (!skeleton[y * RESOLUTION + x]) continue;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          pixels[(y + dy) * RESOLUTION + x + dx] = 1;
        }
      }
    }
  }
  return pixels;
}

function countInk(pixels: Uint8Array): number {
  let count = 0;
  for (const pixel of pixels) count += pixel;
  return count;
}

function distanceTransform(ink: Uint8Array): Float32Array {
  const diagonal = Math.SQRT2;
  const distances = new Float32Array(ink.length);
  distances.fill(Number.POSITIVE_INFINITY);
  for (let i = 0; i < ink.length; i++) if (ink[i]) distances[i] = 0;

  for (let y = 0; y < RESOLUTION; y++) {
    for (let x = 0; x < RESOLUTION; x++) {
      const index = y * RESOLUTION + x;
      if (x > 0) distances[index] = Math.min(distances[index], distances[index - 1] + 1);
      if (y > 0) distances[index] = Math.min(distances[index], distances[index - RESOLUTION] + 1);
      if (x > 0 && y > 0) {
        distances[index] = Math.min(distances[index], distances[index - RESOLUTION - 1] + diagonal);
      }
      if (x < RESOLUTION - 1 && y > 0) {
        distances[index] = Math.min(distances[index], distances[index - RESOLUTION + 1] + diagonal);
      }
    }
  }
  for (let y = RESOLUTION - 1; y >= 0; y--) {
    for (let x = RESOLUTION - 1; x >= 0; x--) {
      const index = y * RESOLUTION + x;
      if (x < RESOLUTION - 1) distances[index] = Math.min(distances[index], distances[index + 1] + 1);
      if (y < RESOLUTION - 1) distances[index] = Math.min(distances[index], distances[index + RESOLUTION] + 1);
      if (x < RESOLUTION - 1 && y < RESOLUTION - 1) {
        distances[index] = Math.min(distances[index], distances[index + RESOLUTION + 1] + diagonal);
      }
      if (x > 0 && y < RESOLUTION - 1) {
        distances[index] = Math.min(distances[index], distances[index + RESOLUTION - 1] + diagonal);
      }
    }
  }
  return distances;
}

function symmetricDistance(left: NormalizedInk, right: NormalizedInk): number {
  const leftToRight = distanceTransform(right.pixels);
  const rightToLeft = distanceTransform(left.pixels);
  let leftDistance = 0;
  let rightDistance = 0;
  for (let i = 0; i < left.pixels.length; i++) {
    if (left.pixels[i]) leftDistance += leftToRight[i];
    if (right.pixels[i]) rightDistance += rightToLeft[i];
  }
  return ((leftDistance / left.count + rightDistance / right.count) / 2) / RESOLUTION;
}

function scoreReferences(
  input: NormalizedInk,
  references: readonly InkRaster[],
): number | DrawingEvaluation {
  let bestScore = Number.POSITIVE_INFINITY;
  for (const reference of references) {
    const normalized = normalize(reference);
    if (!('pixels' in normalized)) {
      return { status: 'evaluation-failure', reason: 'invalid-reference' };
    }
    bestScore = Math.min(bestScore, symmetricDistance(input, normalized));
  }
  return bestScore;
}

/**
 * Compare one grayscale ink raster to the target and supplied competing references.
 * Pixel values at or below 127 are ink; callers should supply opaque, single-channel
 * luminance data with black ink on a white background.
 */
export function evaluateDrawing(
  drawing: InkRaster,
  targetLetterId: string,
  references: DrawingReferences,
): DrawingEvaluation {
  try {
    const normalizedDrawing = normalize(drawing);
    if (!('pixels' in normalizedDrawing)) return normalizedDrawing;

    const targetReferences = references[targetLetterId];
    if (!Array.isArray(targetReferences)) {
      return { status: 'evaluation-failure', reason: 'missing-target-reference' };
    }
    if (targetReferences.length === 0) {
      return { status: 'evaluation-failure', reason: 'missing-target-reference' };
    }
    const competingIds = Object.keys(references).filter(
      (letterId) =>
        letterId !== targetLetterId &&
        Array.isArray(references[letterId]) &&
        references[letterId].length > 0,
    );
    if (competingIds.length === 0) {
      return { status: 'evaluation-failure', reason: 'missing-competing-references' };
    }

    const targetScore = scoreReferences(normalizedDrawing, targetReferences);
    if (typeof targetScore !== 'number') return targetScore;
    const competingScores: Array<{ letterId: string; score: number }> = [];
    for (const letterId of competingIds) {
      const score = scoreReferences(normalizedDrawing, references[letterId]);
      if (typeof score !== 'number') return score;
      competingScores.push({ letterId, score });
    }
    if (targetScore > MAX_MATCH_DISTANCE) return { status: 'rejected', reason: 'no-match' };

    const closestCompetitor = competingScores.reduce((closest, candidate) =>
      candidate.score < closest.score ? candidate : closest,
    );
    const separation = closestCompetitor.score - targetScore;
    if (separation < -AMBIGUITY_MARGIN) {
      return { status: 'rejected', reason: 'no-match' };
    }
    if (separation < AMBIGUITY_MARGIN) {
      return {
        status: 'ambiguous',
        reason: 'competing-letters',
        letterIds: [targetLetterId, closestCompetitor.letterId],
      };
    }
    return { status: 'accepted' };
  } catch {
    return { status: 'evaluation-failure', reason: 'processing-failure' };
  }
}
