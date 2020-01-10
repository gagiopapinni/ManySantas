require('dotenv').config();

const express = require('express'),
      mongodb = require('mongodb'),
      path = require('path'),
      fs = require('fs'),
      routes = require('./routes/index'),
      pug = require('pug'),
      bodyParser = require('body-parser'),
      MongoClient = require('mongodb').MongoClient,
      assert = require('assert'),
      dictionary = require('./dictionary'),
      locale = require('locale');

const pages = (()=>{

        let compiled = {
            index: pug.compileFile("./pages/index.pug"),
            user: pug.compileFile("./pages/user.pug"),
            complete_info: pug.compileFile('./pages/complete_info.pug'),
            msg: pug.compileFile('./pages/msg.pug'),
            created: pug.compileFile('./pages/created.pug'),
            not_created: pug.compileFile('./pages/not_created.pug'),
            invite_email: pug.compileFile('./pages/email/invitation.pug'),
            created_email: pug.compileFile('./pages/email/creation.pug'),
        };
   
        return (lang)=>{
           let res = {},
               dict = dictionary[lang];

           for(let d of Object.keys(compiled))
               res[d] = (locals)=>compiled[d](Object.assign({},locals,dict[d]));
    
           return res;
        }

        
})();

let db = null;

const app = express();

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(locale(Object.keys(dictionary),'en'));

app.use(function (req,res,next){
       req.db = db; 
       req.pages = pages(req.locale); 
       
       return next();                
})


app.use('/:giftbox_id.:user_id', async function identifyUserAndGiftbox (req,res,next){

      const giftbox_id = req.params.giftbox_id,
            user_id = req.params.user_id;
      let gbox = user = null;
      try{
          gbox = await db.collection('giftboxes').findOne({id:giftbox_id});
          assert.notEqual(gbox,null);

          for(let u of gbox.users)
             if(u.id === user_id)  
              {  
                user = u; break; 
              } 
          assert.notEqual(user,null);

          req.gbox = gbox;
          req.user = user;
          next();

      }catch(e){
          console.log(e.stack);
          res.status(404).redirect('/not-found');
      }

})

app.get('/',routes.index);
app.get('/:giftbox_id.:user_id',routes.user.page);
app.get('/created',routes.giftbox.created);
app.get('/not-created',routes.giftbox.not_created);
app.get('/not-found',routes.error.not_found);

app.post('/create',routes.giftbox.create);
app.post('/:giftbox_id.:user_id/update-letter',routes.user.update_letter);
app.post('/:giftbox_id.:user_id/invite-user', routes.user.invite);
app.post('/:giftbox_id.:user_id/complete-info', routes.user.complete_info);
app.put('/:giftbox_id.:user_id/shuffle',routes.giftbox.shuffle);
app.delete('/:giftbox_id.:user_id/delete-user/:email_to_be_deleted', routes.user.delete);
app.delete('/:giftbox_id.:user_id/delete-giftbox', routes.giftbox.delete);
app.all('*',routes.error.not_found);

(async function() {
  const client = new MongoClient(process.env.MONGOHQ_URL,{useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();

    db = client.db(process.env.DB_NAME);
    app.listen(process.env.PORT);
    
    console.log("Running on port "+ process.env.PORT);
   
  } catch (err) {

    console.log(err.stack);

  }
 
}())










