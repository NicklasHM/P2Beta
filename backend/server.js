import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import projectRoutes from "./routes/project.route.js";
import employeeRoutes from "./routes/employee.route.js";
import machineRoutes from "./routes/machine.route.js";
import bookingRoutes from "./routes/booking.route.js";
import cors from "cors";
import { updateAllMachineStatuses } from "./controllers/machine.controller.js";
import path from "path";
import { fileURLToPath } from "url";
import history from "connect-history-api-fallback";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json()); // allows us to accept JSON data in the request body
app.use(cors()); // Enable CORS for all routes

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/bookings", bookingRoutes);

// Servér statiske filer fra frontend/dist mappen
const staticPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(staticPath));

// Håndter client-side routing (VIGTIG del)
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// For SPA routing
app.use(history());

// Serve static files from frontend/dist
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(staticPath));
}

app.listen(PORT, async () => {
  await connectDB();

  // Opdater maskinstatus ved serverstart
  await updateAllMachineStatuses();

  console.log(`Server is running on port http://localhost:${PORT}`);

  // Opdater maskinstatus hvert 5. minut (300000 ms)
  setInterval(updateAllMachineStatuses, 300000);
});
