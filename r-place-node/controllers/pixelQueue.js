import { Router } from "express";
import { supabaseMiddleware } from "../middleware/supabaseMiddleware";
import { setPixelColour } from "../utils/setPixelColour";

const pixelQueueRouter = Router();

pixelQueueRouter;

pixelQueueRouter.post(
  "/set-pixels-batch",
  supabaseMiddleware,
  async (req, res) => {
    const { pixels } = req.body;
    console.log(pixels);

    const user = req.user;

    if (!Array.isArray(pixels) || pixels.length === 0) {
      return res.status(400).json({ error: "Invalid pixel batch data" });
    }

    try {
      const batchSize = 50;
      for (let i = 0; i < pixels.length; i += batchSize) {
        const batch = pixels.slice(i, i + batchSize);

        await Promise.all(
          batch.map((pixel) =>
            setPixelColour(pixel.x, pixel.y, pixel.colourIndex)
          )
        );

        const metadataBatch = batch.map((pixel) => ({
          xPos: pixel.x,
          yPos: pixel.y,
          colour: pixel.colourIndex,
          createdBy: user.sub,
          createdDate: formatDate(Date.now()),
        }));

        const { data, error } = await supabase
          .from("canvas_metadata")
          .upsert(metadataBatch)
          .select();
        // console.log(data);

        if (error) {
          console.error("Error upserting metadata batch:", error);
        }
      }

      return res
        .status(200)
        .json({ msg: "Pixel batch processed successfully" });
    } catch (err) {
      console.error("Error processing pixel batch:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
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