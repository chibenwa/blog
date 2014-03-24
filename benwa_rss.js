/**
 * Personnal settings
 * **/

var feed_author = "Tellier Benoit";
var blog_url = "https://127.0.0.1:8081";
var blog_title = "Benwa's blog";
var subjects = ["Web", "Software" , "Kernel", "Admin sys", "Divers"];

var rss_feeds = [ {description: "Flux RSS  principal", explanation: "Ce flux contient l'ensemble des notifications concernant les articles du blog.", url: blog_url+"/rss.xml" }, {description: "Flux RSS  dédié aux projets", explanation: "Ce flux contient l'ensemble des notifications concernant les projets du blog.", url: blog_url+"/rss_prj.xml"} ];

exports.get_rss_feed = function( callback ) {
    callback( rss_feeds );
}

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

exports.add_feed = function ( article, callback ) {
    feed.item(
	{
	    title:  article.title ,
	    description: markdown.toHTML( article.text) ,
	    url: blog_url + '/article/' + article.id ,
	    categories: subjects[ article.theme ] ,
	    author: feed_author ,
	    date: article.date 
	}
    );
    callback();
};

// A destination du main.js...
// We will look up what's new in the SQL ...
exports.import_feeds = function(lasts_articles, callback) {
    for( var i =0; i< lasts_articles.length; i++ ) {
	exports.add_feed( lasts_articles[i], 
	    function() {
	    
	    }
	);
    }
    callback();
};

var xml = feed.xml();

// Refresh our cached XML...
exports.build_xml = function( callback ) {
    xml = feed.xml();
    callback();
};

exports.get_xml = function ( callback ) {
    callback(xml);
};
