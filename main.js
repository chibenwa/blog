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

// Managing uploads

var file = require('./file');
app.use(express.methodOverride());
app.use(express.bodyParser({ keepExtensions: true, uploadDir: 'tmp' }));

// Use our backend

var backend = require('./backend');

// Use our RSS reader

var benwa_rss = require('./benwa_rss');

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

// Import RSS list

function my_feed_import() {
    backend.get_10_last_articles(  
	function ( lasts_artcicles) {
	    benwa_rss.import_feeds( lasts_artcicles,
		function() {
		    benwa_rss.build_xml(
			function() {
			
			}
		    );
		}
	    );
	}
    );
}

function prj_rss_create() {
    backend.get_projects( 
	function( projets ) {
	    backend.get_20_last_notifs(
		function( notifs ) {
		    benwa_rss.add_notifs(projets, notifs,
			function(){
			    benwa_rss.build_xml_prj(
				function() {
				    
				}
			    );
			}
		    );
		}
	    );
	}
    );
}

function renew_prj_feeds() {
    benwa_rss.renew_second_feed(
	function() {
	    backend.get_20_last_notifs( 
		function(notifs) {
		    backend.get_projects(
			function(projets) {
			    benwa_rss.add_notifs(projets, notifs,
				function(){
				    benwa_rss.build_xml_prj( function(){} );
				}
			    );
			}
		    );
		}
	    );
	}
    );
}

my_feed_import();

prj_rss_create();

// Serve RSS list...

app.get( '/rss.xml',
    function(req, res) {
	benwa_rss.get_xml(
	    function(xml){
		res.setHeader('Content-Type', 'text/plain');
		res.end(xml);
	    }
	);
    }
);

app.get( '/rss_prj.xml',
    function(req, res) {
	benwa_rss.get_xml_prj(
	    function(xml){
		res.setHeader('Content-Type', 'text/plain');
		res.end(xml);
	    }
	);
    }
);

// And Here we will deal with what to do if a page gets visited

app.get( '/', 
    function(req, res) {
	backend.get_10_last_articles( 
	    function(articles) {
		res.render("index.ejs",{subjects : subjects, articles : articles, markdown : markdown});
	    }
	);
    }
);

app.get( '/article/:article_id',
    function(req,res) {
	var n = ~~Number(req.params.article_id);
	if( String(n) == req.params.article_id ) {
	    backend.get_article_by_id( req.params.article_id,
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
	backend.list_years(
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
	    backend.list_month( n,
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
	    backend.list_month_content( n, m,
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
	    backend.list_articles_by_topic( n,
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
	backend.get_projects( 
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
	    backend.get_project_by_id( req.params.projet_id,
		function ( projets ) {
		    if( projets.length == 0 ) {
			res.render("404.ejs", {subjects : subjects} );
		    } else {
			backend.select_project_notifs( n, 
			    function( notifs ) {
				res.render("projet.ejs",{ subjects : subjects, projet : projets[0] , markdown : markdown, notifs : notifs });
			    }
			);
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
	var comment_title = req.body.titre;
	var comment_creator = req.body.creator;
	var comment_text = req.body.text;
	var comment_article = req.body.article;
	var n = ~~Number(req.body.article);
	if( String(n) == req.body.article ) {
	    backend.add_comment( comment_title, comment_creator, comment_text, comment_article);
	}
	res.redirect('/article/'+n );
    }
);

app.get( '/admin', 
    function(req, res) {
	auth_mgt(req, res,
	    function() {
		backend.get_waiting_comments_count(
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
		backend.create_article( req,
		    function( insert_id ) {
			benwa_rss.renew_first_feed(
			    function() {
				my_feed_import();
				res.redirect('/article/'+insert_id );
			    }
			);
		    }
		);
	    }
	);
    }
);


app.post( '/post_auth',
    function( req, res ) {
	if( ! is_authentified( req ) ) {
	    var login = req.body.login;
	    var pass = req.body.pass;
	    backend.certify_admin( login,  pass,
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
		backend.get_waiting_comments_count(
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
	var name = req.body.name ;
	var summary = req.body.summary ;
	var git_clone =  req.body.git_clone ;
	var ended = req.body.ended ;
	var etat = req.body.etat ;
	var progress = req.body.progress ;
	var details = req.body.details ;
	auth_mgt( req, res,
	    function() {
		backend.create_project( name, summary, git_clone, ended, etat, progress, details,
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
		backend.get_waiting_comments_count( 
		    function( waiting_comments ) {
			backend.get_projects(
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
        var progress = req.body.progress;
	var id = req.params.id;
	auth_mgt(req, res,
	    function() {
		backend.projet_update_progress( id, progress,
		    function () {
			var projet =  req.params.id ;
			var type =  1 ;
			var text =  "Réalisé à " + req.body.progress + "%" ;
			backend.insert_new_notif( projet, type, text,
			    function () {
				renew_prj_feeds();
			    }
			);
			res.redirect("/admin/projet_mgt");
		    }
		);
	    }
	);
    }
);

app.post( '/post_update_ended/:id',
    function (req, res) {
	var ended = req.body.ended;
	var id = req.params.id;
	auth_mgt(req, res,
	    function() {
		backend.projet_update_ended( id, ended,
		    function () {
			var projet =  req.params.id ;
			var type = 2 ;
			var text = "Le projet est bouclé" ;
			backend.insert_new_notif( projet, type, text,
			    function () {
				renew_prj_feeds();
			    }
			);
			res.redirect("/admin/projet_mgt");
		    }
		);
	    }
	);
    }
);

app.post( '/post_update_etat/:id',
    function (req, res) {
	var etat = req.body.etat;
	var id = req.params.id;
	auth_mgt(req, res,
	    function() {
		backend.projet_update_etat( id, etat,
		    function () {
			var projet =  req.params.id ;
			var type = 2 ;
			var t;
			if( req.body.etat == 0 ) {
			    t = "Reprise du travail";
			} else {
			    if ( req.body.etat == 1 ) {
				 t = "Arrêt temporaire du développement";
			    } else {
				if ( req.body.etat == 2 ) {
				    t = "Arrêt définitif du développement";
				} else {
				    t = "Le projet est bouclé";
				}
			    }
			}
			var text =  t ;
			backend.insert_new_notif( projet, type, text,
			    function () {
				renew_prj_feeds();
			    }
			);
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
		backend.get_waiting_comments( 
		    function( comments ) {
			backend.get_waiting_comments_count( 
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
		backend.accept_comment( id,
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
		backend.delete_comment( id,
		    function () {
			res.redirect("/admin/comment_mgt");
		    }
		);
	    }
	);
    }
);

app.get( '/admin/Users',
    function( req, res ) {
	auth_mgt(req, res,
	    function() {
		backend.get_waiting_comments_count( 
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
		var login = req.body.name;
		var pass = req.body.pass;
		backend.create_user( login, pass, 
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
		backend.get_project_by_id( req.params.id,
		    function( projet ) {
			backend.get_waiting_comments_count( 
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
		backend.update_projet_details(  req.params.id ,  req.body.details ,
		    function() {
			res.redirect("/projets/"+req.params.id );
		    }
		);
	    }
	);
    }
);

app.get( '/rss/docs.html' ,
    function ( req, res ) {
	benwa_rss.get_rss_feed( 
	    function ( feeds ) {
		res.render('doc_rss.ejs', { subjects : subjects, feeds : feeds } );
	    }
	);
    }
);

/**
 * 
 * Code for notification on projects :
 * 0 : human posted
 * 1 : modification of avancement
 * 2 : status modification
 *
 * */

app.post( '/post_new_notification/:id',
    function( req, res) {
	auth_mgt(req, res,
	    function() {
		var projet =  req.params.id ;
		var type =  0 ;
		var text =  req.body.notification ;
		backend.insert_new_notif( projet, type, text,
		    function() {
			renew_prj_feeds();
		    }
		);
		res.redirect('/admin/projet_mgt');
	    }
	);
    }
);

app.get('/admin/mod_article/:id',
    function( req, res) {
	auth_mgt(req, res,
	    function() {
		backend.get_article_by_id( req.params.id,
		    function(b, article) {
			backend.get_waiting_comments_count( 
			    function( waiting_comments ) {
				res.render("article_mod.ejs",{subjects : subjects, article : article, waiting_comments : waiting_comments});
			    }
			);
		    }
		);
	    }
	);
    }
);

app.post( '/post_new_article/:id',
    function( req, res) {
	auth_mgt(req, res,
	    function() {
		backend.modify_article(req.params.id, req.body.text , 
		    function() {
			
		    }
		);
		res.redirect('/article/'+ req.params.id );
	    }
	);
    }
);

app.get( '/admin/list_articles',
    function( req, res) {
	auth_mgt(req, res,
	    function() {
		backend.get_articles(
		    function( articles ) {
			backend.get_waiting_comments_count(
			    function( waiting_comments ) {
				res.render( "list_articles.ejs" ,{ waiting_comments : waiting_comments, subjects : subjects, articles : articles });
			    }
			);
		    }
		);
	    }
	);
    }
);

app.get( '/admin/upload', 
    function( req, res) {
	auth_mgt(req, res,
	    function() {
		backend.get_waiting_comments_count(
		    function( waiting_comments ) {
			var public_content = Array();
			file.ls( "public", public_content );
			res.render( "upload.ejs" ,{ waiting_comments : waiting_comments, subjects : subjects, public_content : public_content } );
		    }
		);
	    }
	);
    }
);

app.post( '/upload_file',
    function( req, res) {
	auth_mgt(req, res,
	    function() {
		if( req.files == undefined && req.files.file == undefined ) {
		    console.log("No file uploaded...");
		} else {
		    file.rename( req.files.file.path, "public/" + req.body.filename ,
			function() {
			    console.log( "copying "+req.files.file.path+" to public/"+req.body.filename );
			}
		    );
		}
		res.redirect("/admin/upload");
	    }
	);
    }
);

app.post( '/create_dir',
    function( req, res) {
	auth_mgt(req, res,
	    function() {
		file.createDir( "public/" + req.body.dirname, function() {} );
		res.redirect("/admin/upload");
	    }
	);
    }
);


