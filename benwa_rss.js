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

var first_feed_params = {
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
};

var second_feed_params = {
    title: blog_title ,
    description: 'Les projets de '+feed_author ,
    feed_url: blog_url + '/rss_prj.xml' ,
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
};

var feed = new RSS( first_feed_params );

var feed_bis = new RSS( second_feed_params );

exports.renew_first_feed = function(callback) {
    delete feed;
    feed =  new RSS( first_feed_params );
    xml = feed.xml();
    callback();
};

function find_prj(projects, id ) {
    for( var i = 0; i < projects.length; i++ ) {
	if( projects[i].id == id ) {
	    return projects[i];
	}
    }
}

exports.renew_second_feed = function( callback ) {
    delete feed_bis;
    feed =  new RSS( second_feed_params );
    callback();
};

exports.add_notifs = function ( projects, notifs, callback ) {
    for( var i = 0; i < notifs.length; i++ ) {
	var prj = find_prj(projects, notifs[i].projet );
	var _title = prj.name;
	var _text = notifs[i].text;
	if( notifs[i].type == 0 ) {
	    _title += " : Commentaire";
	} else {
	    if( notifs[i].type == 1 ) {
		_title += " : Modification de l'avancement du projet";
	    } else {
		_title += " : Modification de l'état du projet";
	    }
	}
	
	feed_bis.item(
	    {
		title:  _title ,
		description: markdown.toHTML( _text) ,
		url: blog_url + '/projets/' + notifs[i].projet ,
		categories: ["projet"] ,
		author: feed_author ,
		date: notifs[i].date 
	    }
	);
    }
    callback();
}

exports.get_xml_prj = function ( callback ) {
    callback(xml_prj);
};

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

var xml_prj = feed_bis.xml();

// Refresh our cached XML...
exports.build_xml = function( callback ) {
    xml = feed.xml();
    callback();
};

exports.build_xml_prj = function( callback ) {
    xml_prj = feed_bis.xml();
    callback();
};

exports.get_xml = function ( callback ) {
    callback(xml);
};
