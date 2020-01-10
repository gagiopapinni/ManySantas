
$(document).ready(function(){

  $('button.user-delete').on('click', deleteUser );
  $('#letter').on('input', onLetterInput);
  $('#shuffle').on('click', shuffle);
  $('#deleteGiftbox').on('click', deleteGbox);

})



function alert(id){
     $(id).addClass('show');
     window.setTimeout(()=>{
         $(id).removeClass('show');
     },2000)
}


function shuffle(){
    let url = window.location.href.split('/');
    $.ajax({
      url: '/'+url[url.length-1]+'/shuffle',
      type: 'PUT',
      success: function(data, status, xhr) {
          document.location.reload(true);
      },
      error: function(xhr, status, error) {
          alert('#shuffle-error');
      }
      
    })

}
function onLetterInput(e){
    const text = $('#letter').val().replace(/\n/g,'');
    $('#letter').val(text);
    $('#letterSend').collapse('show');
    $('#letterSizeCounter')[0].textContent = text.length+'/350';
   
}
function deleteGbox (e){
    let url = window.location.href.split('/');
    $.ajax({
      url: '/'+url[url.length-1]+'/delete-giftbox',
      type: 'DELETE',
      success: function(data, status, xhr) {
          $(document.body).html('<h4> Deleted </h4>');
      },
      error: function(xhr, status, error) {
          alert('#delete-giftbox-error');
      }
      
    })

}
function deleteUser(e){
    let url = window.location.href.split('/');
    $.ajax({
      url: '/'+url[url.length-1]+'/delete-user/'+e.target.getAttribute('email'),
      type: 'DELETE',
      success: function(data, status, xhr) {
          document.location.reload(true);
      },
      error: function(xhr, status, error) {
          alert('#delete-user-error');
      }
      
    })
    
}


