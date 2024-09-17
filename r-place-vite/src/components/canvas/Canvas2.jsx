import React, { useEffect, useRef, useState, useCallback } from "react";

const Canvas2 = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const zoomIntensity = 0.1;
  const canvasWidth = 100;
  const canvasHeight = 100;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.fillStyle = "white";
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    context.fillStyle = "black";
    context.fillRect(10, 10, 20, 20);
  }, []);

  useEffect(() => {
    draw();
    console.log(window.innerWidth);
    
    setOffset({x: (window.innerWidth / 2) - (canvasWidth / 2), y: (window.innerHeight / 2) - canvasWidth / 2})
  }, []);

  const handleWheel = (event) => {
    event.preventDefault();
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const wheel = event.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);

    const newScale = scale * zoom;
    
    setScale(newScale);
    setOffset(prevOffset => ({
      x: offsetX - (offsetX - prevOffset.x) * zoom,
      y: offsetY - (offsetY - prevOffset.y) * zoom
    }));
  };

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setStartPan({ x: event.clientX - offset.x, y: event.clientY - offset.y });
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      setOffset({
        x: event.clientX - startPan.x,
        y: event.clientY - startPan.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-screen w-screen fixed flex items-center justify-center bg-white">
      <div 
        ref={containerRef}
        className="relative overflow-hidden h-screen w-screen"
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
          height={canvasHeight}
          style={{
            border: "1px solid black",
            position: "absolute",
            left: `${offset.x}px`,
            top: `${offset.y}px`,
            width: `${canvasWidth * scale}px`,
            height: `${canvasHeight * scale}px`,
          }}
        />
      </div>
    </div>
  );
};

export default Canvas2;