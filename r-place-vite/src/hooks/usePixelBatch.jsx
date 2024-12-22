import { useState, useRef, useEffect } from "react";
import { axiosInstance } from "../services/axios";
import { getSocket } from "../services/socket";

const BATCH_INTERVAL = 500;
const MAX_BATCH_SIZE = 100;

export const usePixelBatch = (updateQueueRef) => {
  const [pixelBatch, setPixelBatch] = useState([]);
  const batchTimerRef = useRef(null);
  const localUpdateQueueRef = useRef([]);
  const pixelBatchSetRef = useRef(new Set());

  const updatePixelBatch = async (batch) => {
    try {
      const res = await axiosInstance.post("/set-pixels-batch", {
        pixels: batch,
      });

      if (res.status === 200) {
        batch.forEach(({ x, y, colourIndex }) => {
          updateQueueRef.current.push({ x, y, colourIndex });
        });

        const socket = getSocket();
        socket.emit("pixels-update-batch", batch);
      } else if (res.status === 401) {
        // TODO: Handle unauthorized error
        return { error: "unauthorized" };
      } else {
        // TODO: Handle other errors
        return { error: "unknown" };
      }
    } catch (err) {
      console.error(err);
      return { error: err.message };
    }
  };

  const addToPixelBatch = (x, y, colourIndex) => {
    const pixelKey = `${x},${y}`;
    if (!pixelBatchSetRef.current.has(pixelKey)) {
      localUpdateQueueRef.current.push({ x, y, colourIndex });

      pixelBatchSetRef.current.add(pixelKey);
      setPixelBatch((prevBatch) => {
        const newBatch = [...prevBatch, { x, y, colourIndex }];
        if (newBatch.length >= MAX_BATCH_SIZE) {
          updatePixelBatch(newBatch);
          return [];
        }
        return newBatch;
      });
    }

    if (!batchTimerRef.current) {
      batchTimerRef.current = setInterval(() => {
        setPixelBatch((currentBatch) => {
          if (currentBatch.length > 0) {
            updatePixelBatch(currentBatch);
          }
          batchTimerRef.current = null;
          return [];
        });
      }, BATCH_INTERVAL);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (batchTimerRef.current) {
        clearInterval(batchTimerRef.current);
      }
    };
  }, []);

  return {
    addToPixelBatch,
    pixelBatchSetRef,
  };
};
