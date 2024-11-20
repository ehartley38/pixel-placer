import { config } from "./config.js";



export const corsOptions = {
  
    origin: (origin, callback) => {
      if (config.allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        console.log("Origin:", origin);
        
        // callback(new Error(`Not allowed by CORS. Error: ${origin}`));
        callback(null, true);

      }
    },
    optionsSuccessStatus: 200,
  };