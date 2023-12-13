const mongoose= require('mongoose');
const {appError}= require('./errorhandling');
const { Schema, model}= mongoose;
const Joi = require('joi');

const UserSchema= new Schema({
    id: {
        type:Number, 
        required: true, 
    },

    first_name: {
       type: String,
    },

    last_name: {
        type: String,
     },
     
    email : {
        type: String,
     },
    
     gender: {
        type: String,
     },

     avatar: {
        type: String,
     },

     available: {
        type: Boolean,
     },
     domain:{
        type: String,
     }
})

const User= model('User', UserSchema);
const validateUser= (req,res)=> {
    const schema= Joi.object({
        id: Joi.number().required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required(),
        gender: Joi.string().required(),
        avatar: Joi.string().required(),
        available: Joi.boolean().required(),
        domain:Joi.string().required()
    });
    const {error}= schema.validate(req.body);
    if(error){
        throw new appError(400,"Data required");
    }
}

const validateUpdation=(req,res)=>{
    const schema= Joi.object({
        first_name: Joi.string(),
        last_name: Joi.string(),
        email: Joi.string(),
        gender: Joi.string(),
        avatar: Joi.string(),
        available: Joi.boolean(),
        domain:Joi.string()
    }).or("first_name","last_name","email","gender","avatar","available","domain");
    const {error}= schema.validate(req.body);
    if(error){
        throw new appError(400,"Data required");
    }
}



module.exports= { User , validateUser, validateUpdation};
