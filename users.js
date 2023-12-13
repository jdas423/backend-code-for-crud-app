const express=require('express');
const { wrapAsync, appError } = require('./errorhandling');
const router=express.Router();
const {User,validateUser,validateUpdation}=require('./usersmodel');
let lastIndex;

User.find({}).then(users => {
    lastIndex= users.length;
    console.log(lastIndex)
})
.catch(err => {
    console.error('Could not get users...',err)
})

const passer=(validateUser)=>{
    return (req,res,next)=>{

        req.body.id=lastIndex+1;
        try{
          validateUser(req,res);
          lastIndex++;
        }
        catch(err){
            next(err);
        }
        return next();    
    }
}

const updater=(validateUpdation)=>{
    return (req,res,next)=>{
        try{
          validateUpdation(req,res);
        }
        catch(err){
            next(err);
        }
        return next();    
    }
}

router.get("/",wrapAsync(async(req,res,next)=>{
    if(!Object.keys(req.query).length){
        const sInd= 1;
        const eInd= 10;   
        const users= await User.find({$and : [{id: {$gte: sInd}},{id: {$lte: eInd}}]});
        return res.status(200).json(users);
    }
    if(!req.query.hasOwnProperty("pages")) throw new appError(400,"Invalid query");
    next();  
}))



router.get("/",wrapAsync(async(req,res,next)=>{
    const {pages} = req.query;
    if(!pages){
        res.redirect("/api/users?pages=1");
    }
    if(pages<1){
        throw new appError(400,"Invalid Page Number");
    }
    const sInd= (pages-1)*10+1;
    const eInd= pages*10;   
    const users= await User.find({$and : [{id: {$gte: sInd}},{id: {$lte: eInd}}]});
    if(!users.length) throw new appError(404,"page Not Found");
    res.status(200).json(users);
}))

router.get("/:id",wrapAsync(async(req,res,next)=>{
    let {id} = req.params;
    id=Number(id);
    if(id<1){
        throw new appError(400,"Invalid Id Number");
    }
    const users= await User.find({id : id});
    if(!users.length) throw new appError(404,"User Not Found");
    res.status(200).json(users);
}))


router.post("/",passer(validateUser),wrapAsync(async(req,res,next)=>{
    const user= new User({...req.body});
    await user.save();
    res.status(200).json(user);
}))


router.put("/:id",updater(validateUpdation),wrapAsync(async(req,res,next)=>{
     let {id} = req.params;
     id=Number(id);
     const users= await User.find({id : id});
     if(!users.length) throw new appError(404,"User Not Found");
     const keys=Object.keys(req.body);
     for (const key of keys) {
        await User.updateOne({id : id}, {$set : {[key] : req.body[key]}});
      }
     res.status(200).send("Updated");
}))

router.delete("/:id",async(req,res,next)=>{
    try{
        let {id} = req.params;
        if(id>lastIndex) throw new appError(404,"User Not Found");
        const users= await User.find({id : {$gte : id}}).sort({id : 1});
        await User.deleteOne({id : id});
        for(let user of users){
            if(user.id !== Number(id)){
               await User.updateOne({_id : user._id},{$set:{id : user.id-1}});
            }
        }
        lastIndex--;
        res.status(200).send("Deleted");
    }
    catch(err){
        next(err);
    }
})


module.exports= router
