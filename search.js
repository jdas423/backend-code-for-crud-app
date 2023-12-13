const express=require('express');
const { wrapAsync, appError } = require('./errorhandling');
const router=express.Router();
const {User}=require('./usersmodel');

router.get('/',wrapAsync(async (req,res)=>{
    const {domain,gender,available,firstName, lastName}=req.query;
    const q = {};
    if (firstName) q.first_name = new RegExp(`^${firstName}`, 'i');
    if (lastName) q.last_name = new RegExp(`^${lastName}`, 'i');    
    if (domain) q.domain = new RegExp(`^${domain}$`, 'i');
    if (gender) q.gender = new RegExp(`^${gender}$`, 'i');
    if (available) q.available = available.toLowerCase() === 'true';
    if (Object.keys(q).length === 0) throw new appError(400, "invalid search");
    const users = await User.find(q);
    res.json(users)
}))

router.get('/nameSearch',wrapAsync(async (req,res)=>{
    const {firstName,lastName}= req.query;
    const q={};
    if(firstName) q.first_name=new RegExp(`^${firstName}`,'i');
    if(lastName) q.last_name=new RegExp(`^${lastName}`,'i');
    if (Object.keys(q).length === 0) throw new appError(400, "invalid search");
    const users = await User.find(q);
    res.json(users)
}))

module.exports=router;

