import Redis from "ioredis";

const canvasWidth = process.env.CANVAS_WIDTH || 1000;

const redis = new Redis({});

const createCanvas = async () => {
  console.log("Creating sample canvas of width", canvasWidth);

  let cnt = 0;

  for (let x = 0; x < canvasWidth; x++) {
    for (let y = 0; y < canvasWidth; y++) {
      // const randomColour = Math.floor(Math.random() * 31);
      const randomColour = 0

      await setPixelColour(x, y, randomColour);
    }
    if (x % 100 == 0) console.log(x);
  }

  console.log("Complete");
};

const setPixelColour = async (x, y, colour) => {
  const offset = y * canvasWidth + x;
  await redis.bitfield("canvas_bitmap", "SET", "u8", `#${offset}`, colour);
};

try {
  await createCanvas();
} catch (err) {
  console.log(err);
}
