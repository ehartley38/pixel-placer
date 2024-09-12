import Redis from "ioredis";

const canvasWidth = process.env.CANVAS_WIDTH

export const setPixelColour = async (x, y, colour) => {
  if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasWidth) {
    throw new Error("Coords out of bounds");
  }
  if (colour < 0 || colour > 15) {
    throw new Error("Invalid colour");
  }

  const redis = new Redis({});

  const offset = y * canvasWidth + x;
  await redis.bitfield("canvas_bitmap", "SET", "u4", `#${offset}`, colour);
};
