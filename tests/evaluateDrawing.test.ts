import assert from 'node:assert/strict';
import test from 'node:test';
import { SYNTHETIC_DRAWING_FIXTURES } from '../src/data/drawingFixtures.ts';
import { evaluateDrawing, type InkRaster } from '../src/utils/evaluateDrawing.ts';

function raster(
  width: number,
  height: number,
  lines: readonly (readonly [number, number, number, number])[],
  thickness = 3,
): InkRaster {
  const data = new Uint8Array(width * height).fill(255);
  for (const [x1, y1, x2, y2] of lines) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let step = 0; step <= steps; step++) {
      const x = Math.round(x1 + ((x2 - x1) * step) / steps);
      const y = Math.round(y1 + ((y2 - y1) * step) / steps);
      for (let dy = -Math.floor(thickness / 2); dy <= Math.floor(thickness / 2); dy++) {
        for (let dx = -Math.floor(thickness / 2); dx <= Math.floor(thickness / 2); dx++) {
          if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height) {
            data[(y + dy) * width + x + dx] = 0;
          }
        }
      }
    }
  }
  return { width, height, data };
}

const ka = raster(64, 64, [[20, 12, 20, 50], [20, 12, 43, 12], [20, 30, 40, 30]]);
const kha = raster(
  64,
  64,
  [[18, 12, 42, 12], [18, 12, 18, 50], [18, 50, 42, 50], [42, 12, 42, 50]],
);
const references = { ka: [ka], kha: [kha] };

function syntheticFixture(id: string): InkRaster {
  const fixture = SYNTHETIC_DRAWING_FIXTURES.find((candidate) => candidate.id === id);
  assert.ok(fixture, `Missing synthetic fixture: ${id}`);
  const lines =
    fixture.ink.strokes?.flatMap((stroke) =>
      stroke.slice(1).map((point, index) => [
        stroke[index][0],
        stroke[index][1],
        point[0],
        point[1],
      ] as const),
    ) ?? [];
  return raster(256, 256, lines, 8);
}

test('accepts a target shape independent of canvas position and stroke thickness', () => {
  const shiftedAndThicker = raster(
    96,
    72,
    [[33, 17, 33, 55], [33, 17, 56, 17], [33, 35, 53, 35]],
    7,
  );
  assert.deepEqual(evaluateDrawing(shiftedAndThicker, 'ka', references), { status: 'accepted' });
});

test('rejects a shape that matches a competing consonant instead of the target', () => {
  assert.deepEqual(evaluateDrawing(kha, 'ka', references), {
    status: 'rejected',
    reason: 'no-match',
  });
});

test('reports close target and competitor matches as ambiguous', () => {
  assert.deepEqual(
    evaluateDrawing(ka, 'ka', { ka: [ka], kha: [ka] }),
    { status: 'ambiguous', reason: 'competing-letters', letterIds: ['ka', 'kha'] },
  );
});

test('uses the closest of multiple target references', () => {
  assert.deepEqual(evaluateDrawing(ka, 'ka', { ka: [kha, ka], kha: [kha] }), {
    status: 'accepted',
  });
});

test('distinguishes blank, tiny, and excessive-ink inputs', () => {
  const blank = raster(64, 64, []);
  const tiny = raster(64, 64, [[30, 30, 31, 31]], 1);
  const excessive = { width: 10, height: 10, data: new Uint8Array(100) };

  assert.deepEqual(evaluateDrawing(blank, 'ka', references), {
    status: 'invalid-input',
    reason: 'blank',
  });
  assert.deepEqual(evaluateDrawing(tiny, 'ka', references), {
    status: 'invalid-input',
    reason: 'tiny-mark',
  });
  assert.deepEqual(evaluateDrawing(excessive, 'ka', references), {
    status: 'rejected',
    reason: 'excess-ink',
  });
});

test('handles available labeled synthetic edge-case fixtures', () => {
  assert.deepEqual(evaluateDrawing(syntheticFixture('cal-scribble'), 'ka', references), {
    status: 'rejected',
    reason: 'scribble',
  });
  assert.deepEqual(evaluateDrawing(syntheticFixture('cal-tiny'), 'ka', references), {
    status: 'invalid-input',
    reason: 'tiny-mark',
  });
  assert.deepEqual(evaluateDrawing(syntheticFixture('cal-blank'), 'ka', references), {
    status: 'invalid-input',
    reason: 'blank',
  });
});

test('reports missing and malformed references as evaluation failures', () => {
  assert.deepEqual(evaluateDrawing(ka, 'unknown', references), {
    status: 'evaluation-failure',
    reason: 'missing-target-reference',
  });
  assert.deepEqual(evaluateDrawing(ka, 'ka', { ka: [ka] }), {
    status: 'evaluation-failure',
    reason: 'missing-competing-references',
  });
  assert.deepEqual(
    evaluateDrawing(ka, 'ka', { ka: [ka], kha: [{ width: 2, height: 2, data: new Uint8Array(1) }] }),
    { status: 'evaluation-failure', reason: 'invalid-reference' },
  );
  assert.deepEqual(evaluateDrawing(ka, 'ka', new Proxy({}, { get: () => { throw Error(); } })), {
    status: 'evaluation-failure',
    reason: 'processing-failure',
  });
});

test('validates references before returning safeguard rejections', () => {
  const excessive = { width: 10, height: 10, data: new Uint8Array(100) };
  const malformed = { width: 2, height: 2, data: new Uint8Array(3) };

  assert.deepEqual(evaluateDrawing(excessive, 'unknown', {}), {
    status: 'evaluation-failure',
    reason: 'missing-target-reference',
  });
  assert.deepEqual(evaluateDrawing(excessive, 'ka', { ka: [malformed], kha: [kha] }), {
    status: 'evaluation-failure',
    reason: 'invalid-reference',
  });
  assert.deepEqual(evaluateDrawing(excessive, 'ka', { ka: [ka], kha: [malformed] }), {
    status: 'evaluation-failure',
    reason: 'invalid-reference',
  });
});

test('reports malformed and oversized drawing rasters as invalid input', () => {
  assert.deepEqual(
    evaluateDrawing({ width: 4, height: 4, data: new Uint8Array(15) }, 'ka', references),
    { status: 'invalid-input', reason: 'malformed-raster' },
  );
  assert.deepEqual(
    evaluateDrawing({ width: 2049, height: 1, data: new Uint8Array(2049).fill(255) }, 'ka', references),
    { status: 'invalid-input', reason: 'raster-too-large' },
  );
});
