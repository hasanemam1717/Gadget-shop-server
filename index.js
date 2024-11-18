const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//mongodb

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.9fglmuq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const userCollection = client.db("gadgetShop").collection("users");
const productCollection = client.db("gadgetShop").collection("products");

const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database connected successfully");
    // insertUser
    app.post("/users", async (res, req) => {
      const user = req.body;
      console.log(user);
      return;
      const result = await userCollection.insertOne(user);
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ massage: "User already exist" });
      }
      res.send(result);
    });
  } catch (error) {
    console.log(error?.name, error?.massage);
  }
};

dbConnect();
//  api
app.get("/", (req, res) => {
  res.send("Server is running");
});

//jwt api generate
app.post("/authentication", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }

  // Generate token
  const token = jwt.sign({ email }, process.env.ACCESS_key_token, {
    expiresIn: "10d",
  });

  res.status(200).send({ token });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
