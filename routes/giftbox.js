const crypto = require('crypto'),
      assert = require('assert'),
      db_templates = require('./db_templates'),
      mail = require('./mail');



exports.shuffle = async function (req,res,next){
       try{
          assert.equal(req.gbox.users[0].receiver_id.length, 0);//refuse if shuffled
          assert.equal(req.user.id[0], '0');

          let users = [],
              id_pool = [];

          for(let u of req.gbox.users)
              if(u.name){//only them who accepted invitation
                users.push(u);
                id_pool.push(u.id);
              }
          assert(users.length > 1);
          req.gbox.users = users;

          for(let u of users){
               let found;
               do{
                   const random_idx = Math.round(Math.random()*(id_pool.length-1));
                   
                   found = (u.is != id_pool[random_idx]);
                   if(found){
                      u.receiver_id = id_pool[random_idx];
                      id_pool.splice(random_idx,1);
                   }
               }while(!found);
          }
           
          let r = await req.db.collection('giftboxes').replaceOne({id:req.gbox.id},req.gbox);
          assert.equal(r.matchedCount,1);
          assert.equal(r.modifiedCount,1); 
          
          res.sendStatus(200);
       }catch(e){
          console.log(e.stack);
          res.sendStatus(404);
       }
}
exports.delete = async function (req,res,next){
       try{
         assert.equal(req.user.id[0],'0');

         let r = await req.db.collection('giftboxes').deleteOne({id:req.gbox.id});
         assert.equal(1, r.deletedCount);

         res.sendStatus(200);
       }catch(e){
         console.log(e.stack);
         res.sendStatus(404);
       }      
}
exports.created = async function (req,res,next){
       res.status(200).send(req.pages.created())
}

exports.not_created = async function (req,res,next){
       res.status(200).send(req.pages.not_created())
}
exports.create = async function (req,res,next){
       const user = db_templates.user();
       user.email = req.body.email;
       user.name = req.body.name.replace(/\s/g,'')+' '+req.body.surname.replace(/\s/g,'');
       user.id = '0'+crypto.randomBytes(10).toString('hex').slice(1);
       
       const gbox = db_templates.giftbox();
       gbox.id = crypto.randomBytes(10).toString('hex');
       gbox.creation_date = new Date();
       gbox.users.push(user);
        
       try{
         assert(user.email.length <= 254 && user.name.length <= 25);

         let r = await req.db.collection('giftboxes').insertOne(gbox);
         assert(r.insertedCount,1);

         r = mail.send(user.email,process.env.DOMAIN,req.pages.onCreation({
                          link: "http://"+process.env.DOMAIN+"/"+gbox.id+'.'+user.id,
                          name: req.body.name,
                }));
         assert(!r.error);

         user.invitation_sent = true;
         await req.db.collection('giftboxes').replaceOne({id:gbox.id},gbox);
        
         res.status(200).redirect('/created');

       }catch(err){
          console.log('creation of giftbox did not succeed '+err.stack);
          res.status(404).redirect('/not-created');
       }
}







