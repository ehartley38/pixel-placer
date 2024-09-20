import React, { useEffect, useRef, useState, useCallback } from "react";
import { axiosBinaryResInstance } from "../../services/axios";
import colourPalette from "../../utils/pallette";

const canvasWidth = import.meta.env.VITE_CANVAS_WIDTH;

const Canvas2 = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState({ x: -1, y: -1 });

  const zoomIntensity = 0.1;

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
      } catch (err) {
        console.error("Error fetching canvas state:", err);
      }
    };

    fetchCanvasState();

    const centreOffsetX = (window.innerWidth - canvasWidth * scale) / 2;
    const centreOffsetY = (window.innerHeight - canvasWidth * scale) / 2;
    setOffset({ x: centreOffsetX, y: centreOffsetY });
  }, []);

  const handleWheel = (e) => {
    window.addEventListener("wheel", { passive: false });

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);

    const newScale = scale * zoom;

    console.log(newScale);
    if (newScale < 2 || newScale > 50) return
    

    setScale(newScale);
    setOffset((prevOffset) => ({
      x: offsetX - (offsetX - prevOffset.x) * zoom,
      y: offsetY - (offsetY - prevOffset.y) * zoom,
    }));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - offset.x) / scale);
    const y = Math.floor((e.clientY - rect.top - offset.y) / scale);

    if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasWidth) {
      setHoveredPixel({ x, y });
    } else {
      setHoveredPixel({ x: -1, y: -1 });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-screen w-screen fixed flex items-center justify-center bg-white">
      <div
        ref={containerRef}
        className="relative overflow-hidden h-screen w-screen cursor-crosshair"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          id="canvas"
          ref={canvasRef}
          width={canvasWidth}
          height={canvasWidth}
          style={{
            border: "1px solid black",
            position: "absolute",
            left: `${offset.x}px`,
            top: `${offset.y}px`,
            width: `${canvasWidth * scale}px`,
            height: `${canvasWidth * scale}px`,
            imageRendering: "pixelated",
          }}
        />
        {hoveredPixel.x !== -1 && hoveredPixel.y !== -1 && (
          <div
            style={{
              position: 'absolute',
              left: `${offset.x + hoveredPixel.x * scale}px`,
              top: `${offset.y + hoveredPixel.y * scale}px`,
              width: `${scale}px`,
              height: `${scale}px`,
              border: '1px solid black',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Canvas2;
