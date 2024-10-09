export const OnlineCount = ({ socketConnections }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-full shadow-lg">
      <div className="relative">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 bg-green-400 rounded-full opacity-75 animate-ping"></div>
      </div>
      <span className="text-white font-semibold text-sm">
        {socketConnections} online
      </span>
    </div>
  );
};
