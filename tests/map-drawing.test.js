const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const { translateDrawing, rotatePoint, boundsCentroid, isPointInPolygon, shouldIgnoreMapDeleteTarget, fogDrawingsCoverPoint } = require('../public/map-drawing');
const source = fs.readFileSync('public/map-drawing.js', 'utf8');

test('moving a drawing translates every point without changing its shape', () => {
  const original = {
    id: 'shape',
    start: { x: .2, y: .3 },
    end: { x: .4, y: .5 },
    widthPoint: { x: .45, y: .35 },
    points: [{ x: .2, y: .3 }, { x: .3, y: .4 }]
  };
  const moved = translateDrawing(original, .1, -.1);
  assert.deepEqual(moved.start, { x: .3, y: .2 });
  assert.deepEqual(moved.end, { x: .5, y: .4 });
  assert.deepEqual(moved.widthPoint, { x: .55, y: .25 });
  assert.deepEqual(moved.points, [{ x: .3, y: .2 }, { x: .4, y: .3 }]);
  assert.deepEqual(original.start, { x: .2, y: .3 });
});

test('lasso polygon hit testing accepts enclosed object points', () => {
  const lasso = [{ x: 10, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 90 }, { x: 10, y: 90 }];
  assert.equal(isPointInPolygon({ x: 50, y: 50 }, lasso), true);
  assert.equal(isPointInPolygon({ x: 100, y: 50 }, lasso), false);
});

test('rotation keeps the initial point fixed', () => {
  const pivot = { x: 10, y: 20 };
  const rotated = rotatePoint({ x: 30, y: 20 }, pivot, 90);
  assert.ok(Math.abs(rotated.x - 10) < .000001);
  assert.ok(Math.abs(rotated.y - 40) < .000001);
  assert.deepEqual(rotatePoint(pivot, pivot, 237), pivot);
});

test('a composite selection rotates its members around the shared bounds centroid', () => {
  const centroid = boundsCentroid([{ x: 0, y: 0 }, { x: 100, y: 40 }]);
  assert.deepEqual(centroid, { x: 50, y: 20 });
  const left = rotatePoint({ x: 10, y: 20 }, centroid, 90);
  const right = rotatePoint({ x: 90, y: 20 }, centroid, 90);
  assert.ok(Math.abs(left.x - 50) < .000001 && Math.abs(left.y + 20) < .000001);
  assert.ok(Math.abs(right.x - 50) < .000001 && Math.abs(right.y - 60) < .000001);
  assert.ok(Math.abs(Math.hypot(right.x - left.x, right.y - left.y) - 80) < .000001);
});

test('a composite translation preserves offsets between drawings, measurements, and tokens', () => {
  const drawing = translateDrawing({ start: { x: .1, y: .2 }, end: { x: .3, y: .4 } }, .15, -.05);
  const measurement = translateDrawing({ kind: 'measurement', start: { x: .4, y: .5 }, end: { x: .6, y: .5 } }, .15, -.05);
  const token = { x: .8 + .15, y: .7 - .05 };
  assert.deepEqual(drawing.start, { x: .25, y: .15 });
  assert.deepEqual(measurement.start, { x: .55, y: .45 });
  assert.ok(Math.abs((measurement.start.x - drawing.start.x) - .3) < .000001);
  assert.ok(Math.abs((token.x - measurement.start.x) - .4) < .000001);
  assert.ok(Math.abs((token.y - measurement.start.y) - .2) < .000001);
});

test('map delete shortcuts work after using the color control but preserve text editing', () => {
  assert.equal(shouldIgnoreMapDeleteTarget({ tagName: 'INPUT', type: 'color' }), false);
  assert.equal(shouldIgnoreMapDeleteTarget({ tagName: 'INPUT', type: 'number' }), true);
  assert.equal(shouldIgnoreMapDeleteTarget({ tagName: 'TEXTAREA' }), true);
  assert.equal(shouldIgnoreMapDeleteTarget({ tagName: 'DIV', isContentEditable: true }), true);
  assert.equal(shouldIgnoreMapDeleteTarget({ tagName: 'BODY' }), false);
});

test('fog shapes block concealed tokens for players but remain click-through for the DM', () => {
  assert.match(source, /shape\.style\.pointerEvents = "none";/);
  assert.match(source, /if \(!isFogLayer\) shape\.dataset\.drawingId = drawing\.id;/);
  const dm = fs.readFileSync('public/dm.html', 'utf8');
  const player = fs.readFileSync('public/player.html', 'utf8');
  assert.match(dm, /fogAppearance: 'dm',[\s\S]{0,100}blockTokenInteraction: false/);
  assert.match(player, /fogAppearance: 'player',[\s\S]{0,100}blockTokenInteraction: true/);
});

test('lasso-erased fog is both visually and interactively open', () => {
  const fog = [
    { type: 'rectangle', start: { x: .1, y: .1 }, end: { x: .9, y: .9 } },
    { type: 'lasso-erase', points: [{ x: .4, y: .4 }, { x: .6, y: .4 }, { x: .6, y: .6 }, { x: .4, y: .6 }] }
  ];
  assert.equal(fogDrawingsCoverPoint(fog, { x: .2, y: .2 }, 1000, 1000), true);
  assert.equal(fogDrawingsCoverPoint(fog, { x: .5, y: .5 }, 1000, 1000), false);
});

test('active drawing and measurement surfaces capture starts above tokens', () => {
  assert.match(source, /previewLayer\.style\.zIndex = isFogLayer \? "21" : \(isMeasurementLayer \? "10" : "9"\)/);
  assert.match(source, /if \(tool === "pan"\) \{\s*previewLayer\.style\.pointerEvents = "none"/);
  assert.match(source, /else \{\s*previewLayer\.style\.pointerEvents = "auto"/);
});
