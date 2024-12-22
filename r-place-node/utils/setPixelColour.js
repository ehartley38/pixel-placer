import { getRedisClient } from "./initialiseRedis.js";

const canvasWidth = process.env.CANVAS_WIDTH

export const setPixelColour = async (x, y, colour) => {
  if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasWidth) {
    throw new Error("Coords out of bounds");
  }
  if (colour < 0 || colour > 31) {
    throw new Error("Invalid colour");
  }

  const redis = getRedisClient()

  const offset = y * canvasWidth + x;
  await redis.bitfield("canvas_bitmap", "SET", "u8", `#${offset}`, colour);
};
