exports.user = 
        function (){
             return {
                id:'',//if this user is the creator of giftbox, id begins with 0, otherwise 1
                name:'',
                email:'',
                letter:'',
                receiver_id:'',
                invitation_sent: false,
             }
         };

exports.giftbox = 
        function (){
             return {
                id:'',
                users:[],
                creation_date:'',
                user_max_num:50,
             }
        };
