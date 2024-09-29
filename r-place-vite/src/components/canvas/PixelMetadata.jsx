export const PixelMetadata = ({ pixelMetadata }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "5px 10px",
        borderRadius: "5px",
        fontSize: "14px",
        fontWeight: "bold",
        zIndex: 1000,
      }}
    >
      <p>
        ({pixelMetadata.xPos}, {pixelMetadata.yPos})
      </p>
      <p>Colour: {pixelMetadata.colour}</p>
      <p>CreatedBy: {pixelMetadata.createdBy.username}</p>
      <p>CreatedDate: {pixelMetadata.createdDate}</p>
    </div>
  );
};
