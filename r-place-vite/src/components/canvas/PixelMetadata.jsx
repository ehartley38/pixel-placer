import { useEffect } from "react";
import colourPalette from "../../utils/pallette";
import convertToDateTime from "../../utils/convertToDateTime";

export const PixelMetadata = ({ pixelMetadata }) => {

  const formattedDate = convertToDateTime(pixelMetadata.createdDate)

  return (
    <div className="bg-gray-800  text-white p-2 rounded font-bold text-sm shadow-lg">
    <p>Colour: {colourPalette[pixelMetadata.colour].name}</p>
    <p>Placed by: {pixelMetadata.createdBy.username}</p>
    <p>Date: {formattedDate}</p>
  </div>
  );
};
