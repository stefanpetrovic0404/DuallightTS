"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Enable CORS for frontend communication
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API route
app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from Express TypeScript!" });
});
// Serve frontend (Vite build)
app.use(express_1.default.static(path_1.default.join(__dirname, "../../client/dist")));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
