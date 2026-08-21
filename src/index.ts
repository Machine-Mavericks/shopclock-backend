import { LOGGER, PORT, VERSION } from "./constants";
import express from "express";
import clockRouter from "./punch/clock.routes"
import { getStudent, initDatabase, verifyConnection } from "./database";

const app = express();

app.use(express.json());

// different endpoints
app.use("/clock", clockRouter);

app.get("/", async (req, res) => {
  res.status(200).send(`Version: ${VERSION}`);
});

app.listen(PORT, async () => {
  LOGGER.info("express is listening");
})

verifyConnection();
initDatabase();