import Redis from "ioredis";

const canvasWidth = process.env.CANVAS_WIDTH
const redis = new Redis({});

export const getCanvasState = async () => {
    try {
      const bitWidth = 4;
      const totalBits = canvasWidth * canvasWidth * bitWidth;
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
      const canvasBitmap = new Uint8Array(responseData.length * 4);
  
      // Bitmask to convert 32 bit value to 4 x 8 bit values
      for (let i = 0; i < responseData.length; i++) {
        const value32bit = responseData[i];
        canvasBitmap[i * 4 + 3] = value32bit & 0xff;
        canvasBitmap[i * 4 + 2] = (value32bit >> 8) & 0xff;
        canvasBitmap[i * 4 + 1] = (value32bit >> 16) & 0xff;
        canvasBitmap[i * 4] = (value32bit >> 24) & 0xff;
      }
  
     
      return canvasBitmap;
    } catch (err) {
      console.log(err);
    }
  };