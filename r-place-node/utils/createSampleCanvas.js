import Redis from "ioredis";

const CANVAS_WIDTH = 100;
const redis = new Redis({});

const createCanvas = async () => {
  let cnt = 0;

  for (let x = 0; x < CANVAS_WIDTH; x++) {
    for (let y = 0; y < CANVAS_WIDTH; y++) {
      const randomColour = Math.floor(Math.random() * 15)

      await setPixelColour(x, y, randomColour);
    }
  }

  console.log("Complete");
};

const setPixelColour = async (x, y, colour) => {
  const offset = (y * CANVAS_WIDTH + x);
  await redis.bitfield("canvas_bitmap", "SET", "u4", `#${offset}`, colour)
};

try {
  await createCanvas();
} catch (err) {
  console.log(err);
}
