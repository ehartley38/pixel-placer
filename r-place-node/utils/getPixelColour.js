import { Redis } from 'ioredis';
// import 'dotenv/config'

const canvasWidth = process.env.CANVAS_WIDTH

export const getPixelColour = async (x, y) => {
  console.log(canvasWidth);
  
  if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasWidth) {
    throw new Error("Coords out of bounds");
  }

  const redis = new Redis({});

  const offset = y * canvasWidth + x;
  const [colour] = await redis.bitfield("canvas_bitmap", "GET", "u8", `#${offset}`);

  await redis.quit();

  return colour;
};