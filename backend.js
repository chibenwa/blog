// Here we create our sql connection

var mysql = require('mysql');

var connection_params = {
  host     : 'localhost',
  user     : 'root',
  password : 'chibuya',
  database : 'Node_blog'

};

var mysql_connection;

function handleDisconnect() {
    mysql_connection = mysql.createConnection(connection_params);

    mysql_connection.connect(
	function(err) {              // The server is either down or restarting (takes a while sometimes).
	    if(err) {
		console.log('error when connecting to db:', err);
		setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,to avoid a hot loop, and to allow our node script to process asynchronous requests in the meantime. If you're also serving http, display a 503 error.
	    }
	}
    );
    mysql_connection.on('error',
	function(err) {
	    console.log('db error', err);
	    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
		// Connection to the MySQL server is usually lost due to either server restart, or a connnection idle timeout (the wait_timeout server variable configures this)
		handleDisconnect();
	    } else {
		throw err;
	    }
	}
    );
}

handleDisconnect();



// Crypto utils

var salt = "benwablog";

var crypto = require('crypto')
  , shasum = crypto.createHash('sha1');

// utils...

function to_month(n) {
    switch( n ) {
	case 0 :
	    return "Janvier";
	    break;
	case 1 :
	    return "Février";
	    break;
	case 2 :
	    return "Mars";
	    break;
	case 3 :
	    return "Avril";
	    break;
	case 4 :
	    return "Mai";
	    break;
	case 5 :
	    return "Juin";
	    break;
	case 6 :
	    return "Juillet";
	    break;
	case 7 :
	    return "Août";
	    break;
	case 8 :
	    return "Septembre";
	    break;
	case 9 :
	    return "Octobre";
	    break;
	case 10 :
	    return "Novembre";
	    break;
	default :
	    return "Décembre";
	    break;
    }
}

// Here we will interact with our Database ...

exports.get_10_last_articles = function( callback) {
    mysql_connection.query("SELECT * FROM article ORDER BY DATE  DESC LIMIT 10",
	function(err, q_res) {
	    if( err ) {
		console.log("SQL error : " + err );
	    } else {
		callback(q_res);
	    }
	}
    );
};

exports.get_article_by_id = function(id, callback) {
    mysql_connection.query("SELECT * FROM article WHERE article.id="+mysql.escape(id),
	function (err, res) {
	    if( err ) {
		console.log( "SQL Error : " + err );
	    } else {
		if( res.length == 0 ) {
		    callback( false, {}, [] );
		} else {
		    mysql_connection.query("SELECT * FROM commentaire WHERE valid='1' and article="+mysql.escape(id),
			function( err1, res1 ) {
			    if( err ) {
				console.log( "SQL Error : " + err );
			    } else {
				callback( true, res[0], res1 );
			    }
			}
		    );
		}
	    }
	}
    );
};

exports.list_years = function( callback) {
    mysql_connection.query("SELECT year FROM article GROUP BY year ORDER BY year DESC",
	function (err, res) {
	    if( err ) {
		console.log( "SQL Error : " + err );
	    } else {
		callback( res );
	    }
	}
    );
};

exports.list_month = function( n, callback) {
    mysql_connection.query("SELECT month FROM article WHERE year="+mysql.escape(n)+" GROUP BY month ORDER BY month DESC",
	function (err, res) {
	    if( err ) {
		console.log( "SQL Error : " + err );
	    } else {
		var months = Array();
		for( var  i=0; i<res.length; i++ ) {
		    switch( res[i].month ) {
			case 0 :
			    months[i] = "Janvier";
			    break;
			case 1 :
			    months[i] = "Février";
			    break;
			case 2 :
			    months[i] = "Mars";
			    break;
			case 3 :
			    months[i] = "Avril";
			    break;
			case 4 :
			    months[i] = "Mai";
			    break;
			case 5 :
			    months[i] = "Juin";
			    break;
			case 6 :
			    months[i] = "Juillet";
			    break;
			case 7 :
			    months[i] = "Août";
			    break;
			case 8 :
			    months[i] = "Septembre";
			    break;
			case 9 :
			    months[i] = "Octobre";
			    break;
			case 10 :
			    months[i] = "Novembre";
			    break;
			default :
			    months[i] = "Décembre";
			    break;
		    }
		}
		callback( res , months);
	    }
	}
    );
};

exports.list_month_content = function ( n, m, callback) {
    mysql_connection.query("SELECT * FROM article WHERE year="+mysql.escape(n)+" and month="+mysql.escape(m)+" ORDER BY day DESC",
	function (err, res) {
	    if( err ) {
		console.log( "SQL Error : " + err );
	    } else {
		callback( res, to_month(m) );
	    }
	}
    );
};

exports.list_articles_by_topic = function ( n, callback) {
    mysql_connection.query("SELECT * FROM article WHERE subject="+mysql.escape(n)+" ORDER BY date DESC ",
	function (err, res) {
	    if( err ) {
		console.log( "SQL Error : " + err );
	    } else {
		callback( res );
	    }
	}
    );
};

exports.add_comment = function( comment_titre, comment_creator, comment_text, comment_article, gravatar) {
    var q = "INSERT INTO commentaire(title, text, creator, date, valid, article, gravatar) VALUES("+mysql.escape(comment_titre)+", "+mysql.escape(comment_text)+", "+mysql.escape(comment_creator)+", NOW(), '1', "+mysql.escape(comment_article)+","+mysql.escape(gravatar)+")";
    mysql_connection.query(q,
	function( err, res ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    }
	}
    );
};

exports.get_projects = function(callback) {
    mysql_connection.query("SELECT * FROM projet ORDER BY begin DESC",
	function(err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(res);
	    }
	}
    );
};

exports.get_project_by_id = function( projet_id, callback) {
    mysql_connection.query("SELECT * FROM projet WHERE id="+mysql.escape(projet_id),
	function (err,res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(res);
	    }
	}
    );
};

exports.get_waiting_comments_count = function( callback ) {
    mysql_connection.query("SELECT COUNT(*) AS comment_nb FROM commentaire WHERE valid='0'",
	function( err, res ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(res[0].comment_nb);
	    }
	}
    );
};

exports.create_article = function( req, callback ) {
    var d = new Date;
    mysql_connection.query("INSERT INTO article(title, summary, text, date, year, month, day, subject, tags) VALUES("+mysql.escape(req.body.title)+", "+mysql.escape(req.body.summary)+", "+mysql.escape(req.body.text)+", NOW(),"+mysql.escape(d.getFullYear())+", "+mysql.escape(d.getMonth())+", "+mysql.escape(d.getDate())+", "+mysql.escape(req.body.theme)+", "+mysql.escape(req.body.tags)+")",
	function( err, res ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( res.insertId );
	    }
	}
    );
};

exports.certify_admin = function(  login, pass, callback ) {
    mysql_connection.query( "SELECT * FROM user WHERE name="+mysql.escape(login),
	function (err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		if( res.length < 1 ) {
		    callback( false );
		} else {
		    // Here we will verify password
		    shasumbis= crypto.createHash('sha1');
		    shasumbis.update( salt + pass );
		    if( res[0].pass == shasumbis.digest('hex') ) {
		      callback(true);
		    } else {
		      callback(false);
		    }
		}
	    }
	}
    );
};

exports.create_project = function( name, summary, git_clone, ended, etat, progress, details, callback ) {
    mysql_connection.query("INSERT INTO projet(name, summary, git_clone, ended, etat, progress, details, begin, end) VALUES("+mysql.escape(name)+", "+mysql.escape(summary)+", "+mysql.escape(git_clone)+", "+mysql.escape(ended)+", "+mysql.escape(etat)+", "+mysql.escape(progress)+", "+mysql.escape(details)+", NOW(), NOW())",
	function( err, res ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( res.insertId );
	    }
	}
    );
};

exports.projet_update_progress = function(  id, progress, callback) {
    mysql_connection.query("UPDATE `projet` SET progress="+mysql.escape(progress)+" WHERE id="+mysql.escape(id),
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(  );
	    }
	}
    );
};

exports.projet_update_ended = function (  id, ended, callback ) {
    mysql_connection.query("UPDATE `projet` SET ended="+mysql.escape(ended)+", end=NOW(), progress='100', etat='3' WHERE id="+mysql.escape(id),
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(  );
	    }
	}
    );
};

exports.projet_update_etat = function ( id, etat, callback ) {
    mysql_connection.query("UPDATE `projet` SET etat="+mysql.escape(etat)+" WHERE id="+mysql.escape(id),
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(  );
	    }
	}
    );
};

exports.get_waiting_comments = function ( callback ) {
    mysql_connection.query("SELECT * FROM commentaire WHERE valid='0' ",
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( res );
	    }
	}
    );
};

exports.accept_comment = function ( id, callback ) {
    mysql_connection.query("UPDATE `commentaire` SET valid='1' WHERE id="+mysql.escape(id),
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( );
	    }
	}
    );
};

exports.delete_comment = function ( id, callback ) {
    mysql_connection.query("DELETE FROM commentaire WHERE id="+mysql.escape(id),
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( );
	    }
	}
    );
};

exports.create_user = function (  login, pass, callback ) {
    var sha2 = crypto.createHash('sha1');
    sha2.update(salt + pass);
    var q= "INSERT INTO user(name, pass) VALUES("+ mysql.escape(login) +", '"+ sha2.digest('hex') +"')";
    mysql_connection.query( q ,
	function( err, res ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( );
	    }
	}
    );

};

exports.update_projet_details = function( id, details, callback ) {
    mysql_connection.query("UPDATE `projet` SET details="+mysql.escape(details)+" WHERE id="+mysql.escape(id) ,
	function(err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( );
	    }
	}
    );
};

exports.insert_new_notif = function ( projet, type, text, callback ) {
    var q= "INSERT INTO projet_notification(projet, type, text, date) VALUES("+mysql.escape(projet)+","+mysql.escape(type)+","+mysql.escape(text)+",NOW())";
    mysql_connection.query(q ,
	function(err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( );
	    }
	}
    );
};

exports.select_project_notifs = function( project_id, callback ) {
    mysql_connection.query("SELECT * FROM projet_notification WHERE projet="+mysql.escape(project_id)+" ORDER BY date DESC",
	function(err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( res );
	    }
	}
    );
};

exports.get_20_last_notifs = function( callback ) {
    mysql_connection.query("SELECT * FROM projet_notification ORDER BY date DESC LIMIT 20",
	function(err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( res );
	    }
	}
    );
};

exports.modify_article = function ( id, text, callback) {
    mysql_connection.query("UPDATE `article` SET text="+mysql.escape(text)+" WHERE id="+mysql.escape(id),
	function( err, ress ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback();
	    }
	}
    );
};

exports.get_articles = function ( callback ) {
    mysql_connection.query("SELECT * FROM article ORDER BY date DESC",
	function( err, res ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(res);
	    }
	}
    );
};

exports.get_articles_by_tag = function( tag, callback ) {
    mysql_connection.query("SELECT * FROM article WHERE tags LIKE '%"+tag+"%' ORDER BY date DESC",
	function( err, res ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(res);
	    }
	}
    );
};
