import { useEffect, useState } from "react";
import colourPalette from "../../utils/pallette";

const SelectedColour = ({activeColour}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "20px",
        height: "20px",
        backgroundColor: `rgba(${colourPalette[activeColour].join(",")})`,
        pointerEvents: "none",
        zIndex: 9999,
        border: "1px solid black",
      }}
    />
  );
};

export default SelectedColour;
