// Utility Functions for Visual Data Design

var dd = dd || {};

dd.advQ = function(q) {
	// Advance the queue (q)
	// Gets the array of asynchronous function (qFunctions), pops the next one off the
	// array and executes it. If the queue is empty it simply doesn't run.
	if (q && q.length > 0) {
		var nextFunction = q.shift();
		if (typeof nextFunction === "function") { 
			nextFunction();
		}
	}
}

dd.makeChart = function(chartType,opts) {
	var chart = function() {};
	chart = new chartType;
	chart.setup();
	dd.chartList.push(chart);
	return chart;
}

// make this use d3.format()

dd.makeReadable = function(num) {
	// Make numbers human readable
		var factor = 1
		var abbvr = ""
		if (num < 999) { return num }
		else if (num < 999999) { factor = 100; abbvr = "K"; }
		else if (num < 999999999) { factor = 100000; abbvr = "M"	}
		else if (num < 999999999999) { factor = 100000000; abbvr =  "B" }
		else if (num < 999999999999999) { factor = 100000000000; abbvr =  "T" }
		num = Math.round(num/factor)/10 + abbvr
		return num
	}
	
dd.makeDollar = function(num) {
	return '$' + d3.round(num,2).toFixed(2);
}

dd.makePercent = function(num,divisor) {
	if (!divisor) { divisor = 1 }
	return d3.round(num/divisor,2).toFixed(2) + '%';
}

// Shared Chart Object and Methods
dd.chartList = [];

