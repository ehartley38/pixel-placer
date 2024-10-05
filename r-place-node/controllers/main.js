import { Router } from "express";
import "dotenv/config";
import Redis from "ioredis";
import { setPixelColour } from "../utils/setPixelColour.js";
import { getPixelColour } from "../utils/getPixelColour.js";
import { getCanvasState } from "../utils/getCanvasState.js";
import { supabaseMiddleware } from "../middleware/supabaseMiddleware.js";
import { supabase } from "../utils/supabaseClient.js";
import Queue from "queue";

const canvasWidth = process.env.CANVAS_WIDTH;
const METADATA_BATCH_SIZE = 500;
const METADATA_BATCH_INTERVAL = 5000;

const mainRouter = Router();
const redis = new Redis({});

const pixelQueue = new Queue({ autostart: true, concurrency: 1 });
let queuedPixels = [];

mainRouter.get("/get-canvas", async (req, res) => {
  const canvasState = await getCanvasState();

  const buffer = Buffer.from(canvasState);
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", buffer.length);

  return res.status(201).send(buffer);
});

// Get pixel metadata
mainRouter.get(
  "/get-pixel/:xCoord/:yCoord",
  supabaseMiddleware,
  async (req, res) => {
    const x = parseInt(req.params.xCoord);
    const y = parseInt(req.params.yCoord);

    try {
      // const colour = await getPixelColour(x, y);
      console.log("Getting pixel metadata");

      const { data, error } = await supabase
        .from("canvas_metadata")
        .select(`*, createdBy(username)`)
        .eq("xPos", x)
        .eq("yPos", y);

      if (!error) {
        return res.status(200).json({ data: data });
      } else {
        return res.status(400).json({ err: error });
      }
    } catch (err) {
      console.log(err);
    }
  }
);

mainRouter.post(
  "/set-pixel/:xCoord/:yCoord/:colour",
  supabaseMiddleware,
  async (req, res) => {
    const x = parseInt(req.params.xCoord);
    const y = parseInt(req.params.yCoord);
    const colour = req.params.colour;
    const user = req.user;

    try {
      await setPixelColour(x, y, colour);

      const { error } = await supabase.from("canvas_metadata").upsert({
        xPos: x,
        yPos: y,
        colour: colour,
        createdBy: user.sub,
        createdDate: formatDate(Date.now()),
      });

      if (error) {
        console.log(error);
      }
    } catch (err) {
      console.log(err);
    }

    return res.status(200).json({ msg: "Pixel set" });
  }
);

const processQueuedPixels = async () => {
  if (queuedPixels.length === 0) return;

  const batchToProcess = [...queuedPixels];
  queuedPixels = [];

  try {
    const metadataBatch = batchToProcess.map((pixel) => ({
      xPos: pixel.x,
      yPos: pixel.y,
      colour: pixel.colourIndex,
      createdBy: pixel.userName,
      createdDate: formatDate(Date.now()),
    }));

    console.log("Updating pixels batch");

    const { data, error } = await supabase
      .from("canvas_metadata")
      .upsert(metadataBatch)
      .select();

    if (error) {
      console.error("Error upserting metadata batch:", error);
    }
  } catch (err) {
    console.error("Error processing pixel batch:", err);
  }
};

setInterval(() => {
  pixelQueue.push(processQueuedPixels);
}, METADATA_BATCH_INTERVAL);

mainRouter.post("/set-pixels-batch", supabaseMiddleware, async (req, res) => {
  const { pixels } = req.body;

  const user = req.user;

  if (!Array.isArray(pixels) || pixels.length === 0) {
    return res.status(400).json({ error: "Invalid pixel batch data" });
  }

  try {
    // Process the pixel update first of all
    await Promise.all(
      pixels.map((pixel) => setPixelColour(pixel.x, pixel.y, pixel.colourIndex))
    );

    // Then process the metadata changes
    pixels.forEach((pixel) => {
      queuedPixels.push({ ...pixel, userName: user.sub });

      if (queuedPixels.length >= METADATA_BATCH_SIZE) {
        pixelQueue.push(processQueuedPixels);
      }
    });

    return res.status(200).json({ msg: "Pixel batch queued for processing" });
  } catch (err) {
    console.error("Error processing pixel batch:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const formatDate = (timestamp) => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default mainRouter;
