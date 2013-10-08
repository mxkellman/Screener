/* global d3 */

var dd = dd || {};
$(document).ready(function(){
	dd.setup();
});
/* moving to gitlab
 * refactor the entire code base
 * make colors more vibrant
 * add labels to sliders
 * add summary information
 * move "dist from center" abover color/size
 * come up with a better name for distance
 * include dropdown criteria in hopup, add % rank.
 * add filters, especially rational filter
 * add a control that highlights fictional portfolio holdings
 */


// Establishes all of the variables needed for the domain 'dd' (data design)
dd.get = dd.get || {};
dd.make = dd.make || {};
dd.draw = dd.draw || {};
dd.update = dd.update || {};

dd.scale = dd.scale || {};
dd.make.scale = dd.make.scale || {};

// All the configurable parameters used in the code
dd.param = {
	mainDiv: '#screener'
	, w: 1024
	, h: 768
	, hopup: {
		w : 350
		, triangle : 120
	}
	, scale: 1
	, translate: [0,0]
	, charge: -100
	, rings: 3
	, size: 'Market Cap'
	, color: 'Change'
	, dist: 'rank'
	, distInv: true
	, group: "Sector"
	, score: [
		{ name:'Performance (Year)', weight:5 }
		, { name:'PEG', weight:4 }
		, { name:'Profit Margin', weight:3 }
	]
	, criteria: {
		'No.': { exclude: true }
		, 'Ticker': { isText: true }
		, 'Company': { isText: true }
		, 'Sector': { isText: true }
		, 'Industry': { isText: true }
		, 'Country': { isText: true }
		, 'Change': { isPercent: true, color:true, size: true }
		, 'Market Cap': { multiplier: 1000, size: true }
		, 'Price': { multiplier: 1, isDollar: true }
		, 'Volume': { multiplier: 1 }
		, 'P/E': { isRatio: true }
		, 'Forward P/E': { isRatio: true }
		, 'PEG': { isRatio: true }
		, 'P/S': { isRatio: true }
		, 'P/B': { isRatio: true }
		, 'P/Cash': { isRatio: true }
		, 'P/Free Cash Flow': { isRatio: true }
		, 'Dividend Yield': { isPercent: true }
		, 'Payout Ratio': { isPercent: true }
		, 'EPS (ttm)': { isPercent: true }
		, 'EPS growth this year': { isPercent: true, color:true }
		, 'EPS growth next year': { isPercent: true, color:true }
		, 'EPS growth past 5 years': { isPercent: true, color:true }
		, 'EPS growth next 5 years': { isPercent: true, color:true }
		, 'Sales growth past 5 years': { isPercent: true, color:true }
		, 'EPS growth quarter over quarter': { isPercent: true, color:true }
		, 'Sales growth quarter over quarter': { isPercent: true, color:true, size: true }
		, 'Shares Outstanding': { multiplier: 1000, size: true }
		, 'Shares Float': { multiplier: 1000 }
		, 'Insider Ownership': { isPercent: true }
		, 'Insider Transactions': { isPercent: true }
		, 'Institutional Ownership': { isPercent: true }
		, 'Institutional Transactions': { isPercent: true }
		, 'Float Short': { isPercent: true }
		, 'Short Ratio': { isRatio: true }
		, 'Return on Assets': { isPercent: true }
		, 'Return on Equity': { isPercent: true }
		, 'Return on Investment': { isPercent: true }
		, 'Current Ratio': { isRatio: true }
		, 'Quick Ratio': { isRatio: true }
		, 'LT Debt/Equity': { isRatio: true, invert: true }
		, 'Total Debt/Equity': { isRatio: true, invert: true}
		, 'Gross Margin': { isPercent: true }
		, 'Operating Margin': { isPercent: true }
		, 'Profit Margin': { isPercent: true}
		, 'Performance (Week)': { isPercent: true, color:true }
		, 'Performance (Month)': { isPercent: true, color:true  }
		, 'Performance (Quarter)': { isPercent: true, color:true  }
		, 'Performance (Half Year)': { isPercent: true, color:true  }
		, 'Performance (Year)': { isPercent: true, color:true  }
		, 'Performance (YTD)': { isPercent: true, color:true  }
		, 'Beta': { isRatio: true, invert: true }
		, 'Average True Range': { isRatio: true }
		, 'Volatility (Week)': { isPercent: true, size: true }
		, 'Volatility (Month)': { isPercent: true, size: true }
		, '20-Day Simple Moving Average': { isPercent: true }
		, '50-Day Simple Moving Average': { isPercent: true }
		, '200-Day Simple Moving Average': { isPercent: true }
		, '50-Day High': { isPercent: true }
		, '50-Day Low': { isPercent: true }
		, '52-Week High': { isPercent: true}
		, '52-Week Low': { isPercent: true }
		, 'Relative Strength Index (14)': { isRatio: true }
		, 'Change from Open': { isPercent: true, color:true  }
		, 'Gap': { isPercent: true, color:true }
		, 'Analyst Recom': { isRatio: true, invert: true }
		, 'Average Volume': { multiplier: 1000 }
		, 'Relative Volume': { isRatio: true }
		, 'Earnings Date': { isDate: true }
		, 'fixed': { exclude: true }
		, 'index': { exclude: true }
		, 'px': { exclude: true }
		, 'py': { exclude: true }
		, 'weight': { exclude: true }
		, 'x': { exclude: true }
		, 'y': { exclude: true }
		, 'score': { exclude: true }
		, 'rank': { exclude: true }
	}
	, filters: [
		{criteria:"P/E", operator:"greater", value:"Forward P/E", isCriteria:true}
		, {criteria:"Performance (Year)", operator:"greater", value:"Performance (Quarter)", isCriteria:true}
		, {criteria:"Market Cap", operator:"greater", value:"10,000"}
	]
};


// Kicks off the screener, all other functions chain from dd.get.data
dd.setup = function() {
	dd.get.data();
};

// Gets the data from a CSV
// chains to make.ranges and make.forces
dd.get.data = function() { 
	d3.csv('data/SP500.csv', function(csv) {
		dd.origData = csv;
		dd.data = csv;
		// Makes numbers into actual numbers and counts groups
		dd.groups = [];
		$.each(dd.data, function(i,d) {
			$.each(d, function(i2,d2){
				if(d2) {
					// Changes all of the numbers into actual numbers based on type
					var type = dd.param.criteria[i2]
					if (type.isPercent) {
						dd.data[i][i2] = +d2.slice(0,-1);					
					}
					if (type.isRatio) {
						dd.data[i][i2] = +d2;
					}
					if (type.multiplier) {
						dd.data[i][i2] = d2 * type.multiplier;
					}
					// Puts together the group
					if(i2 == dd.param.group) {
						if ($.inArray(d2,dd.groups) == -1) { dd.groups.push(d2) }
					}
				} else { dd.data[i][i2] = null }
			})
		})
//		dd.make.filter();
		dd.make.ranges();
		dd.make.forces();
		dd.draw.screener();
	});
}

//Phil added this
//This sets the drawer to the correct offset from the LEFT based on the variable "w"

dd.positionDrawer = function () {
	d3.selectAll(".controls")
	.style("left",dd.param.w+"px")
	.style("bottom", window.innerHeight-dd.param.h+"px");
};

dd.filter = function() {
	
};

// Establishes the min/mid/max for every criteria, makes a scoring scale for each criterion as well.
// Chains to make.scores and make.scale.all
dd.make.ranges = function() {
	dd.mm = {};
	dd.score = {};
	// Goes through each data point and finds the min/max, data points can be excluded, and data points where low=good are handled here
	$.each(dd.data[0], function(i) {
		var type = dd.param.criteria[i];
		if (!type.exclude && !type.isText) {
			dd.mm[i] = {};
			dd.mm[i].min = type.invert ? d3.max(dd.data, function(d){ return d[i]}) : d3.min(dd.data, function(d){ return d[i]});
			dd.mm[i].max = type.invert ? d3.min(dd.data, function(d){ return d[i]}) : d3.max(dd.data, function(d){ return d[i]});
			dd.mm[i].mid = dd.mm[i].min < 0 && dd.mm[i].max > 0 ? 0 : (dd.mm[i].max - dd.mm[i].min) / 2;
			dd.score[i] = d3.scale.pow()
				.domain([dd.mm[i].min,dd.mm[i].max])
				.range([0,100])
				.exponent(.5)
			;
		}
	});
	dd.make.scores();
	dd.make.scale.all();
}

// Sets up the links and forces needed to pull everything toward the center and group them
dd.make.forces = function() {
	// Create the center point
	var center = { x: dd.param.w / 2, y: dd.param.h / 2, fixed: true, exclude: true };
	dd.data.splice(0,0,center);

	var
		attractors = []
		, rad = 2 * Math.PI / dd.groups.length
		, xm = 1
		, ym = 1
		, hyp = dd.param.h + dd.param.charge
	;

	dd.groups.sort();
	$.each(dd.groups, function(i,d) {
		var angle = i * rad;
		if (angle > 270) { angle= angle - 270; xm = -1; }
		else if (angle > 180) { angle = angle - 180; xm = -1; ym = -1 }
		else if (angle > 90) { angle = angle - 90; ym = -1; }
		var x = dd.param.w/2 + Math.sin(angle)*hyp * xm;
		var y = dd.param.h/2 + Math.cos(angle)*hyp * ym;
		attractors[i] = ({x: x, y: y, fixed: true, exclude: true })
		dd.data.splice(0,0,attractors[i]);
	})

	// Create all of the attractors for the groups
	var links = []
	$.each(dd.data, function(i,d) {
		if (!d.exclude) {
			links.push({source: center, target: d, type: "dist"});
			links.push({source: attractors[$.inArray(d[dd.param.group],dd.groups)], target: d, type: "group" });
		}
	})


	dd.force = d3.layout.force()
		.size([dd.param.w, dd.param.h])
		.nodes(dd.data)
		.links(links)
		.linkDistance(function(d,i) {
			if (dd.param.dist == "score") {
				if (d.type == "dist") { return dd.scale.dist(dd.mm.score.max - d.target[dd.param.dist]) + dd.param.charge / 2 }
				else { return dd.scale.dist((d.target[dd.param.dist])) - dd.param.charge }
			} else {
				if (d.type == "dist") { return dd.scale.dist(d.target[dd.param.dist]) + dd.param.charge / 2 }
				else { return dd.scale.dist((dd.mm.rank.max - d.target[dd.param.dist])) - dd.param.charge }
			}
		})
		.linkStrength(function(d,i) {
			if (d.type == "dist") { return 1 }
			else { return .5 }
		})
		.charge(dd.param.charge)
		.gravity(.01)
		.friction(.55)
	;



}

// Makes all the scales (calls the single scale functions)
dd.make.scale.all = function() {
	dd.make.scale.size();
	dd.make.scale.color();
	dd.make.scale.dist();
}

// Makes the size scale
dd.make.scale.size = function() {
	dd.scale.size = d3.scale.pow()
		.domain([dd.mm[dd.param.size].min,dd.mm[dd.param.size].max])
		.range([5,50])
		.exponent(.5)
	;
	dd.scale.text = d3.scale.pow()
		.domain([dd.mm[dd.param.size].min,dd.mm[dd.param.size].max])
		.range([3,18])
		.exponent(.5)
	;
}

// Makes the color scale
dd.make.scale.color = function() {
	var min = dd.mm[dd.param.color].min;
	var mid = dd.mm[dd.param.color].mid;
	var max = dd.mm[dd.param.color].max;
	dd.scale.color = d3.scale.linear()
    .domain([min, (mid-min / 2) + min, mid-.00000000000001, mid, (max-mid / 2) + mid, max])
    .range(['#aa0000', '#aa0000','#331111','#113311', '#00cc00', '#00cc00'])
	;
}



// Makes the distance scale
dd.make.scale.dist = function() {
	dd.scale.dist = d3.scale.pow()
		.domain([dd.mm[dd.param.dist].min,dd.mm[dd.param.dist].max])
		.range([0,dd.param.h / 2])
		.exponent(.5)
	;
}

// Generates the scores, also used to update the scores
dd.make.scores = function() {
	var rank = [];
	$.each(dd.data, function(i,stock){
		var score = 0
		var factor = 0
		$.each(dd.param.score, function(i2,criterion) {
			var value = dd.score[criterion.name](stock[criterion.name]) || 0;
			score += value * criterion.weight;
			factor += criterion.weight;
		})
		dd.data[i].score = score / factor;
		rank.push({ticker:stock.Ticker,value:score/factor});
	})
	dd.mm.score = {
		min: d3.min(dd.data, function(d){ return d.score })
		, max: d3.max(dd.data, function(d){ return d.score })
	}
	dd.make.rankScore(rank);
}

dd.make.rankScore = function(rank) {
	dd.rankings = {};
	rank.sort(dd.rankRank);
	$.each(rank, function(i,d){
		dd.rankings[d.ticker] = i+1;
	})
	$.each(dd.data, function(i,stock) {
		dd.data[i].rank = dd.rankings[stock.Ticker];
	})
	dd.mm.rank = {
		min: 1
		, max: rank.length
	}
}

dd.make.ranks = function() {
	var factor = 0;
	var rankings = {};
	dd.rankings = {};

	$.each(dd.param.score, function(i,criterion){
		var rank = [];
		factor += criterion.weight
		$.each(dd.data, function(i2,stock) {
			var value = stock[criterion.name] || 0;
			rank.push({ticker:stock.Ticker, value:value})
		})
		rank.sort(dd.rank);
		$.each(rank, function(i,d){
			rankings[d.ticker] = rankings[d.ticker] || 0;
			rankings[d.ticker] += (i+1) * criterion.weight;
		})
	})
	var rank = [];
	$.each(rankings, function(ticker,value){
		rank.push({ticker:ticker, value:(value/factor)})
	})
	rank.sort(dd.rankRank);
	$.each(rank, function(i,d){
		dd.rankings[d.ticker] = i+1;
	})
	$.each(dd.data, function(i,stock) {
		dd.data[i].rank = dd.rankings[stock.Ticker];
	})
	dd.mm.rank = {
		min: 1
		, max: rank.length
	}
}

// Updates the size of the circles, takes input from dropdowns
dd.update.size = function(o) {
	dd.param.size = o.dropVal;
	dd.make.scale.size();
	dd.update.circles();
}

// Updates the color of the circles, takes input from dropdowns
dd.update.color = function(o) {
	dd.param.color = o.dropVal
	dd.make.scale.color();
	dd.update.circles();
}

// Updates the scores, then resets the distances of the circles
dd.update.dist = function(o) {
	if (o.dropVal) { dd.param.score[o.name].name = o.dropVal; }
	if (o.sliderVal) { dd.param.score[o.name].weight = o.sliderVal; }
	dd.make.scores();
	dd.make.scale.dist();
	dd.force.stop();
	dd.force
		.nodes(dd.data)
		.linkDistance(function(d,i) {
			if (dd.param.dist == "score") {
				if (d.type == "dist") { return dd.scale.dist(dd.mm.score.max - d.target[dd.param.dist]) + dd.param.charge / 2 }
				else { return dd.scale.dist((d.target[dd.param.dist])) - dd.param.charge }
			} else {
				if (d.type == "dist") { return dd.scale.dist(d.target[dd.param.dist]) + dd.param.charge / 2 }
				else { return dd.scale.dist((dd.mm.rank.max - d.target[dd.param.dist])) - dd.param.charge }
			}
		})
	;
	dd.force.start();
}

// Redraws the circle size and color
dd.update.circles = function() {

	dd.circleGroup.selectAll('circle')
		.data(dd.data)
		.transition()
		.duration(1000)
		.attr('r', function(d,i) {
			if (!d.exclude && d[dd.param.size]) { return dd.scale.size(d[dd.param.size]) * (1/dd.param.scale) }
			else { return 0 }
		})
		.style('fill', function(d,i) {
			if(!d.exclude) { return dd.scale.color(d[dd.param.color]) }
			else { return '#3366cc' }
		})
		
	;
	
	dd.symbolGroup.selectAll('text')
		.data(dd.data)
		.transition()
		.duration(1000)
		.style('font-size', function(d,i) {
			if(!d.exclude) { return dd.scale.text(d[dd.param.size]); }
			else { return 0 }
		})
	;	
}

// Updates and then shows the hopup box with information about a company
dd.update.hopup = function(o) {
	var volume = o.d['Relative Volume'] > 1.03 ? ' Above Avg.' : o.d['Relative Volume'] < .97 ? ' Below Avg.' : ' Avg. Volume';
	var color = o.d.Change > 0.1 ? "009900" : o.d.Change <  0.1 ? "990000" : "666666";

	var text = '<div class="snapshot"><div class="name">' + o.d.Company + ' <span class="symbol">(' + o.d.Ticker + ')</div>';
	text += '<div class="industry">' + o.d.Sector + '</div>';
	text += '<ul class="quote"><li><div class="label">Last Price</div><div class="data">' + dd.makeDollar(o.d.Price) + '</div></li>';
	text += '<li><div class="label">Change</div><div class="data" style="color:#'+color+'">' + dd.makePercent(o.d.Change) + '</div></li>';
	text += '<li><div class="label">Score</div><div class="data">' + d3.round(o.d.score,2) + ' / 100</span></div></li>';
	text += '<li><div class="label">Rank</div><div class="data">' + o.d.rank + ' / 500</span></div></li>';
	text += '</ul></div>';
	
	d3.select('.hopup')
		.style('top',o.event.clientY - 10 + 'px')
		.style('left',o.event.clientX  + 'px')
		.style('display','block')
	;
	dd.hopup.content.html(text)
}


// Chains all of the component of the screener
dd.draw.screener = function() {
	dd.draw.circles();
	dd.draw.hopup();
	dd.draw.rings();
	dd.draw.controls();
	dd.positionDrawer();
}

// Sets up the controls for the screener
dd.draw.controls = function() {
	dd.controls = {} || dd.controls;
	dd.controls.div = d3.select(dd.param.mainDiv)
		.append('div')
			.attr('class', 'controls')
	;
	dd.controls.scores = {} || dd.controls.scores;
	dd.controls.scores.div = dd.controls.div.append('div')
		.attr('class', 'control-group')
	dd.controls.scores.div.append('text')
		.attr('class', 'label')
		.text('Importance')

	$.each(dd.param.score, function(i,d) {

		dd.controls.scores.slider = [];
		
		dd.controls.scores.slider[i] = dd.draw.dropdown({div: dd.controls.scores.div, name: i, param: dd.param.score[i].name, action: dd.update.dist });
		
		var slider = dd.controls.scores.div.append('div')
			.attr('class', 'slider')
		;
		
		$(slider).slider({
			animate : true
			, value : dd.param.score[i].weight
			, min : 1
			, max : 5
			, range: 'min'
			, stop : function(event, ui) {
				dd.update.dist({sliderVal: ui.value, name:i});
			}
		})
	});
	
	dd.controls.div.append('div')
		.attr('class', 'control-group');

	dd.controls.div.append('text')
		.attr('class', 'label')
		.text('Appearance');

	dd.controls.color = dd.draw.dropdown({div: dd.controls.div, name: 'color', param: dd.param.color, action: dd.update.color, label: 'Circle Color', paramInclude:'color'});
	dd.controls.size = dd.draw.dropdown({div: dd.controls.div, name: 'size', param: dd.param.size, action: dd.update.size, label: 'Circle Size', paramInclude: 'size' });
};

// Resusable function for drawing dropdowns
dd.draw.dropdown = function(o) {
	var container = o.div.append('div')
		.attr('class', 'container');
	container.append('div')
		.attr('class', 'label')
		.text(o.label);
	var dropdown = container.append('div')
		.attr('class', 'btn-group ');
	var button = dropdown.append('div')
		.attr('class', 'btn dropdown-toggle')
		.attr('data-toggle', 'dropdown');
	var buttonText = button.append('text')
		.text(o.param);
	button.append('span')
		.attr('class', 'caret');

	var menu = dropdown.append('ul')
		.attr('class', 'dropdown-menu')
		.attr('name', o.name);
	
	$.each(dd.param.criteria, function(name, type) {
		var exclude = false;
		if (o.paramInclude) {
			if (!type[o.paramInclude]) { exclude = true ; }
		}
		if (!type.exclude && !type.isText && !exclude) {
			
			menu.append('li')
				.append('a')
				.attr('name', name)
				.text(name);
		}
	});

	$(dropdown[0]).find('ul.dropdown-menu a')
		.bind('click', function(event) {
			var newVal = $(event.target).attr('name');
			var newText = newVal.length > 24 ? newVal.slice(0, 24) + '...' : newVal;
			buttonText.text(newText);
			o.action({dropVal:newVal, name:o.name});
	});
	
	return container;
};

// Draws the hopup for the first time
dd.draw.hopup = function() {
	dd.hopup = d3.select(dd.param.mainDiv).append('div')
		.attr('class', 'hopup')
	;
	dd.hopup.content = dd.hopup.append('div')
		.attr('class', 'content')
		.style('width', dd.param.hopup.w+'px');
};

// Draws the background rings
dd.draw.rings = function() {
	for (var i = 0; i < dd.param.rings; i++) {
		dd.ringGroup.append('svg:circle')
			.attr('class', 'ring')
			.attr('r', dd.param.h / dd.param.rings / 2 * (i + 1))
			.attr('cx', dd.param.w / 2)
			.attr('cy', dd.param.h / 2);
	}
	dd.rings = dd.ringGroup.selectAll('circle');
};

// Draws the screener circles
dd.draw.circles = function() {
	dd.container = d3.select(dd.param.mainDiv)
		.append('svg:svg')
			.attr('width', dd.param.w)
			.attr('height', dd.param.h)
			.attr('class', 'screen')
			.call(d3.behavior.zoom().on('zoom', zoom));
	
	dd.ringGroup = dd.container.append('svg:g');
	dd.circleGroup = dd.container.append('svg:g');

	dd.circles = dd.circleGroup.selectAll('circle')
		.data(dd.data)
		.enter().append('svg:circle')
		.attr('r', function(d) {
			if(!d.exclude) { return dd.scale.size(d[dd.param.size]) * (1/dd.param.scale); }
			else { return 0; } })
		.attr('class', 'company' )
		.attr('name', function(d) { return d.Ticker; })
		.style('fill', function(d) {
			if(!d.exclude) { return dd.scale.color(d[dd.param.color]); }
			else { return 'none'; }
		})
		.style('stroke', '#111')
		.style('opacity', 0.9 )
		.on('mouseover', function(d) {
			if(!d.exclude) {
				d3.select(this).style('stroke','#ddd')
						.style('stroke-width',2/dd.param.scale);
				dd.update.hopup({d:d,event:d3.event});
			}
		})
		.on('mouseout',function(d) {
			if(!d.exclude) {
				d3.select(this).style('stroke','#111').style('stroke-width',1/dd.param.scale);
				d3.select('.hopup').style('display','none');
			}
		})
	;

	dd.symbolGroup = dd.container.append('svg:g');
	dd.symbols = dd.symbolGroup.selectAll('text')
		.data(dd.data)
		.enter().append('svg:text')
		.attr('class', 'symbol')
		.text(function(d) { return d.Ticker; })
		.style('font-size', function(d) { return dd.scale.text(d[dd.param.size]); })
		.style('opacity', function(d) {
			if(!d.exclude) { return (d.score*1.5) / 100; }
			else { return 0; }
		})
		.attr("text-anchor", "middle")
		.on('mouseover', function(d) {
			if(!d.exclude) { dd.update.hopup({d:d,event:d3.event}); }
		})
		.on('mouseout',function() {
			d3.select(this);
			d3.select('.hopup').style('display','none');
		});

	function zoom() {
		dd.param.scale = d3.event.scale;
		dd.param.translate = d3.event.translate;
		dd.circles
			.attr('transform','translate('+dd.param.translate+') scale('+dd.param.scale+')')
			.attr('r', function(d) {
				if(!d.exclude) { return dd.scale.size(d[dd.param.size]) * (1/dd.param.scale); }
				else { return 0; }
			})
			.style('stroke-width', 1 / dd.param.scale);
		dd.rings
			.attr('transform','translate('+dd.param.translate+') scale('+dd.param.scale+')')
			.style('stroke-width', 1 / dd.param.scale);
		dd.symbols
			.attr('transform','translate('+dd.param.translate+') scale('+dd.param.scale+')');
//			.style('font-size', function(d,i) { dd.scale.text(d[dd.param.size]) })

	};
		
	dd.force.start();

	dd.force.on('tick', function() {
		dd.circleGroup.selectAll('circle')
				.attr('cx', function(d) { return d.x; })
				.attr('cy', function(d) { return d.y; });
		dd.symbolGroup.selectAll('text')
				.attr('x', function(d) { return d.x; })
				.attr('y', function(d) { return d.y + dd.scale.text(d[dd.param.size])* 0.4; });
	});
};

dd.rank = function(a,b) {
	return a.value - b.value;
};

dd.rankRank = function(a,b) {
	return b.value - a.value;
};
