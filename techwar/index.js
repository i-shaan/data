import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import appRouter from "./api/routes/index.js";
import { connectDB } from "./api/db/connectDB.js";
import errorHandler from "./api/middlewares/errorHandler.js";
import logger from "./api/middlewares/logger.js";

const PORT = process.env.PORT || 8000;
const dbConnectionString = process.env.MONGO_URI;

connectDB(dbConnectionString);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(logger);

app.get('/', (req, res) => res.send("Welcome to Tech Wars BE"));

app.use("/api/v1", appRouter);

app.use(errorHandler);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Error 404: Route does not exist"
  });
});

app.listen(PORT, () => {
  console.log(`App is listening to the PORT ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
