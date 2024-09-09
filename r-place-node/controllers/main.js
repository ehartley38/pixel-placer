import { Router } from "express";
// import Redis from "redis";
import Redis from "ioredis";
import { setPixelColour } from "../utils/setPixelColour.js";

const mainRouter = Router();
const redis = new Redis({});

const redisTestFunction = async () => {
  try {
    const bitWidth = 4;
    const totalBits = 100 * 100 * bitWidth;
    const maxBitsPerFetch = 32;
    const totalFetches = Math.ceil(totalBits / maxBitsPerFetch);

    const values = [];
    const pipeline = redis.pipeline();

    for (let i = 0; i < totalFetches; i++) {
      const offset = i * maxBitsPerFetch;
      const size = Math.min(maxBitsPerFetch, totalBits - offset);

      pipeline.bitfield("canvas_bitmap", "GET", `u${size}`, offset);
    }

    const pipelineResults = await pipeline.exec();

    for (const result of pipelineResults) {
      if (!result[0]) {
        values.push(result[1][0]);
      }
    }

    const responseData = new Uint32Array(values);
    const canvasBitmap = new Uint8Array(responseData.buffer);

    // for (let i=0; i< canvasBitmap.byteLength; i++) {
    //   canvas.push(canvasBitmap[i] >> 4)
    //   canvas.push(canvasBitmap[i] & 15)
    // }
    // values.forEach((number, index) => {
    //   for (let i=0; i<8; i++) {
    //     const fourBitSegment = (number >> (4 * (7 - i))) & 0b1111;
    //     canvasBitmap[index * 8 + i] = fourBitSegment
    //   }
    // })

    // result.forEach((number, index) => {
    //   for (let i=0; i< 8; i++) {
    //     // Bitshift
    //     const fourBitSegment = (number >> (4 * (7 - i)))
    //   }
    // });
    // console.log(responseData);

    // console.log(canvasBitmap);
    // console.log(canvas);

    // Need length to be 5000
    console.log(canvasBitmap[0].toString(2));
    // console.log(responseData.length);

    console.log("Canvas fetched");

    // for (let offset = 0; offset < totalBits; offset += bitWidth) {
    //   const [value] = await redis.bitfield(
    //     "canvas_bitmap",
    //     "GET",
    //     `u${bitWidth}`
    //   );
    //   values.push(value);
    // }

    // const canvas = await redis.bitfield("canvas_bitmap", 400)
    // const [value] = await redis.bitfield(
    //   "canvas_bitmap",
    //   "GET",
    //   `u${bitWidth}`,
    //   408
    // );
    return values;
  } catch (err) {
    console.log(err);
  }
};

mainRouter.get("/test", async (req, res) => {
  const msg = await redisTestFunction();

  return res.status(201).json({ msg: msg });
});

mainRouter.post("/set-pixel/:xCoord/:yCoord/:colour", async (req, res) => {
  const x = req.params.xCoord;
  const y = req.params.yCoord;
  const colour = req.params.colour;

  try {
    await setPixelColour(x, y, colour, 100);
  } catch (err) {
    console.log(err);
    
  }

  return res.status(200).json({msg: "Pixel set"})
});

export default mainRouter;
