const express = require("express");
const app = express();
const {v4: uuidv4 } =require("uuid")
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post("/payment",(req,res)=>{
  const {product,token}=req.body;
  console.log("Product",product)
  console.log("Price",product.price);
  const {idempotencyKey} = uuidv4();
  return stripe.customers.create({
    email:token.email,
    source:token.id
  })
  .then(customer =>{
    stripe.charges.create({
      amount:product.price * 100,
      currency:"usd",
      customer:customer.id,
      receipt_email:token.email,
      description:`purchase of ${product.price}`,
      shipping:{
        name:token.card.name,
        address:{
          country:token.card.address_country
        }
      }
    },(idempotencyKey));
  })
  .then(result => res.status(200).json(result))
  .catch(err => console.log(err))
})
app.listen(process.env.PORT || 8081, () => {
   console.log("Server started...");
 });