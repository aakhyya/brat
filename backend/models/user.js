const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required!'],
            unique: true,
            lowercase: true,
            trim: true,
            //mongoose validation, not JS -> runs before data hits MongoDB. Before save(), create() etc.
            match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, // syn: /regxstr/
                'Please enter a valid email address!'],
        },
        password: {
            type: String,
            required: [true, 'Password is required!'],
            trim: true,
            minlength: [6, 'Minimum password length must be 6!'],
            select: false, // exclude by default from queries
        },
        profile: {
            displayName: {
                type: String,
                required: [true, 'Name is required!'],
                trim: true,

            },
            avatar: {
                type: String,
                default: null,
            },
            joinDate: {
                type: Date,
                default: Date.now(),
            },
        },
        //Taste Vector
        tasteVector: {
            version: { // v1 will judge based on 1 criteria, if another criteria added, we'll use v2. 
                type: Number,
                default: 1,
            },
            attributes: { // (string,number) => "genre:thriller": 0.82
                type: Map,
                of: Number,
                default:() => new Map(),
            },
            confidence: { // How sure are we about every attribute, prevents “one movie ruined my feed” syndrome
                        // Eg.: attributes: {"aesthetic:arthouse": 0.6},
                        // confidence: {"aesthetic:arthouse": 0.2} => early signal, don't overtrust.
                type: Map,
                of: Number,
                default: () => new Map(),
            },
            lastUpdated: { //decay logic (older tastes matter less)
                type: Date,
                default: Date.now,
            },
            updateCount: { //updateCount<5 → onboarding phase; updateCount>50 → strong personalization allowed
                type: Number,
                default: 0,
            },
        },
        onboardingCompleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

//Password Hashing
userSchema.pre("save",async function(){
    if(!this.isModified('password')){
        return;
    }
    try{
        const hashedPassword=await bcrypt.hash(this.password,10);
        this.password=hashedPassword;
    }
    catch(err){
        console.log(`Error: ${err}`);
    }
});

//Password Comparing
userSchema.methods.comparePassword=async function (userPassword){
    return await bcrypt.compare(userPassword,this.password);
};

//Generate JWT
userSchema.methods.generateAuthToken=function (){
    return jwt.sign(
        {id:this._id},
        process.env.JWT_SECRET,
        {expiresIn:'7d'}
    );
};

//Excluding password from JSON responses
userSchema.methods.toJSON = function () { //custom exit gate for user data
  const user = this.toObject(); //converts current db doc to mutable obj
  delete user.password; // never leak passwords, even if it's hashed
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;