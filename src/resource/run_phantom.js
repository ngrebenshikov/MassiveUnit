var system 	= require('system');

if (system.args.length == 1) {
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

	var getData = function(){
		return page.evaluate(function() {
			return {count:window.i, total:window.MAX_TESTS};
		});
	};
	
	var testsComplete = function(){
		var data = getData();
		return data.count==data.total;
	};
		
	var waitInterval=-1;
	var waitForResults = function(){
		if(testsComplete()){
			clearInterval(waitInterval);
			console.log("[PhantomJS] Tests complete!");
			phantom.exit();
		}
	};
	
	
	/**
	* Handle js ballback from the clientside - window.callPhantom({ yourData:'here'});
	*/
	page.onCallback = function(data) {

		if(data.action == "shutdown"){
			phantom.exit(0);
		} else if(data.action == 'testComplete'){
			console.log("test-complete (" + data.count + "/" + data.maxTests + ")");
			if(data.count==data.maxTests){
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
		console.log('page-log : ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
	};
	
	// start up...
	console.log("[PhantomJS] Loading page at:", url);
	page.open(url, function(state){
		
		if(state == "success"){
			
			if(testsComplete()){
				phantom.exit(0);
				console.log("[PhantomJS] Tests already completed!");
			} else {
				var total = getData().total;
				console.log("[PhantomJS] Running " + total + " test(s)...");
				waitInterval = setInterval(waitForResults, 250);
			}
			
		} else {
			console.log("[PhantomJS] Error loading page!");
			phantom.exit(1);
		}
	});
	
	
	setTimeout(function(){
		console.log("[PhantomJS] Took more than a minute. Quitting");
		phantom.exit(1);
	}, 60000);
};