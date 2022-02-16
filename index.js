const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
try {
    mongoose.connect("mongodb://localhost:27017/test");
} catch (error) {
    handleError(error);
}

const userSchema = {
    prograd_id: {type: String, default: () => nanoid(8)},
    name: {type: String, required: "Name required"},
    email: {type: String, required: "Email required"},
    age: {type: Number, min:1, max:80},
    squad: {type: Number}
}

const USER = mongoose.model("user", userSchema)

// Returns an array users
app.route("/api/users")
.get(async function(req, res){
    USER.find((err, foundArray)=>{
        if(!err){
            res.send(foundArray);
        }else{
            res.status(500).send({ errorMessage: "The users information could not be retrieved." })
        }
    })
})
// Creates a user using the information sent inside the request body.
.post(async function(req, res){
    const newUser = new USER({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        prograd_id: req.body.prograd_id,
        squad: req.body.squad
    });

    newUser.save(err=>{
        if(!err){
            res.status(201).send(newUser);
        }else{
            res.status(400).send({errorMessage: "Please provide name and email for the user." });
        }
    });
});


app.route("/api/users/:id")
// Returns the user object with the specified id.
.get(async function(req, res){
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send({ message: "The user with the specified ID does not exist." })
    }
    USER.findOne({_id: req.params.id}, (err, foundUser)=>{
        if(foundUser){
            res.send(foundUser);
        }else{
            res.status(500).send({ errorMessage: "The user information could not be retrieved." })
        }
    })
})
// Updates the user with the specified id using data from the request body. Returns the modified user
.put(async function(req, res){
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send({ message: "The user with the specified ID does not exist." })
    }

    USER.findByIdAndUpdate({_id:req.params.id}, {
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            prograd_id: req.body.prograd_id,
            squad: req.body.squad
        }, {overwrite:true, new:true}, (err, user)=>{
        if(!err){
            res.status(200).send(user);
        }else{
            res.status(500).send({ errorMessage: "The user information could not be modified." })
        }
    })
})
// Removes the user with the specified id and returns the deleted user.
.delete(async function(req, res){
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send({ message: "The user with the specified ID does not exist." })
    }
    USER.deleteOne({_id: req.params.id}, err=>{
        if(!err){
            res.send("Successfully DELETED "+req.params.id);
        }else{
            res.status(500).send({ errorMessage: " The user could not be removed" })
        }
    })
});




app.listen(3000, ()=>console.log("Server online at port:3000"));