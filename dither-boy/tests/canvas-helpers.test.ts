import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeDrawRect } from '../src/lib/canvas-helpers.js';

describe('computeDrawRect', () => {
  it('fits a wide image into a shorter canvas while preserving aspect ratio', () => {
    const rect = computeDrawRect({ width: 1600, height: 800 }, { width: 800, height: 600 });
    assert.deepEqual(rect, { x: 0, y: 100, width: 800, height: 400 });
  });

  it('fits a tall image into a wider canvas while preserving aspect ratio', () => {
    const rect = computeDrawRect({ width: 800, height: 1600 }, { width: 800, height: 600 });
    assert.deepEqual(rect, { x: 250, y: 0, width: 300, height: 600 });
  });

  it('centers the image when scaling evenly', () => {
    const rect = computeDrawRect({ width: 1000, height: 500 }, { width: 2000, height: 1000 });
    assert.deepEqual(rect, { x: 0, y: 0, width: 2000, height: 1000 });
  });
});
