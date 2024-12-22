import { useState, useRef, useEffect } from 'react';
import { axiosBinaryResInstance } from '../services/axios';
import colourPalette from '../utils/pallette';

const canvasWidth = 1000;

// Convert RGB colors to ABGR format for canvas
const abgrPalette = colourPalette.map(({ rgba }) => {
  const [r, g, b, a] = rgba;
  return (a << 24) | (b << 16) | (g << 8) | r;
});

export const useCanvasState = () => {
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const imageDataRef = useRef(null);
  const updateQueueRef = useRef([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Initialize canvas and fetch initial state
  useEffect(() => {
    // Create offscreen canvas for initial load
    offscreenCanvasRef.current = document.createElement("canvas");
    offscreenCanvasRef.current.width = canvasWidth;
    offscreenCanvasRef.current.height = canvasWidth;

    const fetchCanvasState = async () => {
      setIsLoading(true);
      try {
        const canvasStateResponse = await axiosBinaryResInstance.get("/get-canvas", {
          responseType: "arraybuffer",
        });

        const canvasState = new Uint8Array(canvasStateResponse.data);
        const offscreenContext = offscreenCanvasRef.current.getContext("2d");
        const imageData = offscreenContext.createImageData(canvasWidth, canvasWidth);
        const buffer = new ArrayBuffer(imageData.data.length);
        const uint8Array = new Uint8ClampedArray(buffer);
        const uint32Array = new Uint32Array(buffer);

        // Process pixel data
        let pixelIndex = 0;
        for (let i = 0; i < canvasState.length; i++) {
          const colourIndex = canvasState[i];
          uint32Array[pixelIndex++] = abgrPalette[colourIndex];
        }

        imageData.data.set(uint8Array);
        imageDataRef.current = imageData;
      } catch (err) {
        console.error("Error fetching canvas state:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCanvasState();

    // Center the canvas
    const centreOffsetX = (window.innerWidth - canvasWidth * scale) / 2;
    const centreOffsetY = (window.innerHeight - canvasWidth * scale) / 2;
    setOffset({ x: centreOffsetX, y: centreOffsetY });
  }, []);

  // Start render loop when canvas is ready
  useEffect(() => {
    if (!isLoading && canvasRef.current && offscreenCanvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.putImageData(imageDataRef.current, 0, 0);

      const renderLoop = () => {        
        const imageData = imageDataRef.current;
        if (!imageData || !context) return;

        const updates = updateQueueRef.current.splice(0);

        if (updates.length > 0) {
          updates.forEach(({ x, y, colourIndex }) => {
            const index = (y * canvasWidth + x) * 4;
            const uint32Array = new Uint32Array(imageData.data.buffer);
            uint32Array[index / 4] = abgrPalette[colourIndex];
          });
          context.putImageData(imageData, 0, 0);
        }

        requestAnimationFrame(renderLoop);
      };

      requestAnimationFrame(renderLoop);
    }
  }, [isLoading]);

  return {
    canvasRef,
    imageDataRef,
    updateQueueRef,
    isLoading,
    scale,
    setScale,
    offset,
    setOffset,
  };
};