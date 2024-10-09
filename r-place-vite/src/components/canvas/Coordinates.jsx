export const Coordinates = ({ hoveredPixel }) => {
  return (
    <div className="bg-gray-800  text-white px-2 py-1 rounded font-bold text-sm shadow-lg">
      ({hoveredPixel.x}, {hoveredPixel.y})
    </div>
  );
};
