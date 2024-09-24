import { Router } from "express";
import "dotenv/config";
import Redis from "ioredis";
import { setPixelColour } from "../utils/setPixelColour.js";
import { getPixelColour } from "../utils/getPixelColour.js";
import { getCanvasState } from "../utils/getCanvasState.js";
import { supabaseMiddleware } from "../middleware/supabaseMiddleware.js";

const canvasWidth = process.env.CANVAS_WIDTH;

const mainRouter = Router();
const redis = new Redis({});

mainRouter.get("/get-canvas", async (req, res) => {
  const canvasState = await getCanvasState();

  const buffer = Buffer.from(canvasState);
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", buffer.length);

  return res.status(201).send(buffer);
});

mainRouter.get("/get-pixel/:xCoord/:yCoord", async (req, res) => {
  const x = parseInt(req.params.xCoord);
  const y = parseInt(req.params.yCoord);

  try {
    const colour = await getPixelColour(x, y);

    return res.status(200).json({ msg: colour });
  } catch (err) {
    console.log(err);
  }
});

mainRouter.post(
  "/set-pixel/:xCoord/:yCoord/:colour",
  supabaseMiddleware,
  async (req, res) => {
    const x = parseInt(req.params.xCoord);
    const y = parseInt(req.params.yCoord);
    const colour = req.params.colour;

    try {
      await setPixelColour(x, y, colour);
    } catch (err) {
      console.log(err);
    }

    return res.status(200).json({ msg: "Pixel set" });
  }
);

export default mainRouter;
