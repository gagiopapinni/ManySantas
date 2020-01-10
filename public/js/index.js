$(document).ready(function (){
   
     for(let i of [1,2,3]){
        setTimeout(()=>{
               $('#item'+i).addClass('show');
        },500*i)

     }


})
