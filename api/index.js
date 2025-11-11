import express from 'express';
import connectDB from '../config/db.js';
import authRoutes from "../routes/auth.routes.js";
import fileRoutes from "../routes/file.routes.js";
import userRoutes from "../routes/user.routes.js";

const app = express();
app.use(express.json());
connectDB();

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("StudyGeni API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})