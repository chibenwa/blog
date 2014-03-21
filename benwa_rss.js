/**
 * Personnal settings
 * **/

var feed_author = "Tellier Benoit";
var blog_url = "https://benwa.minet.net";
var blog_title = "Benwa's blog";
var subjects = ["Web", "Software" , "Kernel", "Admin sys", "Divers"];

// Using markdown for rendering HTML...
var markdown = require( "markdown" ).markdown;

var RSS = require('rss');

var feed = new RSS({
    title: blog_title ,
    description: 'Le blog de '+feed_author ,
    feed_url: blog_url + '/rss.xml' ,
    site_url: blog_url ,
    image_url: blog_url + '/icon.png' ,
    docs: blog_url + '/rss/docs.html' ,
    author: feed_author ,
    managingEditor: feed_author ,
    webMaster: feed_author ,
    copyright: '2014 '+ feed_author ,
    language: 'fr' ,
    categories: subjects ,
    ttl: '60'
});

// A destination du main.js...
// We will look up what's new in the SQL ...
exports.import_feed_from_SQL = function(lasts_articles, callback) {
    for( var i =0; i<lasts_articles.length; i++ ) {
	feed.item(
	    {
		title:  lasts_articles[i].title ,
		description: lasts_articles[i].text ,
		url: blog_url + '/article/' + lasts_articles[i].id ,
		categories: subjects[ article[i].theme ] ,
		author: feed_author ,
		date: lasts_articles[i].date 
	    }
	);
    }
    callback();
};

var xml = feed.xml();

// Refresh our cached XML...
exports.build_xml() = function() {
    xml = feed.xml();
};

exports.add_feed = function ( article, callback ) {
    feed.item(
	{
	    title:  lasts_articles[i].title ,
	    description: lasts_articles[i].text ,
	    url: blog_url + '/article/' + lasts_articles[i].id ,
	    categories: subjects[ article[i].theme ] ,
	    author: feed_author ,
	    date: lasts_articles[i].date 
	}
    );
    callback();
};

exports.get_xml = function ( callback ) {
    callback(xml);
};
