import React, { useEffect, useRef, useState, useCallback } from "react";
import { axiosBinaryResInstance, axiosInstance } from "../../services/axios";
import colourPalette from "../../utils/pallette";
import { connectSocket, getSocket } from "../../services/socket";
import ColourPicker from "./ColourPicker";
import SelectedColour from "./SelectedColour";
import { PixelMetadata } from "./PixelMetadata";
import { Coordinates } from "./Coordinates";

// const canvasWidth = import.meta.env.VITE_CANVAS_WIDTH;
const canvasWidth = 1000;

const abgrPalette = colourPalette.map(({ rgba }) => {
  const [r, g, b, a] = rgba;
  return (a << 24) | (b << 16) | (g << 8) | r;
});

const dragThreshold = 10;
const zoomIntensity = 0.1;
const arrowKeyStep = 10;

// TODO - Handle error when attempting to add colour with no session
// TODO - Socket batch handling
// TODO - Add a max batch size to prevent very large updates

const Canvas2 = ({ session }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageDataRef = useRef(null);
  const updateQueueRef = useRef([]);
  const hoverTimerRef = useRef(null);
  const batchTimerRef = useRef(null);
  const localUpdateQueueRef = useRef([]);
  const pixelBatchSetRef = useRef(new Set());

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isClick, setIsClick] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState({ x: -1, y: -1 });
  const [activeColour, setActiveColour] = useState(0);
  const [initialClickPos, setInitialClickPos] = useState({ x: 0, y: 0 });
  const [showMetadata, setShowMetadata] = useState(false);
  const [pixelMetadata, setPixelMetadata] = useState(null);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [pixelBatch, setPixelBatch] = useState([]);

  useEffect(() => {
    const socket = connectSocket();

    // socket.on("canvas-update", (data) => {
    //   const { x, y, colourIndex } = data;
    //   updateQueueRef.current.push({ x, y, colourIndex });
    // });

    socket.on("canvas-update-batch", (data) => {
      data.forEach(({ x, y, colourIndex }) => {
        updateQueueRef.current.push({ x, y, colourIndex });
      });
    });

    return () => {
      // Clean up on unmount
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    imageDataRef.current = new ImageData(canvasWidth, canvasWidth);

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
        const buffer = new ArrayBuffer(imageData.data.length);
        const uint8Array = new Uint8ClampedArray(buffer);
        const uint32Array = new Uint32Array(buffer);

        let pixelIndex = 0;

        // Store the pixel colour in reverse-byte order (ABGR) so that bytes automatically fall in to the correct position when
        // using the Uint8ClampedArray (uint8clampedarray is what the imagadata object expects)
        // The uint8Array and uint32Array are just different views of the same underlying buffer.
        // So when we write to uint32Array, we're actually modifying the data that uint8Array sees as well
        for (let i = 0; i < canvasState.length; i++) {
          const colourIndex = canvasState[i];

          uint32Array[pixelIndex++] = abgrPalette[colourIndex];
        }

        imageData.data.set(uint8Array);
        context.putImageData(imageData, 0, 0);
        imageDataRef.current = imageData;
      } catch (err) {
        console.error("Error fetching canvas state:", err);
      }
    };

    fetchCanvasState();

    const renderLoop = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const imageData = imageDataRef.current;
      if (!imageData || !context) return;

      const serverUpdates = updateQueueRef.current.splice(0);
      const localUpdates = localUpdateQueueRef.current.splice(0);

      const updates = [...serverUpdates, ...localUpdates];

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

    const centreOffsetX = (window.innerWidth - canvasWidth * scale) / 2;
    const centreOffsetY = (window.innerHeight - canvasWidth * scale) / 2;
    setOffset({ x: centreOffsetX, y: centreOffsetY });

    window.addEventListener("keydown", handleKeyDown);
  }, []);

  // const updatePixel = async (x, y, colourIndex) => {
  //   if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasWidth) {
  //     console.error("Pixel coordinates out of bounds");
  //     return;
  //   }

  //   try {
  //     // updateQueueRef.current.push({ x, y, colourIndex });

  //     const res = await axiosInstance.post(
  //       `/set-pixel/${x}/${y}/${colourIndex}`
  //     );

  //     if (res.status == 200) {
  //       updateQueueRef.current.push({ x, y, colourIndex });
  //       const socket = getSocket();

  //       socket.emit("pixel-update", { x, y, colourIndex });
  //     } else if (res.status == 401) {
  //       // TODO - Display Login
  //       return;
  //     } else {
  //       // TODO - Display error message
  //       return;
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

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
        // TODO - Implement this socket batch update
        socket.emit("pixels-update-batch", batch);
      } else if (res.status === 401) {
        // TODO - Display Login
      } else {
        // TODO - Display error message
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If there has not been an update in 50ms, then update the batch
  const addToPixelBatch = (x, y, colourIndex) => {
    const pixelKey = `${x},${y}`;
    if (!pixelBatchSetRef.current.has(pixelKey)) {
      pixelBatchSetRef.current.add(pixelKey);
      setPixelBatch((prevBatch) => [...prevBatch, { x, y, colourIndex }]);
      localUpdateQueueRef.current.push({ x, y, colourIndex });
    }

    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
    }

    batchTimerRef.current = setTimeout(() => {
      if (pixelBatch.length > 0) {
        updatePixelBatch(pixelBatch);
        setPixelBatch([]);
        pixelBatchSetRef.current.clear();
      }
    }, 50);
  };

  const handleKeyDown = useCallback((e) => {
    if (e.code === "Space") {
      setIsSpaceDown(true);
    }

    switch (e.key) {
      case "ArrowUp":
        setOffset((prev) => ({ ...prev, y: prev.y + arrowKeyStep }));
        break;
      case "ArrowDown":
        setOffset((prev) => ({ ...prev, y: prev.y - arrowKeyStep }));
        break;
      case "ArrowLeft":
        setOffset((prev) => ({ ...prev, x: prev.x + arrowKeyStep }));
        break;
      case "ArrowRight":
        setOffset((prev) => ({ ...prev, x: prev.x - arrowKeyStep }));
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    if (e.code === "Space") {
      setIsSpaceDown(false);
    }
  });

  const handleWheel = (e) => {
    window.addEventListener("wheel", { passive: false });

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);

    const newScale = scale * zoom;

    if (newScale < 0.5 || newScale > 50) return;

    setScale(newScale);
    setOffset((prevOffset) => ({
      x: offsetX - (offsetX - prevOffset.x) * zoom,
      y: offsetY - (offsetY - prevOffset.y) * zoom,
    }));
  };

  const handleMouseDown = (e) => {
    setIsClick(true);
    setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    setInitialClickPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isClick) {
      const dx = e.clientX - initialClickPos.x;
      const dy = e.clientY - initialClickPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > dragThreshold) {
        setIsDragging(true);
        setIsClick(false);
      }
    }

    // Maybe check for valid session here

    if (isDragging) {
      if (!isSpaceDown) {
        setOffset({
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y,
        });
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - offset.x) / scale);
        const y = Math.floor((e.clientY - rect.top - offset.y) / scale);
        if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasWidth) {
          addToPixelBatch(x, y, activeColour);
        }
      }
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - offset.x) / scale);
    const y = Math.floor((e.clientY - rect.top - offset.y) / scale);

    // Show metadata logic
    if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasWidth) {
      setHoveredPixel({ x, y });
      clearTimeout(hoverTimerRef.current);
      setShowMetadata(false);

      hoverTimerRef.current = setTimeout(async () => {
        try {
          const res = await axiosInstance.get(`/get-pixel/${x}/${y}`);
          const metadata = res.data.data[0];

          setPixelMetadata(metadata);
          setShowMetadata(true);
        } catch (err) {
          console.log(err);
        }
      }, 500);
    } else {
      setHoveredPixel({ x: -1, y: -1 });
      setShowMetadata(false);
      clearTimeout(hoverTimerRef);
    }
  };

  const handleMouseUp = (e) => {
    if (isClick && !isDragging) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left - offset.x) / scale);
      const y = Math.floor((e.clientY - rect.top - offset.y) / scale);

      if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasWidth) {
        addToPixelBatch(x, y, activeColour);
      }
    }

    setIsDragging(false);
    setIsClick(false);

    if (pixelBatchSetRef.current.size > 0) {
      updatePixelBatch([...pixelBatch]);
      setPixelBatch([]);
      pixelBatchSetRef.current.clear();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <>
      <div className="h-screen w-screen fixed flex items-center justify-center bg-white">
        <div
          ref={containerRef}
          className="relative overflow-hidden h-screen w-screen cursor-crosshair"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          tabIndex={0}
          // onKeyDown={handleKeyDown}
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
                position: "absolute",
                left: `${offset.x + hoveredPixel.x * scale}px`,
                top: `${offset.y + hoveredPixel.y * scale}px`,
                width: `${scale}px`,
                height: `${scale}px`,
                border: "1px solid black",
                pointerEvents: "none",
              }}
            />
          )}

          {hoveredPixel.x !== -1 && hoveredPixel.y !== -1 && (
            <div className="fixed top-0 right-0 z-[1000]">
              <div className="flex flex-col items-end space-y-3 m-2">
                <Coordinates hoveredPixel={hoveredPixel} />
                {showMetadata && pixelMetadata && (
                  <PixelMetadata
                    hoveredPixel={hoveredPixel}
                    pixelMetadata={pixelMetadata}
                  />
                )}
              </div>
            </div>
          )}

          <SelectedColour activeColour={activeColour} />
        </div>
      </div>
      <ColourPicker
        activeColour={activeColour}
        setActiveColour={setActiveColour}
      />
    </>
  );
};

export default Canvas2;
