import React, { useEffect, useRef, useState, useCallback } from "react";
import { axiosBinaryResInstance } from "../../services/axios";
import colourPalette from "../../utils/pallette";

const canvasWidth = import.meta.env.VITE_CANVAS_WIDTH;

export default function InteractiveMap({ session }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
  }, []);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomPoint = {
        x: (mouseX - rect.width / 2) / scale + offset.x,
        y: (mouseY - rect.height / 2) / scale + offset.y,
      };

      const zoomFactor = Math.pow(1.0017, -e.deltaY);
      const newScale = Math.min(Math.max(scale * zoomFactor, 3), 20);

      const newOffset = {
        x: zoomPoint.x - (mouseX - rect.width / 2) / newScale,
        y: zoomPoint.y - (mouseY - rect.height / 2) / newScale,
      };

      setScale(newScale);
      setOffset(newOffset);
    },
    [scale, offset]
  );

  const mapTransform = `scale(${scale}) translate(${-offset.x}px, ${-offset.y}px)`;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
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
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          style={{
            imageRendering: "pixelated",
            transform: mapTransform,
            transformOrigin: "center",
            transition: dragging ? "none" : "transform 0.1s ease-out",
          }}
        />
      </div>
    </div>
  );
}
