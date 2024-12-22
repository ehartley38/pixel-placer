import React, { useEffect, useRef, useState, useCallback } from "react";
import { connectSocket } from "../../services/socket";
import ColourPicker from "./ColourPicker";
import SelectedColour from "./SelectedColour";
import { PixelMetadata } from "./PixelMetadata";
import { Coordinates } from "./Coordinates";
import { OnlineCount } from "./OnlineCount";
import { AuthModal } from "../auth/AuthModal";
import { useSession } from "../../context/sessionProvider";
import { useCanvasState } from "../../hooks/useCanvasState";
import { useCanvasInteractions } from "../../hooks/useCanvasInteractions";
import { usePixelBatch } from "../../hooks/usePixelBatch";

const canvasWidth = 1000;
const CONCURRENT_CONNECTIONS_INTERVAL = 15000;

const Canvas = ({}) => {
  const containerRef = useRef(null);

  const { session } = useSession();

  const [activeColour, setActiveColour] = useState(0);
  const [socketConnections, setSocketConnections] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [email, setEmail] = useState("");
  const [showSpaceHelper, setShowSpaceHelper] = useState(true);

  const {
    canvasRef,
    updateQueueRef,
    isLoading,
    scale,
    setScale,
    offset,
    setOffset,
  } = useCanvasState();

  const { addToPixelBatch, pixelBatchSetRef } = usePixelBatch(updateQueueRef);

  const {
    hoveredPixel,
    showMetadata,
    pixelMetadata,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCanvasInteractions({
    containerRef,
    canvasWidth,
    scale,
    setScale,
    offset,
    setOffset,
    session,
    addToPixelBatch,
    activeColour,
    setShowLoginModal,
    setShowSpaceHelper,
    pixelBatchSetRef,
  });

  // Handle socket connections
  useEffect(() => {
    const socket = connectSocket();

    socket.on("canvas-update-batch", (data) => {
      data.forEach(({ x, y, colourIndex }) => {
        updateQueueRef.current.push({ x, y, colourIndex });
      });
    });

    socket.emit("get-connections");

    const intervalId = setInterval(() => {
      socket.emit("get-connections");
    }, CONCURRENT_CONNECTIONS_INTERVAL);

    socket.on("connections-count", (connections) => {
      setSocketConnections(connections);
    });

    return () => {
      // Clean up on unmount
      if (socket.connected) {
        socket.disconnect();
      }
      clearInterval(intervalId);
    };
  }, []);                      

  if (isLoading) {
    return (
      <div className="h-screen w-screen fixed flex items-center justify-center">
        <div className="text-2xl font-semibold text-black">Loading...</div>
      </div>
    );
  }

  if (!socketConnections) {
    return (
      <div className="h-screen w-screen fixed flex items-center justify-center">
        <div className="text-2xl font-semibold text-black">Connecting...</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-screen fixed flex items-center justify-center bg-white overflow-hidden">
        <div
          ref={containerRef}
          className="relative overflow-hidden h-screen w-screen cursor-crosshair"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          tabIndex={0}
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
          {/* Pixel outline */}
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

          {/* Online Count +  Coordniates + Metadata*/}
          <div className="fixed top-0 left-0 z-[1000] m-2">
            <div className="flex flex-col items-start space-y-2">
              <OnlineCount socketConnections={socketConnections} />
              {hoveredPixel.x !== -1 && hoveredPixel.y !== -1 && (
                <>
                  <Coordinates hoveredPixel={hoveredPixel} />
                  {showMetadata && pixelMetadata && (
                    <PixelMetadata
                      hoveredPixel={hoveredPixel}
                      pixelMetadata={pixelMetadata}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {!showLoginModal && <SelectedColour activeColour={activeColour} />}
        </div>

        {showLoginModal && (
          <AuthModal
            setShowLoginModal={setShowLoginModal}
            showSuccessModal={showSuccessModal}
            setShowSuccessModal={setShowSuccessModal}
            setEmail={setEmail}
            email={email}
          />
        )}
      </div>
      {!showLoginModal && (
        <ColourPicker
          activeColour={activeColour}
          setActiveColour={setActiveColour}
          showSpaceHelper={showSpaceHelper}
        />
      )}
    </>
  );
};

export default Canvas;
