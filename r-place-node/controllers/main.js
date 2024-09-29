import { Router } from "express";
import "dotenv/config";
import Redis from "ioredis";
import { setPixelColour } from "../utils/setPixelColour.js";
import { getPixelColour } from "../utils/getPixelColour.js";
import { getCanvasState } from "../utils/getCanvasState.js";
import { supabaseMiddleware } from "../middleware/supabaseMiddleware.js";
import { supabase } from "../utils/supabaseClient.js";

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

// Get pixel metadata
mainRouter.get(
  "/get-pixel/:xCoord/:yCoord",
  supabaseMiddleware,
  async (req, res) => {

    const x = parseInt(req.params.xCoord);
    const y = parseInt(req.params.yCoord);

    try {
      // const colour = await getPixelColour(x, y);

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
