import { Redis } from 'ioredis';

export const getPixelColour = async (x, y, canvasWidth) => {
  if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasWidth) {
    throw new Error("Coords out of bounds");
  }

  const redis = new Redis({});

  const offset = y * canvasWidth + x;
  const [colour] = await redis.bitfield("canvas_bitmap", "GET", "u4", `#${offset}`);

  await redis.quit();

  return colour;
};