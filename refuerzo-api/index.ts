import dotenv from "dotenv";
import envconfig from "./config/env.config";
import * as database from "./config/db.config";
import mainRouter from "./routes/main.router";
import { errorHandler } from "./middlewares/error.middleware";
import express, { Request, Response } from "express";
import debug from "debug";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());

app.use("/api/v1", mainRouter);

app.use("/", (req: Request, res: Response) => {
  res.send("Welcome to William API");
});

app.use(errorHandler);

const port = envconfig.PORT;

const startServer = async () => {
  try {
    await database.connect();
    console.log("Conectado a la base de datos");

    app.listen(port, () => {
      debug(`Server is running on port ${port}`);
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
};

startServer();
