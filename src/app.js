import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import productRouter from "./routes/products.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));  // serves public/index.html at "/"
app.use('/', productRouter);

export default app;