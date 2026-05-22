const express = require("express");

const router = express.Router();

const users = [];



router.post("/register", (req, res) => {

  const {
    name,
    email,
    password,
  } = req.body;



  const userExists =
    users.find(
      user => user.email === email
    );



  if (userExists) {

    return res.status(400).json({
      message: "User already exists",
    });

  }



  users.push({
    name,
    email,
    password,
  });



  res.status(201).json({
    message:
      "User registered successfully",
  });

});



router.post("/login", (req, res) => {

  const {
    email,
    password,
  } = req.body;



  const user =
    users.find(
      user =>
        user.email === email &&
        user.password === password
    );



  if (!user) {

    return res.status(401).json({
      message: "Invalid credentials",
    });

  }



  res.status(200).json({
    message: "Login successful",
  });

});



module.exports = router;