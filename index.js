const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "Home")));

const dbPath = path.join(__dirname, "database.db");
let db = null;

const API_URL = "http://qa-gb.api.dynamatix.com:3100/api/applications";

// Initialize Database and Server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Evaluate checklist
const evaluateChecklist = (data) => {
  const { isValuationFeePaid, isUkResident, riskRating, ltv } = data;
  const status =
    isValuationFeePaid &&
    isUkResident &&
    riskRating === "Medium" &&
    parseInt(ltv) < 60
      ? "Passed"
      : "Failed";
  return {
    status,
    details: { isValuationFeePaid, isUkResident, riskRating, ltv },
  };
};

// Fetch data from API and evaluate
const fetchAndEvaluate = async () => {
  try {
    const { data: applications } = await axios.get(API_URL);
    if (Array.isArray(applications)) {
      return applications.map((app) => ({
        id: app.id,
        ...evaluateChecklist(app),
      }));
    } else {
      console.error("API response is not an array");
      return [];
    }
  } catch (error) {
    console.error(`API Fetch Error: ${error.message}`);
    return [];
  }
};

// API Endpoints
app.get("/checklist", async (req, res) => {
  try {
    const results = await fetchAndEvaluate();
    if (results.length > 0) {
      res.status(200).json({ results });
    } else {
      res.status(400).json({ message: "No data found or API error" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/htmlPage", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "app.html"));
});

app.get("/", (req, res) => {
  res.send(
    "Welcome! Use '/checklist' to fetch data and '/htmlPage' for the frontend page."
  );
});

module.exports = app;
