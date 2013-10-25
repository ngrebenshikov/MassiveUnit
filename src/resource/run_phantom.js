var system 	= require('system');

if (system.args.length === 1) {
	console.log('[PhantomJS] Error: no page URL supplied...');
	phantom.exit(-1);
} else {
	
	var
	page 	= require('webpage').create(),
	url 	= system.args[1];
	
	/**
	* Handle js ballback from the clientside - window.callPhantom({ yourData:'here'});
	*/
	page.onCallback = function(data) {
		
		//console.log('[PhantomJS] doExit:' + JSON.stringify(data));
		
		if(data.action == "shutdown"){
			phantom.exit(0);
		} else {
			console.log('[PhantomJS] Error: Unexpected callback action: '+data.action);
			phantom.exit(1);
		}
	};
		
    //console.log("[PhantomJS] Loading page at:", url);
	
    page.open(url, function(state){
		if(state === "success"){
			// page loaded ok...
			console.log("[PhantomJS] Running tests...");
		} else {
			phantom.exit(-1);
		}
	});
};