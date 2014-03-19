// We instanciate our server

console.log("Starting our blog server !");

var express = require( "express" );

var app = express()
  , http = require('http')
  , server = http.createServer(app);

app.use( express.static( __dirname + "/public" ) );

server.listen( 8081 );

// To manage posts

app.use(express.urlencoded());
app.use(express.json());

// Here we create our sql connection

var mysql = require('mysql');

var mysql_connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'chibuya',
  database : 'Node_blog'

});

mysql_connection.connect();

// Use our backend

var backend = require('./backend');

// Subject definition ...
/**
 * Hard code hard core !!!!
 * 
 * */

var subjects = ["Web", "Software" , "Kernel", "Admin sys", "Divers"];

// And Here we will deal with what to do if a page gets visited

app.get( '/', 
    function(req, res) {
	backend.get_10_last_articles(mysql_connection, function(articles) {
		res.render("index.ejs",{subjects : subjects, articles : articles});
	    }
	);
    }
);

app.get( '/article/:article_id',
    function(req,res) {
	var n = ~~Number(req.params.article_id);
	if( String(n) == req.params.article_id ) {
	    backend.get_article_by_id(mysql_connection, mysql, req.params.article_id,
		function(found, article, comments) {
		    if( found ) {
			res.render("article.ejs", {article : article, subjects : subjects, comments : comments} );
		    } else {
			res.render("404.ejs", {subjects : subjects} );
		    }
		}
	    );
	} else {
	    res.render("404.ejs", {subjects : subjects} );
	}
    }
);

app.get( '/archives',
    function(req,res) {
	backend.list_years(mysql_connection,
	    function(years) {
		res.render("archives.ejs", {years : years, subjects : subjects} );
	    }
	);
    }
);

app.get( '/archives/:year',
    function(req,res) {
	var n = ~~Number(req.params.year);
	if( String(n) == req.params.year ) {
	    backend.list_month(mysql_connection, mysql, n,
		function(months_id, months) {
		    res.render("archives_month.ejs", {year : n , subjects : subjects, months_id : months_id, months: months} );
		}
	    );
	} else {
	    res.render("404.ejs", {subjects : subjects} );
	}
    }
);

app.get( '/archives/:year/:month',
    function(req,res) {
	var n = ~~Number(req.params.year);
	var m = ~~Number(req.params.month);
	if( String(n) == req.params.year && String(m) == req.params.month ) {
	    backend.list_month_content(mysql_connection, mysql, n, m,
		function(articles, month) {
		    res.render("archives_month_content.ejs", {year : n , subjects : subjects, month : month, articles: articles} );
		}
	    );
	} else {
	    res.render("404.ejs", {subjects : subjects} );
	}
    }
);

app.get( '/topics/:sub',
    function(req,res) {
	var n = ~~Number(req.params.sub);
	if( String(n) == req.params.sub && n >= 0 && n < subjects.length ) {
	    backend.list_articles_by_topic(mysql_connection, mysql, n,
		function(articles) {
		    res.render("topics.ejs", {subjects : subjects, articles : articles, current_subject : n} );
		}
	    );
	} else {
	    res.render("404.ejs", {subjects : subjects} );
	}
    }
);

app.post( '/post_comment',
    function(req, res) {
	var comment_title = mysql.escape(req.body.titre);
	var comment_creator = mysql.escape(req.body.creator);
	var comment_text = mysql.escape(req.body.text);
	var comment_article = mysql.escape(req.body.article);
	var n = ~~Number(req.body.article);
	if( String(n) == req.body.article ) {
	    backend.add_comment( mysql_connection, comment_title, comment_creator, comment_text, comment_article);
	}
	res.redirect('/article/'+n );
    }
);
