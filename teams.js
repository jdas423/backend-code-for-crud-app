const express = require('express');
const router = express.Router();
const { wrapAsync, appError } = require('./errorhandling');
const {User, Team} = require('./usersmodel');
let lastIndex;

let count= async()=>{
    lastIndex = await Team.countDocuments({})
    console.log(lastIndex)
}

count()

router.get('/:id', wrapAsync(async (req, res) => {
    const {id} = req.params;
    if(!id) throw new appError(400, "invalid id");
    const team = await Team.findOne({id: id}).populate('names');
    res.json(team);
}))

router.post('/', wrapAsync(async (req, res) => {
    let b=0,begin=0;
    let ids=JSON.parse(req.body.ids);
    if(!ids || ids.length===0) throw new appError(404,"invalid id");
    let domain=[], available=undefined,users=[];
    for(let id of ids){
        const user=await User.findOne({id : id})
        users.push(user)
        if(!domain.filter(val=>{
           return val === user.domain }).length)
        {
            domain.push(user.domain)
            if(!begin) available=user.available;
            else if(available !== user.available){
                b=1;
                break;
            } 
        }
        else {
            b=1;
            break;
        }  
        begin=1;
    }
    if(b==1) throw new appError(400,"Data invalid")
    const newTeam= new Team({id:lastIndex+1})
    users.forEach((user)=>{
       newTeam.names.push(user)
    })
    await newTeam.save();
    lastIndex++;
    res.send("Added")
}))

module.exports= router;