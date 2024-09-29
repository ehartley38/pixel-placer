export const PixelMetadata = ({ pixelMetadata }) => {
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
      <p>Colour: {pixelMetadata.colour}</p>
      <p>CreatedBy: {pixelMetadata.createdBy.username}</p>
      <p>CreatedDate: {pixelMetadata.createdDate}</p>
    </div>
  );
};
