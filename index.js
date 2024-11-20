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

// token verification 
const tokenJwt =(req,res,next)=>{
  const authentication =req.headers.Authorization;
  if(!authentication){
    res.send({massage:"No token"})
  }
  const token = authentication.split(' ')[1];
  jwt.verify(token.process.env.ACCESS_key_token,(err,decode)=>{
    if(err){
      res.send({massage:'Invalid token'})
    }
    req.decoded(decode)
    next()
  })

}

// verify seller
const verifySeller =async(req,res,next) =>{
  const email = req.decoded.email;
  const query  = {email:email}
  const user = await userCollection.findOne(query);
  if(user?.role === !"seller"){
    return res.send({massage:'No access without seller role'})
  }
  next()

}

//mongodb

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.9fglmuq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const userCollection = client.db("gadget-shop").collection("users");
const productCollection = client.db("gadget-shop").collection("products");

const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database connected successfully");

    // getUser
    app.get("/user/:email", async (req, res) => {
      const query = { email: req.params.email };
      console.log(query);
      const user = await userCollection.findOne(query);
      console.log(user);
      res.send(user);
    });
    // insertUser
    app.post("/userData", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ massage: "User already exist" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // add products
    app.post('/addProducts',tokenJwt,verifySeller, async(req,res)=>{
      const product = req.body;
      console.log(product);
      const result = await productCollection.insertOne(product)
      res.send(result)
    })
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
