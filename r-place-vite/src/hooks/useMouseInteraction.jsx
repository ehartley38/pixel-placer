import { useState, useRef, useEffect, useCallback } from "react";
import { axiosInstance } from "../services/axios";

export const useMouseInteractions = ({
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
  setShowMetadata,
  setPixelMetadata,
  setShowSpaceHelper,
  setHoveredPixel,
}) => {
  const dragThreshold = 10;
  const zoomIntensity = 0.1;
  const arrowKeyStep = 10;

  const [isDragging, setIsDragging] = useState(false);
  const [isClick, setIsClick] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [initialClickPos, setInitialClickPos] = useState({ x: 0, y: 0 });
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const hoverTimerRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.code === "Space") setIsSpaceDown(true);

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
      default:
        break;
    }
  }, [setOffset]);

  const handleKeyUp = useCallback((e) => {
    if (e.code === "Space") setIsSpaceDown(false);
  }, []);

  const handleWheel = useCallback((e) => {
    window.addEventListener("wheel", { passive: false })

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const zoom = Math.exp((e.deltaY < 0 ? 1 : -1) * zoomIntensity);
    const newScale = scale * zoom;

    if (newScale < 0.5 || newScale > 50) return;

    setScale(newScale);
    setOffset((prev) => ({
      x: offsetX - (offsetX - prev.x) * zoom,
      y: offsetY - (offsetY - prev.y) * zoom,
    }));
  }, [scale, setScale, setOffset]);

  const handleMouseDown = useCallback((e) => {
    setIsClick(true);
    setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    setInitialClickPos({ x: e.clientX, y: e.clientY });
  }, [offset]);

  const handleMouseMove = useCallback((e) => {
    if (isClick) {
      const dx = e.clientX - initialClickPos.x;
      const dy = e.clientY - initialClickPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > dragThreshold) {
        setIsDragging(true);
        setIsClick(false);
      }
    }

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
          setShowSpaceHelper(false);
        }
      }
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - offset.x) / scale);
    const y = Math.floor((e.clientY - rect.top - offset.y) / scale);

    if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasWidth) {
      setHoveredPixel({ x, y });
      if (session) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(async () => {
          try {
            const res = await axiosInstance.get(`/get-pixel/${x}/${y}`);
            setPixelMetadata(res.data.data[0]);
            setShowMetadata(true);
          } catch (err) {
            console.error(err);
          }
        }, 500);
      }
    } else {
      setHoveredPixel({ x: -1, y: -1 });
      setShowMetadata(false);
    }
  }, [isClick, isDragging, scale, offset]);

  const handleMouseUp = useCallback((e) => {
    if (isClick && !isDragging) {
      if (!session) {
        setShowLoginModal(true);
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - offset.x) / scale);
        const y = Math.floor((e.clientY - rect.top - offset.y) / scale);
        addToPixelBatch(x, y, activeColour);
      }
    }
    setIsDragging(false);
    setIsClick(false);
  }, [isClick, isDragging]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
