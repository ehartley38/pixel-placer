import React, { useRef, useEffect } from "react";
import { useDraggable } from "react-use-draggable-scroll";
import colourPalette from "../../utils/pallette";

const ColourPicker = ({
  activeColour,
  setActiveColour,
  showSpaceHelper,
}) => {
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
    <>
      <div className="flex-col justify-center text-center fixed bottom-0  w-full bg-transparent mb-6">
        <div className="w-full mb-2 flex flex-col items-center">
          {showSpaceHelper && (
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center space-x-2">
              <span className="text-sm font-medium">
                Hold space and drag to multi-paint
              </span>
            </div>
          )}
        </div>
        <div
          ref={ref}
          className="flex overflow-x-auto space-x-4 p-1 mx-10 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          {...events}
        >
          {colourPalette.map((colour, index) => (
            <div
              key={index}
              className="w-9 h-9 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 flex-shrink-0 my-1"
              style={{
                backgroundColor: `rgba(${colour.rgba.join(",")})`,
                border: `2px solid ${
                  index === activeColour ? "#42afed" : "#C5C5C5"
                }`,
              }}
              onClick={() => handleColourSelect(index)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ColourPicker;
