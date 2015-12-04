var casper = require("casper").create({
    pageSettings: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.2.7 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.7" }
});

var current_page = 1;
var providers = [];

casper
.start('https://a816-healthpsi.nyc.gov/ChildCare/SearchAction2.do')
.waitForSelector('input[value="Search"]', function clickSearchFirst() {
	// We need to click the Search button to get the first page of results
	var js = this.evaluate(function() {
		return document; 
	});	
	this.echo(JSON.stringify(js.all[0].outerHTML)); 
}, cleanup)
.run();

var cleanup = function() {
    this.echo("Bye.").exit();
};

function clickSearchFirst() {
	// We need to click the Search button to get the first page of results
    //this.thenClick("div#jobPager a#next").then(function() {
	
}

function getSelectedPage() {
    var el = document.querySelector('span[class="PageText"]')[1];
    return parseInt(el.textContent);
}

function getProviders() {
    var rows = document.querySelectorAll('table#jobs tr[id^="job"]');
    var jobs = [];

    for (var i = 0, row; row = rows[i]; i++) {
        var a = row.cells[1].querySelector('a[href*="jobdetail.ftl?job="]');
        var l = row.cells[2].querySelector('span');
        var job = {};

        job['title'] = a.innerText;
        job['url'] = a.getAttribute('href');
        job['location'] = l.innerText;
        jobs.push(job);
    } 

    return jobs;       
}

var processPage = function() {
    providers = this.evaluate(getProviders);
    require('utils').dump(providers);

    if (current_page >= 3 || !this.exists("table#jobs")) {
        return cleanup.call(casper);
    }

    current_page++;

    this.thenClick("div#jobPager a#next").then(function() {
        this.waitFor(function() {
            return current_page === this.evaluate(getSelectedPage);
        }, processPage, cleanup);
    });
};

