function OnStart()
{
 
 //Set notification options
var img = "Img/bcn-icon.png";
notify = app.CreateNotification();
notify.SetLargeImage( img );

}

function checkOpt() {
 try {
    var fldr = app.GetPrivateFolder("bcnSettings");
    var setNotice = app.ReadFile( fldr + "/service.txt");
    //var setAlarm = app.ReadFile( fldr + "/alarm.txt");
    
      if (setNotice == "checked") {
            var myRepeat = setInterval(updateNotice, 10000);
            updateNotice();
      } else {
           notify.Cancel( "priceNotice" );
           clearInterval("myRepeat");
      }
}
 catch(err) {
     app.Debug(err);
 }
      
}

function OnMessage( msg )
{
 try {
if( msg=="options" ) checkOpt();
else if( msg=="stop" ) notify.Cancel("priceNotice");
 }
 catch(err) {
   app.Debug(err);  
 }
}

 function updateNotice()
 {
     //Get price data from API
    var url = "https://min-api.cryptocompare.com/data/price?fsym=BCN&tsyms=USD&extraParams=Bytecoin_Toolkit";
    var httpRequest = new XMLHttpRequest(); 
    httpRequest.onreadystatechange = function() { HandleReply(httpRequest); };   
    httpRequest.open("GET", url, true); 
    httpRequest.send(null); 
  
 }
 
 function HandleReply( httpRequest ) 
{ 
    if( httpRequest.readyState==4 ) 
    { 
        //If we got a valid response. 
        if( httpRequest.status==200 ) 
        { 
             //Parse price data
            bcnData = JSON.parse( httpRequest.responseText );
            bcnPrice = bcnData['USD'];
            
             //Update Notification
            notify.SetMessage("Bytcoin Price", "Bytecoin Price", "BCN~USD: " + bcnPrice); 
            notify.Notify( "priceNotice" );  
            
        } 
        //An error occurred 
        else 
           app.ShowPopup( "Error: " + httpRequest.status + httpRequest.responseText, "Bottom" ); 
    } 
}
 