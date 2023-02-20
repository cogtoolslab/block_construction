global.config = require("../blockConfig")
const Block = require("../src/js/block")
const  BlockKind = require("../src/js/blockKind")


test('Block collision', () => {
  const blockkind = new BlockKind(10, 20, "red");
  const discreteWorld = new Array(20);
  for (let i = 0; i < discreteWorld.length; i++) {
    discreteWorld[i] = new Array(20).fill(true); // true represents free
  }
  const b = blockkind.createSnappedBlock(
    0,
    0,
    discreteWorld,
    false
  );
  b.x = 0;
  b.y = 0;
  b.w = 10;
  b.h = 20;
  expect(b.collided(0, 0)).toBe(true);
  expect(b.collided(5, 10)).toBe(true);
  expect(b.collided(-5, -10)).toBe(true);
  expect(b.collided(-5.1, -10.1)).toBe(false);
  expect(b.collided(5.1, 10.1)).toBe(false);
  expect(b.collided(5.1, 0)).toBe(false);
});