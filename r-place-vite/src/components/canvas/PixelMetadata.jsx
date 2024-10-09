import { useEffect } from "react";
import colourPalette from "../../utils/pallette";

export const PixelMetadata = ({ pixelMetadata }) => {
  return (
    <div className="bg-gray-800  text-white p-2 rounded font-bold text-sm shadow-lg">
    <p>Colour: {colourPalette[pixelMetadata.colour].name}</p>
    <p>Placed by: {pixelMetadata.createdBy.username}</p>
    <p>Date: {pixelMetadata.createdDate}</p>
  </div>
  );
};
