export const Coordinates = ({ hoveredPixel }) => {
  return (
    <div
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "5px 10px",
        borderRadius: "5px",
        fontSize: "14px",
        fontWeight: "bold",
      }}
    >
      ({hoveredPixel.x}, {hoveredPixel.y})
    </div>
  );
};
