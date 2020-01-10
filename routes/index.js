

exports.index=function(req,res,next){

         res.send( req.pages.index() );
  
     };

exports.error={
     not_found: function (req,res,next){
         res.send( req.pages.msg({ 

                                  msg:'Error',
                                  sub_msg:'404, Not Found'
                                         
                                  }));
     }

}

exports.giftbox = require('./giftbox');
exports.user = require('./user');
