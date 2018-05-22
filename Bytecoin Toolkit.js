//Backroom Studio native JS app templet

//Called when application is started.
function OnStart()
{    
    app.SetScreenMode( "Full" );
    //Lock screen orientation to Portrait.
    app.SetOrientation( "Portrait" );
    
	//Create the main app layout with objects vertically centered.
	layMain = app.CreateLayout( "Linear", "VCenter,FillXY");

	web = app.CreateWebView( 1, 1, null,"AutoZoom");
	web.SetOnProgress( web_OnProgress );
	web.LoadUrl( "main.html" );
	layMain.AddChild( web );
	


	//Create a drawer containing a menu list.
	CreateDrawer();
	
	//Add main layout and drawer to app.	
	app.AddLayout( layMain );
	app.AddDrawer( drawerScroll, "Left", drawerWidth )
	
 }

//Create the drawer contents.
function CreateDrawer()
{
    //Create a layout for the drawer.
	//(Here we also put it inside a scroller to allow for long menus)
	drawerWidth = 0.75;
    drawerScroll = app.CreateScroller( drawerWidth, 1 );
    drawerScroll.SetBackColor( "White" );
	layDrawer = app.CreateLayout( "Linear", "Left" );
	drawerScroll.AddChild( layDrawer );
	
	//Create layout for top of drawer.
	layDrawerTop = app.CreateLayout( "Absolute" );
	layDrawerTop.SetBackground( "Img/menu.jpeg" );
	layDrawerTop.SetSize( drawerWidth, 0.23 );
	layDrawer.AddChild( layDrawerTop );
	
	//Add an icon to top layout.
	var img = app.CreateImage( "Img/Bytecoin Toolkit.png", 0.20 );
	img.SetPosition( drawerWidth*0.06, 0.04 );
	layDrawerTop.AddChild( img );
	
	//Add bold text under the icon
	var txtUser = app.CreateText( "Bytecoin Toolkit",-1,-1,"Bold");
	txtUser.SetPosition( drawerWidth*0.07, 0.155 );
	txtUser.SetTextColor( "White" );
	txtUser.SetTextSize( 13.7, "dip" );
	layDrawerTop.AddChild( txtUser );
	
	//Add normal text under the bold text
	txtEmail = app.CreateText( "Bytecoin-Toolkit.ml");
	txtEmail.SetPosition( drawerWidth*0.07, 0.185 );
	txtEmail.SetTextColor( "#bbffffff" );
	txtEmail.SetTextSize( 14, "dip" );
	layDrawerTop.AddChild( txtEmail );
	
	//Create menu layout.
	var layMenu = app.CreateLayout( "Linear", "Left" );
	layDrawer.AddChild( layMenu );
	
    //Add a list to menu layout (with the menu style option).
    var listItems = "Home Screen::[fa-home],Paper Wallet::[fa-paperclip],BCN Miner::[fa-microchip],Live Data::[fa-bar-chart],QR Tools::[fa-qrcode],Hashrates::[fa-hashtag],Exchanges::[fa-line-chart],Mining Pools::[fa-sitemap],About::[fa-info-circle]";
    lstMenu1 = app.CreateList( listItems, drawerWidth, -1, "Menu,Expand" );
    lstMenu1.SetColumnWidths( -1, 0.35, 0.18 );
    lstMenu1.SelectItemByIndex( 0, true );
    lstMenu1.SetItemByIndex( 0, "Home Screen");
    lstMenu1.SetOnTouch( lstMenu_OnTouch );
    layMenu.AddChild( lstMenu1 );
    
    //Add seperator to menu layout.
    var sep = app.CreateImage( null, drawerWidth,0.001,"fix", 2,2 );
    sep.SetSize( -1, 1, "px" );
    sep.SetColor( "#cccccc" );
    layMenu.AddChild( sep );
    
    //Add title between menus.
	txtTitle = app.CreateText( "Official Bytecoin Sites",-1,-1,"Left");
	txtTitle.SetTextColor( "#666666" );
	txtTitle.SetMargins( 16,12,0,0, "dip" );
	txtTitle.SetTextSize( 14, "dip" );
	layMenu.AddChild( txtTitle );
	
    //Add a second list to menu layout.
    var listItems = "Bytecoin.org::[fa-chrome],Online Wallet::[fa-cloud],GitHub::[fa-github],Reddit::[fa-reddit],Twitter::[fa-twitter],Telegram::[fa-telegram]";
    lstMenu2 = app.CreateList( listItems, drawerWidth, -1, "Menu,Expand" );
    lstMenu2.SetColumnWidths( -1, 0.35, 0.18 );
    lstMenu2.SetOnTouch( lstMenu_OnTouch );
    layMenu.AddChild( lstMenu2 );
}

//Handle menu item selection.
function lstMenu_OnTouch( title, body, type, index )
{
    //Close the drawer.
    app.CloseDrawer( "Left" );
    
    //Highlight the chosen menu item in the appropriate list.
    if( this==lstMenu1 ) lstMenu2.SelectItemByIndex(-1);
    else lstMenu1.SelectItemByIndex(-1);
    this.SelectItemByIndex( index, true );
    
    switch (title) {
  case "Home Screen":
    mnuTouch("main.html");
    break;
  case "Live Data":
    mnuTouch("http://bytecoin-toolkit.ml/stream/data.html");
    break;
  case "Paper Wallet":
    mnuTouch("paper.html");
    break;
  case "QR Tools":
    mnuTouch("qrcode.html");
    break;
  case "Exchanges":
    mnuTouch("markets.html");
    break;
  case "BCN Miner":
    mnuTouch("miner.html");
    break;
  case "Hashrates":
    mnuTouch("hash.html");
    break;
  case "Mining Pools":
    mnuTouch("pools.html");
    break;
  case "About":
    mnuTouch("about.html");
    break;
  case "Online Wallet":
    app.OpenUrl("https://bytecoin.money");
    break;
  case "Bytecoin.org":
    app.OpenUrl("https://bytecoin.org");
    break;
  case "GitHub":
    app.OpenUrl("https://github.com/bcndev/bytecoin");
    break;
  case "Reddit":
    app.OpenUrl("https://www.reddit.com/r/BytecoinBCN/");
    break;
  case "Twitter":
    app.OpenUrl("https://twitter.com/Bytecoin_BCN");
    break;
  case "Telegram":
    app.OpenUrl("https://telegram.me/bytecoinchat");
    break;
  Default
    
    break;
  }
}

//function to handle switch 
 function mnuTouch( url )
 {
     app.ShowProgress();
   	var ip = app.GetIPAddress();
	if( ip == "0.0.0.0" ) { 
		web.LoadUrl("error.htm");
	}  else {
        web.LoadUrl( url );
	}
 }

//Called when a drawer is opened or closed.
function OnDrawer( side, state )
{
   
}

//Called when hardware menu key pressed.
function OnMenu( name )
{  
   app.OpenDrawer();
}

 function leftOnTouch()
 {
   app.OpenDrawer( );
 }

 function rightOnTouch()
 {
  mnuTouch("about.html"); 
 } 
  function web_OnProgress( progress )
  {
  if( progress==100 ) app.HideProgress();
  }