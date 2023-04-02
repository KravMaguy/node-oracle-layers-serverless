const serverless = require("serverless-http");
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Connection } from "oracledb";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 9000;
const oracledb = require("oracledb");

let connection: Connection;
const createConnection = async () => {
  try {
    console.log("creating connection");
    connection = await oracledb.getConnection({
      user: "ADMIN", // Replace this to your own
      password: process.env.password, // Replace this to your own
      connectString: "ylbzwjjlc3ab5q24_high", // Replace this to your own
    });
    console.log(oracledb);
  } catch (e) {
    console.log("connection error:", e);
  } finally {
    if (connection) {
      try {
        console.log("leave the conn open");
        // await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

createConnection();

app.use("/", async (req: Request, res: Response, next) => {
  console.log("reached the route");
  const stmt = "select * FROM customers";
  if (connection) {
    try {
      const data = await connection.execute(stmt);
      console.log(JSON.stringify(data));
      const { rows } = data;
      if (rows && rows?.length > 0) {
        return res.status(200).json({
          response: rows,
        });
      } else {
        return res.status(200).json({
          response: "empty",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "error",
        error,
      });
    }
  }
  return res.status(400).json({
    message: "db conn not established",
  });
});

if (process.env.NODE_ENV === "development") {
  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}

module.exports.handler = serverless(app);
