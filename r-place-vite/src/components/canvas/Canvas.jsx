import { useEffect, useRef } from "react";
import colourPalette from "../../utils/pallette";
import axios from "axios";
import { axiosBinaryResInstance } from "../../services/axios";

const canvasWidth = import.meta.env.VITE_CANVAS_WIDTH;

export default function Canvas({ session }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchCanvasState = async () => {
      try {
        const canvasStateResponse = await axiosBinaryResInstance.get("/get-canvas", {
          responseType: "arraybuffer"
        });
        
        const canvasState = new Uint8Array(canvasStateResponse.data)
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        const imageData = context.createImageData(canvasWidth, canvasWidth);

        let pixelIndex = 0;
        for (let i = 0; i < canvasState.length; i++) {
          const byte = canvasState[i];

          const firstColourIndex = (byte >> 4) & 0x0f;
          const secondColourIndex = byte & 0x0f;

          const colour1 = colourPalette[firstColourIndex];
          const colour2 = colourPalette[secondColourIndex];

          imageData.data[pixelIndex++] = colour1[0];
          imageData.data[pixelIndex++] = colour1[1];
          imageData.data[pixelIndex++] = colour1[2];
          imageData.data[pixelIndex++] = colour1[3];

          imageData.data[pixelIndex++] = colour2[0];
          imageData.data[pixelIndex++] = colour2[1];
          imageData.data[pixelIndex++] = colour2[2];
          imageData.data[pixelIndex++] = colour2[3];
        }

        
        context.putImageData(imageData, 0, 0);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCanvasState();
  }, []);

  return (
    <>
      <h1>Canvas</h1>
      <canvas ref={canvasRef}></canvas>
    </>
  );
}
