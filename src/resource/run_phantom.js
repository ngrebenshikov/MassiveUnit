var system 	= require('system');

if (system.args.length === 1) {
	console.log('[PhantomJS] Error: no page URL supplied...');
	phantom.exit(1);
} else {
	
	// Handle PhantomJS errors (not the clientside page errors)
    phantom.onError = function(msg, trace) {
        var msgStack = ['PhantomJS Error: ' + msg];
        if (trace && trace.length) {
            msgStack.push('trace:');
            trace.forEach(function(t) {
                msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
            });
        }
        console.error(msgStack.join('\n'));
        phantom.exit(1);
    };

	
	var
	page 	= require('webpage').create(),
	url 	= system.args[1];
	
	/**
	* Handle js ballback from the clientside - window.callPhantom({ yourData:'here'});
	*/
	page.onCallback = function(data) {

		if(data.action === "shutdown"){
			phantom.exit(0);
		} else if(data.action === 'testComplete'){
			console.log("test-complete (" + data.count + "/" + data.maxTests + ")");
			if(data.count===data.maxTests){
				console.log("All done!");
			}
		} else {
			console.log('[PhantomJS] Error: Unexpected callback action: '+data.action);
			phantom.exit(1);
		}
	};

	page.onError = function (msg, trace) {
		console.log("onError:", msg);
		trace.forEach(function(item) {
			console.log('  ', item.file, ':', item.line);
		});
		phantom.exit(1);
	};

	page.onConsoleMessage = function(msg, lineNum, sourceId) {
		console.log('page: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
	};
	
	// start up...
	console.log("[PhantomJS] Loading page at:", url);
	page.open(url, function(state){
		if(state === "success"){
			console.log("[PhantomJS] Running tests...");
		} else {
			console.log("[PhantomJS] Error loading page!");
			phantom.exit(1);
		}
	});
};