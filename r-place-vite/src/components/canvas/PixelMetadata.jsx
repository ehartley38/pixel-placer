import { useEffect } from "react";
import colourPalette from "../../utils/pallette";

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
      <p>Colour: {colourPalette[pixelMetadata.colour].name}</p>
      <p>Placed by: {pixelMetadata.createdBy.username}</p>
      <p>Date: {pixelMetadata.createdDate}</p>
    </div>
  );
};
