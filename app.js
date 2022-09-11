/* 
------------------------------------------------
CS207 Applied Databases Practicum
Project by Group 6 : Campus Returning Scheduler
Main Code file
------------------------------------------------
*/

// Require the necessary libraries
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv");
const multer = require("multer");


// creating an express server
const app = express();


// Setting up the view engine and static locations
app.use(express.static("public"));
app.use(express.static("uploaded_docs"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");


// Configure file storage mechanism from multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploaded_docs/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.rollno + '__' + String(Date.now()) + 
              '.' + file.mimetype.split('/')[1]);
  }
})
var upload = multer({ storage: storage });


// Connecting to local 'ADP-Project' datbase
mongoose.connect("mongodb://localhost:27017/ADP-Project", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// console.log("Debug : Database ID : ", String(process.env.PASS));
// Use below line in deployment environment, with a specific database connection
/* mongoose.connect(String(process.env.PASS),
                    { useNewUrlParser: true , useUnifiedTopology: true}); */


// Creating a database schema
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String
  },
  fname : {type : String, default : ""},
  lname : {type : String, default : ""},
  address : {type : String, default : ""},
  city : {type : String, default : ""},
  state : {type : String, default : ""},
  rollno : {type : String, default : ""},
  program : {type : String, default : ""},
  phone : {type : Number, default : 0},
  inlineRadioOptions : {type : String, default : ""},
  date1 : {type : Date, default :"2000-11-11"},
  date2 : {type : Date, default :"2000-11-11"},
  reason : {type : String, default : ""},
  upload : {type : String, default : ""},
  uploadType : {type : String, default : ""}
});

// Creating a collection of Users and creating user strategy for passport
const User = mongoose.model("User", userSchema);
var uName;


///////////////////////////////////////////////////////////////////
/////////// All the access and redirect routes below///////////////
///////////////////////////////////////////////////////////////////

// HTTP "GET" requests to load a page based on the given path
// HTTP "POST" requests to submit form data
app.get("/", function (req, res) {
  res.render("index_login.ejs", {msg:""});
});

app.get("/otp", function(req,res){
  res.render("otp.ejs", {msg:""});
})

app.get('/reset', function(req,res){
  res.render('reset.ejs', {msg : ""});
})

// Login form data posted here
app.post("/login", function (req, res) {
  uName = req.body.email;
  var pwd = req.body.password;
  const newUser = new User({
    userName: uName,
    password: pwd,
  });
  User.find({ userName: uName}, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser.length == 1) {    // The user exists in the database
                                      // (Has registered before)
        if (foundUser[0].password === pwd) {
          console.log("Password matches - logging in user ", uName);
          if(foundUser[0].fname == ""){
            res.render("request.ejs");    // If the user's data hasnt been saved
          }                               // Display the form
          else{
            res.render('viewdata.ejs', {data : foundUser[0]});
          }                               // Otherwise show the submitted data
          
        } 
        else {
            console.log(foundUser);       // Wrong password
          console.log("The password is a mismatch");
          res.render("index_login.ejs", {msg:"The password is incorrect!"})
        }
      } 
      else {
          newUser.save(function(err){ // The user doesn't exist
              if(err){                // Add the login details to the database
                  console.log(err);   // And then display the form
              }
              else{
                  console.log("New User created");
              }
          });
          res.render("request.ejs")
      }
    }
  });
});

// The return request form data posted here
app.post('/submit', upload.single('formFile'), function(req, res) {
  User.findOne({userName : uName}, function(err, foundUser){
    if(err){
      console.log(err);   // Check for the user's record in the database
    }                     // It would have been created at login
    else{
      foundUser.fname = req.body.fname;     // Save the data from the form
      foundUser.lname = req.body.lname;
      foundUser.address = req.body.address;
      foundUser.city = req.body.city;
      foundUser.state = req.body.state;
      foundUser.rollno = req.body.rollno;
      foundUser.program = req.body.program;
      foundUser.phone = req.body.phone;
      foundUser.inlineRadioOptions = req.body.inlineRadioOptions;
      foundUser.date1 = req.body.date1;
      foundUser.date2 = req.body.date2;
      foundUser.reason = req.body.reason;
      foundUser.upload = 
      (req.file.filename != undefined)? req.file.filename : '';
      foundUser.uploadType = 
      (req.file.mimetype != undefined)? req.file.mimetype : '';
      console.log("Info saved");
      console.log(req.body);
    }
    foundUser.save(function(err){
      if(err){
        console.log(err);
      }
      else{     // After storing details, display the saved data page
        console.log("Details are modified successfully");
        res.render('viewdata.ejs', {data : foundUser});
      }
    })
  })  
});


// Initiate a password reset
var otp;
app.post("/otp", function(req,res){
  
  studentMail = req.body.email;
  otp = Math.round(Math.random() * 1000000);  // Generate an OTP
  
  var msg = `
  <h3>This is your 6-digit OTP valid only for 10 minutes</h3>
  <h>${otp}</h>
  `;                                          // Content of email to be sent
  
  User.find({userName : studentMail}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser.length === 1){
        async function main() {
          /* IMPORTANT : Configure the password in the development environment's
          variables. Authentication will fail otherwise. The file is not tracked in git */
          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
            // host : "smtp.gmail.com",       /* For Gmail sender */
            // host: "smtp.mail.yahoo.com",  
            host: "smtp-mail.outlook.com", 
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              // user: "user@gmail.com",  /* For Gmail sender */
              user: "piyushverma0007@outlook.com", // generated ethereal user
              pass: process.env.mailPASS, // generated ethereal password
            },
            tls:{
              rejectUnauthorized:false
            },
          });
          /* NOTE : For sending from a Gmail account, additionally enable
          "Less Secure App Access" from Google settings to allow authentication
          via any script */
          
          // send mail with defined transport object
          let info = await transporter.sendMail({
            from: "OAS-IITMandi"+' <piyushverma0007@outlook.com>', // sender address
            to: studentMail, // list of receivers
            subject: "Reset", // Subject line
            html: msg, // html body
          });
          
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          return res.render("reset.ejs", {msg : ""});
        }
        main().catch(console.error);
      }
      else{
        res.render("otp.ejs", {msg: "This email is not registered"});
      }
    }
  })
  
})


// The password reset request posted here

app.post("/pwdreset", function(req,res){
  const uName = req.body.email
  var genOTP = req.body.otp;
  const newPwd = req.body.new;
  const cnf = req.body.cnf;
  if(genOTP == otp){
    if(newPwd === cnf){
      User.findOne({userName : uName}, function(err, foundUser){
        if(err){
          console.log(err);
        }
        else{
          foundUser.password = newPwd;
          foundUser.save(function(err){
            if(err){
              console.log(err);
            }
            else{
              console.log("Password changed succesfully");
            }
          })
        }
      });
      res.redirect('/');
    }
    else{
      res.render("otp.ejs", {msg:"The two passwords did not match"});
    }
  }
  else{
    res.render('reset.ejs', {msg: "Invalid OTP"});
  }
})


// Finally, *Start the server*
// The server will listen on port 3000 on localhost and random port when hosted online
app.listen(process.env.PORT||3000, function () {
  console.log("Server running on port 3000");
});

