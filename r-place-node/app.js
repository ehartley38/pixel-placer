import express from "express";
import cors from "cors";
import mainRouter from "./controllers/main.js";
import { corsOptions } from "./utils/corsOptions.js";
import { initialiseRedis } from "./utils/initialiseRedis.js";
import { config } from "./utils/config.js"
import authRouter from "./controllers/auth.js";
import cron from 'node-cron';
import { pingSupabase } from "./utils/pingSupabase.js";

const app = express();

initialiseRedis();

cron.schedule('0 9 * * 1,4', async () => {
    await pingSupabase(); 
  });


app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/", mainRouter);
app.use("/api/auth/", authRouter)

export default app;
