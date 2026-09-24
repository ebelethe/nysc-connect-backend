import express from "express";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
const app =express();

app.use(express.json());

app.get("/", (req, res )=> {
    res.send("NYSC Connect API is running");
});

// ... your existing app.use(express.json()) etc.
app.use("/api", routes);

// Catches any request to a URL that doesn't match any defined route
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

//Global error handler 
app.use(errorHandler);
export default app;