const assert = require('assert'),
      crypto = require('crypto'),
      db_templates = require('./db_templates'),
      mail = require('./mail');


exports.complete_info = async function (req,res,next){
           
      try{     
          assert(!req.user.name.length && req.body.name.length+req.body.surname.length <= 60);      
          req.user.name = req.body.name.replace(/\s/g,'')+' '+req.body.surname.replace(/\s/g,'');
        
          let r = await req.db.collection('giftboxes').replaceOne({id:req.gbox.id},req.gbox);
          assert.equal(r.matchedCount,1);
          assert.equal(r.modifiedCount,1);

          res.status(200);
          res.redirect('/'+req.gbox.id+'.'+req.user.id);       
      }catch(e){
          console.log(e.stack);
          res.status(404).redirect('/not-found');
      }

}

exports.invite = async function (req,res,next){
      let new_user = db_templates.user();
          new_user.email = req.body.email;
          new_user.id = '1'+crypto.randomBytes(10).toString('hex').slice(1);

      try{     
          assert(req.gbox.users.length <= req.gbox.user_max_num);      
          assert(!req.gbox.users[0].receiver_id);
          assert.equal(req.user.id[0],'0');


          for(u of req.gbox.users)
              if(u.email === new_user.email){
                   res.status(200).redirect('/'+req.gbox.id+'.'+req.user.id);
                   return;
              }

          req.gbox.users.push(new_user);

          let r = await req.db.collection('giftboxes').replaceOne({id:req.gbox.id},req.gbox);
          assert.equal(r.matchedCount,1);
          assert.equal(r.modifiedCount,1);

          r = await mail.send(new_user.email,process.env.DOMAIN,req.pages.onInvitation({
                          link:  "http://"+process.env.DOMAIN+"/"+req.gbox.id+'.'+new_user.id,
                          name:user.name,
                    }));

          assert(!r.error);

          new_user.invitation_sent = true;
          await req.db.collection('giftboxes').replaceOne({id:req.gbox.id},req.gbox);

          res.status(200).redirect('/'+req.gbox.id+'.'+req.user.id);
      }catch(e){
          console.log(e.stack);
          res.status(404).redirect('/not-found');
      }
}


exports.delete = async function(req,res,next){
       const email = req.params.email_to_be_deleted;

       try{
          assert(!req.gbox.users[0].receiver_id);//not shuffled yet
          assert.equal(req.user.id[0],'0');//only creator should be able to delete users
          assert.notEqual(req.user.email,email);//creator should not be able to delete himself

          for(let i=0;i<req.gbox.users.length;i++)
            if(req.gbox.users[i].email === email){  
              req.gbox.users.splice(i,1);
              break;
            }

          let r = await req.db.collection('giftboxes').replaceOne({id:req.gbox.id},req.gbox);
          assert.equal(r.matchedCount,1);
          assert.equal(r.modifiedCount,1);

          res.sendStatus(200);
       }catch(e){
          console.log(e.stack)
          res.sendStatus(404);
       }
}
 
exports.update_letter = async function (req,res,next){    
       const letter = req.body.letter; 

       try{
           assert(letter.length <= 360 && letter.length >= 50);
           if(letter !== req.user.letter){
              req.user.letter = letter;
              const r = await req.db.collection('giftboxes').replaceOne({id:req.gbox.id},req.gbox)
              assert.equal(r.matchedCount,1);
              assert.equal(r.modifiedCount,1);
           }
       }catch(e){
           console.log(e.stack)
           res.status(404).redirect('/not-found');
       }

       res.redirect('/'+req.gbox.id+'.'+req.user.id);       
}


exports.page = async function (req,res,next){
     
     if(!req.user.name){
         res.status(200).send(req.pages.complete_info({giftbox_id: req.gbox.id,user_id: req.user.id,})); 
         return;
     }

     let receiver = null;
     for(let u of req.gbox.users)
            if(req.user.receiver_id === u.id) receiver=u;
              

     res.status(200).send(req.pages.user({
         user: req.user,
         gbox: req.gbox,
         receiver: receiver,
     }));

     
}





