import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api", routes);

export default app;
