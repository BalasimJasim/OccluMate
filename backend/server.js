import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';
import patientRoutes from './routes/patientRoutes.js';  
import patientPortalRoutes from './routes/patientPortalRoutes.js';
import analyticsRoutes from "./routes/analyticsRoutes.js"
import taskRoutes from './routes/taskRoutes.js'
import prescriptionRoutes from "./routes/prescriptionRoutes.js"
import appointmentRoutes from './routes/appointmentRoutes.js';
import dentalChartRoutes from './routes/dentalChartRoutes.js';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/userRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import staffRoutes from "./routes/staffRoutes.js";
import sendSMS from "./utils/sendSMS.js";
import testRoutes from "./routes/testRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Enhanced security with helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:4173",
      "http://localhost:4174",
      "http://localhost:4175",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://occlumate.onrender.com",
      "https://occlumate.vercel.app",
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Length", "X-Requested-With"],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Middleware
app.use(
  express.json({
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        res.status(400).json({ message: "Invalid JSON" });
        throw new Error("Invalid JSON");
      }
    },
  })
);
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Welcome to OccluMate!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dental-charts", dentalChartRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/patient-portal", patientPortalRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/test", testRoutes);
app.use("/api/staff", staffRoutes);

// Add this after your other middleware
app.use((err, req, res, next) => {
  if (err.name === 'TwilioError') {
    console.error('Twilio Error:', err);
    // Continue processing but log the error
    next();
  } else {
    next(err);
  }
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Not Found',
    error: 'The requested resource does not exist'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
