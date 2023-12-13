 class appError extends Error{
    constructor(status,message){
        super();
        this.status= status;
        this.message= message;
    }
 }

 const wrapAsync= (fn)=>{
    return function(req,res,next){
        fn(req,res,next).catch(e=>next(e));
    }
};
 module.exports={appError,wrapAsync};