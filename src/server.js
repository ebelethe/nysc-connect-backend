import "dotenv/config";
import app from "./app.js";
import fs from "fs";
fs.mkdirSync("uploads", { recursive: true });

const PORT =process.env.PORT || 5001;

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});