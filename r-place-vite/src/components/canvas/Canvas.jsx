import React, { useEffect, useRef, useState, useCallback } from "react";
import { axiosBinaryResInstance } from "../../services/axios";
import colourPalette from "../../utils/pallette";

const canvasWidth = import.meta.env.VITE_CANVAS_WIDTH;

export default function Canvas({ session }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageDataRef = useRef(null);
  const prevHighlightedPixelRef = useRef(null);
  const [scale, setScale] = useState(5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [highlightedPixel, setHighlightedPixel] = useState(null);
  // const [pixelHighlightPosition, setPixelHighlightPosition] = useState(null);

  useEffect(() => {
    const fetchCanvasState = async () => {
      try {
        const canvasStateResponse = await axiosBinaryResInstance.get(
          "/get-canvas",
          {
            responseType: "arraybuffer",
          }
        );

        const canvasState = new Uint8Array(canvasStateResponse.data);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.width = canvasWidth;
        canvas.height = canvasWidth;

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
        imageDataRef.current = imageData;
      } catch (err) {
        console.error("Error fetching canvas state:", err);
      }
    };

    fetchCanvasState();
  }, []);

  const handleMouseDown = useCallback((e) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const pageWidth = window.innerWidth;
      const pageHeight = window.innerHeight;

      const maxOffsetX = pageWidth * 0.1;
      const maxOffsetY = pageHeight * 0.05;

      setOffset((prevOffset) => {
        const newX = prevOffset.x - dx / scale;
        const newY = prevOffset.y - dy / scale;

        const clampedX = Math.max(-maxOffsetX, Math.min(newX, maxOffsetX));
        const clampedY = Math.max(-maxOffsetY, Math.min(newY, maxOffsetY));

        return {
          x: clampedX,
          y: clampedY,
        };
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [dragging, dragStart, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setDragging(false);
    setHighlightedPixel(null);
  }, []);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e) => {
      window.addEventListener("wheel", { passive: false });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const rect = canvasRef.current.getBoundingClientRect();
      // const mouseX = e.clientX - rect.left;
      // const mouseY = e.clientY - rect.top;
      const mouseX = e.clientX - canvasRef.current.offsetLeft;
      const mouseY = e.clientY - canvasRef.current.offsetTop;

      const wheel = e.deltaY < 0 ? 1 : -1;

      const zoom = Math.exp(wheel * 1.1);

      context.translate(offset.x, offset.y);

      const newOffsetX = offset.x - (mouseX / (scale * zoom) - mouseX / scale);
      const newOffsetY = offset.y - (mouseY / (scale * zoom) - mouseY / scale);
      const newOffset = { x: newOffsetX, y: newOffsetY };

      context.scale(zoom, zoom);

      context.translate(-newOffsetX, -newOffsetY);

      // const zoomPoint = {
      //   x: (mouseX - rect.width / 2) / scale + offset.x,
      //   y: (mouseY - rect.height / 2) / scale + offset.y,
      // };

      // const zoomFactor = Math.pow(1.0017, -e.deltaY);
      // const newScale = Math.min(Math.max(scale * zoomFactor, 3), 20);
      const newScale = scale * zoom;

      // const newOffset = {
      //   x: zoomPoint.x - (mouseX - rect.width / 2) / newScale,
      //   y: zoomPoint.y - (mouseY - rect.height / 2) / newScale,
      // };

      setScale(newScale);
      setOffset(newOffset);
    },
    [scale, offset]
  );

  // Modify handleWheel2 function
const handleWheel2 = (e) => {
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const mousex = e.clientX - rect.left;  // Use boundingClientRect for correct mouse position
  const mousey = e.clientY - rect.top;
  const wheel = e.deltaY < 0 ? 1 : -1;
  
  const zoom = Math.exp(wheel * 0.1);

  // Adjust the origin based on the new zoom level and mouse position
  const newOffsetX = offset.x - (mousex / (scale * zoom) - mousex / scale);
  const newOffsetY = offset.y - (mousey / (scale * zoom) - mousey / scale);
  const newOffset = { x: newOffsetX, y: newOffsetY };
  
  // Save the context state before applying transformations
  context.save();
  
  // Apply the scale (zoom) centered around the mouse position
  context.translate(mousex, mousey);
  context.scale(zoom, zoom);
  context.translate(-mousex, -mousey);
  
  // Restore the context state for the next frame
  context.restore();
  
  // Update the scale and offset state
  setScale(scale * zoom);
  setOffset(newOffset);
};

  

  const canvasTransform = `scale(${scale}) translate(${-offset.x}px, ${-offset.y}px)`;

  const handleCanvasMouseMove = (e) => {
    if (dragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);

    if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasWidth) {
      // setPixelHighlightPosition({ x: e.clientX, y: e.clientY });
      // console.log(pixelHighlightPosition);

      //   const index = (y * canvas.width + x) * 4;
      //   const imageData = imageDataRef.current;

      //   // const red = imageData.data[index];
      //   // const green = imageData.data[index + 1];
      //   // const blue = imageData.data[index + 2];
      //   // const alpha = imageData.data[index + 3];

      setHighlightedPixel({
        x,
        y,
      });
      //   highlightPixel(x, y);
    } else {
      setHighlightedPixel(null);
      //   // clearPrevHighlightedPixel()
    }
  };

  // const highlightPixel = (x, y) => {
  //   const canvas = canvasRef.current;
  //   const context = canvas.getContext("2d");

  //   // clearPrevHighlightedPixel();

  //   context.strokeStyle = "black";
  //   context.lineWidth = 1;
  //   context.strokeRect(x, y, 1, 1);

  //   prevHighlightedPixelRef.current = { x, y };
  // };

  // const clearPrevHighlightedPixel = () => {
  //   const canvas = canvasRef.current;
  //   const context = canvas.getContext("2d");
  //   const prevHighlightedPixel = prevHighlightedPixelRef.current;

  //   if (prevHighlightedPixel) {

  //     const { x, y } = prevHighlightedPixel;
  //     const imageData = imageDataRef.current;
  //     const pixelData = context.createImageData(1, 1);
  //     const index = (y * canvasWidth + x) * 4;

  //     for (let i = 0; i < 4; i++) {
  //       pixelData.data[i] = imageData.data[index + i];
  //     }

  //     context.putImageData(pixelData, x, y);
  //     prevHighlightedPixelRef.current = null;
  //   }
  // };

  const pixelHighlightStyle = highlightedPixel
    ? {
        position: "absolute",
        left: `${(highlightedPixel.x - offset.x) * scale}px`,
        // left: `${(highlightedPixel.x * scale) + offset.x}px`,
        // top: `${(highlightedPixel.y * scale) + offset.y}`,
        top: `${(highlightedPixel.y - offset.y) * scale}px`,
        width: `${scale}px`,
        height: `${scale}px`,
        border: "1px solid black",
        pointerEvents: "none",
        zIndex: 10,
      }
    : { display: "none" };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      ref={containerRef}
      // onMouseMove={handleMouseMove}
      // onMouseLeave={handleMouseUp}
      // onWheel={handleWheel}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: `${canvasWidth}px`,
          height: `${canvasWidth}px`,
          overflow: "visible",
          cursor: dragging ? "grabbing" : "grab",
        }}
        // onMouseDown={handleMouseDown}
        // onMouseUp={handleMouseUp}
        // onMouseLeave={handleMouseLeave}
        // onMouseMove={handleCanvasMouseMove}
        onWheel={handleWheel2}

      >
        <canvas
          ref={canvasRef}
          style={{
            imageRendering: "pixelated",
            transform: canvasTransform,
            transformOrigin: "center",
            transition: dragging ? "none" : "transform 0.1s ease-out",
          }}
          // onMouseMove={handleCanvasMouseMove}
        />
        {/* <div style={pixelHighlightStyle} /> */}
      </div>
      {/* <div
        // ref={pixelBorder}
        style={{
          transform: pixelHighlightPosition
            ? `translate(${pixelHighlightPosition.x}px, ${pixelHighlightPosition.y}px)`
            : "none",
          position: "absolute",
          width: "20px",
          height: "20px",
          top: 0,
          left: 0,
          border: "1px solid black",
          zIndex: "50",
        }}
      ></div> */}
    </div>
  );
}
