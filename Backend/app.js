require('dotenv').config();
const express = require("express");
const app = express();
const Http = require("http");
const connectDB = require('./src/config/db');
const cors = require("cors");
const bodyParser = require('express').json;
connectDB();
const path = require("path");

const server = Http.createServer(app);
const port = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//API
app.use('/api', require('./src/routes/routes'));

//Not Found
app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
});

process.on("uncaughtException", (e) => console.error(e));

server.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
    console.log("Date : ", new Date().toLocaleString());
})