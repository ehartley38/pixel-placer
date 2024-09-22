import React, { useRef, useEffect } from "react";
import { useDraggable } from "react-use-draggable-scroll";
import colourPalette from "../../utils/pallette";

const ColourPicker = ({ setActiveColour }) => {
  const ref = useRef(null);
  const { events } = useDraggable(ref);

  useEffect(() => {
    const handleWheel = (e) => {
      if (ref.current) {
        e.preventDefault();
        ref.current.scrollLeft += e.deltaY;
      }
    };

    const currentRef = ref.current;
    if (currentRef) {
      currentRef.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const handleColourSelect = (index) => {
    setActiveColour(index);
  };

  return (
    <div className="flex justify-center fixed bottom-0  w-full bg-transparent mb-6">
      <div
        ref={ref}
        className="flex overflow-x-auto space-x-4 p-1 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        {...events}
      >
        {colourPalette.map((colour, index) => (
          <div
            key={index}
            className="w-9 h-9 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 flex-shrink-0 my-1"
            style={{
              backgroundColor: `rgba(${colour.join(",")})`,
              border: "2px solid #C5C5C5",
            }}
            onClick={() => handleColourSelect(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColourPicker;
