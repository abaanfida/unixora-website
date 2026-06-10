const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/fyp";
const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key";
const groqApiKey = process.env.GROQ_API_KEY || "";
const groqSttModel = process.env.GROQ_STT_MODEL || "whisper-large-v3-turbo";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    jwtSecret,
    { expiresIn: "7d" }
  );
};

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: "30mb" }));

const mimeTypeToExtension = (mimeType = "") => {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
};

const transcribeAudioWithGroq = async ({ audioBuffer, mimeType, language }) => {
  if (!groqApiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const formData = new FormData();
  const extension = mimeTypeToExtension(mimeType);
  const audioBlob = new Blob([audioBuffer], { type: mimeType || "audio/webm" });
  formData.append("file", audioBlob, `voice-input.${extension}`);
  formData.append("model", groqSttModel);
  formData.append("response_format", "json");
  formData.append("temperature", "0");

  if (language) {
    formData.append("language", language);
  }

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq transcription failed: ${response.status} ${errorText}`);
  }

  return response.json();
};

mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { firstName, lastName = "", email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({
          message:
            "Password must be at least 8 characters and include a number and a special character.",
        });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already exists." });
    }
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password." });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Email not found." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Verify JWT token
app.get("/api/auth/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return res.status(200).json({
      valid: true,
      user: {
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.email,
      },
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
});

app.post("/api/voice/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm", language = "en" } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ message: "Missing audio payload." });
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");

    if (audioBuffer.length === 0) {
      return res.status(400).json({ message: "Empty audio payload." });
    }

    const transcription = await transcribeAudioWithGroq({ audioBuffer, mimeType, language });
    return res.status(200).json({ text: transcription.text || "" });
  } catch (err) {
    console.error("Voice transcription error:", err.message);
    return res.status(500).json({ message: "Unable to transcribe audio right now." });
  }
});

app.get("/", (req, res) => {
  res.send("Auth service running");
});

// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
