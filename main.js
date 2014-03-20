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

// Let's manage sessions ^^

app.use(express.cookieParser());
app.use(express.session({secret: 'chibuya'}))

// Using markdown for rendering...

var markdown = require( "markdown" ).markdown;

// Usefull function to know if an admin is identified

function is_authentified( req ) {
    return (req.session.admin == 0);
}

function auth_mgt( req, res, callback ) {
    if( is_authentified( req ) ) {
	callback();
    } else {
	res.render("auth.ejs",{subjects: subjects} );
    }
}

// And Here we will deal with what to do if a page gets visited

app.get( '/', 
    function(req, res) {
	backend.get_10_last_articles(mysql_connection, function(articles) {
		res.render("index.ejs",{subjects : subjects, articles : articles, markdown : markdown});
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
			res.render("article.ejs", {article : article, subjects : subjects, comments : comments, markdown : markdown } );
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

app.get( '/projets',
    function(req,res) {
	backend.get_projects(mysql_connection, 
	    function( projets ) {
		res.render("projets.ejs", { subjects : subjects, projets : projets} );
	    }
	);
    }
);

app.get('/projets/:projet_id',
    function(req, res) {
	var n = ~~Number( req.params.projet_id );
	if( String(n) == req.params.projet_id ) {
	    backend.get_project_by_id(mysql_connection, mysql.escape(req.params.projet_id),
		function ( projets ) {
		    if( projets.length == 0 ) {
			res.render("404.ejs", {subjects : subjects} );
		    } else {
			res.render("projet.ejs",{ subjects : subjects, projet : projets[0] , markdown : markdown });
		    }
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

app.get( '/admin', 
    function(req, res) {
	auth_mgt(req, res,
	    function() {
		backend.get_waiting_comments_count( mysql_connection,
		    function( waiting_comments ) {
			res.render("article_edition.ejs", {subjects : subjects, waiting_comments : waiting_comments} );
		    }
		);
	    }
	);
    }
);

app.post( '/post_new_article',
    function( req, res) {
	auth_mgt(req, res,
	    function() {
		backend.create_article( mysql_connection, mysql, req,
		    function( insert_id ) {
			res.redirect('/article/'+insert_id );
		    }
		);
	    }
	);
    }
);


app.post( '/post_auth',
    function( req, res ) {
	if( ! is_authentified( req ) ) {
	    var login = mysql.escape(req.body.login);
	    var pass = req.body.pass;
	    backend.certify_admin( mysql_connection, login,  pass,
		function( b ) {
		    if( b ) {
			req.session.admin = 0;
			res.redirect('/admin');
		    }
		}
	    );
	} else {
	  res.redirect('/admin');
	}
    }
);

app.get( '/admin/projet_ed',
    function (req, res) {
	auth_mgt(req, res,
	    function() {
		backend.get_waiting_comments_count( mysql_connection,
		    function( waiting_comments ) {
			res.render("projet_edition.ejs", {subjects : subjects, waiting_comments : waiting_comments} );
		    }
		);
	    }
	);
    }
);

app.post( '/post_new_projet',
    function ( req, res) {
	var name = mysql.escape( req.body.name );
	var summary = mysql.escape( req.body.summary );
	var git_clone = mysql.escape( req.body.git_clone );
	var ended = mysql.escape( req.body.ended );
	var etat = mysql.escape( req.body.etat );
	var progress = mysql.escape( req.body.progress );
	var details = mysql.escape( req.body.details );
	auth_mgt( req, res,
	    function() {
		backend.create_project( mysql_connection, name, summary, git_clone, ended, etat, progress, details,
		    function(insertedId) {
			res.redirect("/projets/"+insertedId);
		    }
		);
	    }
	);
    }
);

app.get( '/admin/projet_mgt',
    function (req, res) {
	auth_mgt(req, res,
	    function() {
		backend.get_waiting_comments_count( mysql_connection,
		    function( waiting_comments ) {
			backend.get_projects( mysql_connection, 
			    function( projets ) {
				res.render("projet_mgt.ejs", {subjects : subjects, waiting_comments : waiting_comments, projets: projets} );
			    }
			);
		    }
		);
	    }
	);
    }
);

app.post( '/post_update_avancement/:id',
    function (req, res) {
        var progress = mysql.escape(req.body.progress);
	var id = req.params.id;
	auth_mgt(req, res,
	    function() {
		backend.projet_update_progress( mysql_connection, mysql.escape(id), progress,
		    function () {
			res.redirect("/admin/projet_mgt");
		    }
		);
	    }
	);
    }
);

app.post( '/post_update_ended/:id',
    function (req, res) {
	var ended = mysql.escape(req.body.ended);
	var id = req.params.id;
	auth_mgt(req, res,
	    function() {
		backend.projet_update_ended( mysql_connection, mysql.escape(id), ended,
		    function () {
			res.redirect("/admin/projet_mgt");
		    }
		);
	    }
	);
    }
);

app.post( '/post_update_etat/:id',
    function (req, res) {
	var etat = mysql.escape(req.body.etat);
	var id = req.params.id;
	auth_mgt(req, res,
	    function() {
		backend.projet_update_etat( mysql_connection, mysql.escape(id), etat,
		    function () {
			res.redirect("/admin/projet_mgt");
		    }
		);
	    }
	);
    }
);

app.get( '/admin/comment_mgt',
    function (req, res ) {
	auth_mgt(req, res,
	    function() {
		backend.get_waiting_comments( mysql_connection,
		    function( comments ) {
			backend.get_waiting_comments_count( mysql_connection,
			    function( waiting_comments ) {
				res.render("comment_mgt.ejs", { subjects : subjects, waiting_comments : waiting_comments, comments : comments });
			    }
			);
		    }
		);
	    }
	);
    }
);

app.post( '/post_accept_comment/:id',
    function (req, res) {
	var id = req.params.id;
	auth_mgt(req, res,
	    function() {
		backend.accept_comment( mysql_connection, mysql.escape(id),
		    function () {
			res.redirect("/admin/comment_mgt");
		    }
		);
	    }
	);
    }
);

app.post( '/post_delete_comment/:id',
    function (req, res) {
	var id = req.params.id;
	auth_mgt(req, res,
	    function() {
		backend.delete_comment( mysql_connection, mysql.escape(id),
		    function () {
			res.redirect("/admin/comment_mgt");
		    }
		);
	    }
	);
    }
);

/**
 * Stopped here !!!
 * */
app.get( '/admin/Users',
    function( req, res ) {
	auth_mgt(req, res,
	    function() {
		backend.get_waiting_comments_count( mysql_connection,
		    function( waiting_comments ) {
			res.render("create_user.ejs",{ subjects : subjects, waiting_comments : waiting_comments } );
		    }
		);
	    }
	);
    }
);

app.post( '/post_new_user',
    function( req, res ) {
	console.log('plop');
	auth_mgt(req, res,
	    function() {
		console.log('plop bis');
		var login = mysql.escape(req.body.name);
		var pass = req.body.pass;
		backend.create_user( mysql_connection, login, pass, 
		    function( waiting_comments ) {
			res.redirect("/admin/Users");
		    }
		);
	    }
	);
    }
);

app.get( '/admin/projet_mgt/:id',
    function (req, res) {
	auth_mgt(req, res,
	    function() {
		backend.get_project_by_id( mysql_connection, req.params.id,
		    function( projet ) {
			backend.get_waiting_comments_count( mysql_connection, 
			    function( waiting_comments ) {
				res.render("projet_mgt_text_edition.ejs", {subjects : subjects, waiting_comments : waiting_comments, projet: projet[0] } );
			    }
			);
		    }
		);
	    }
	);
    }
);

app.post( '/post_update_projet_text/:id',
    function ( req, res ) {
	auth_mgt(req, res,
	    function() {
		backend.update_projet_details( mysql_connection, mysql.escape( req.params.id ), mysql.escape( req.body.details ),
		    function() {
			res.redirect("/projets/"+req.params.id );
		    }
		);
	    }
	);
    }
);
