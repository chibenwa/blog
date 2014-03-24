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

exports.get_10_last_articles = function(mysql_connection, callback) {
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

exports.get_article_by_id = function(mysql_connection, mysql, id, callback) {
    mysql_connection.query("SELECT * FROM article WHERE id="+mysql.escape(id), 
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

exports.list_years = function(mysql_connection, callback) {
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

exports.list_month = function(mysql_connection, mysql, n, callback) {
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

exports.list_month_content = function (mysql_connection, mysql, n, m, callback) {
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

exports.list_articles_by_topic = function (mysql_connection, mysql, n, callback) {
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

exports.add_comment = function( mysql_connection, comment_titre, comment_creator, comment_text, comment_article) {
    var q = "INSERT INTO commentaire(title, text, creator, date, valid, article) VALUES("+comment_titre+", "+comment_text+", "+comment_creator+", NOW(), '0', "+comment_article+")";
    mysql_connection.query(q,
	function( err, res ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    }
	}
    );
};

exports.get_projects = function(mysql_connection, callback) {
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

exports.get_project_by_id = function(mysql_connection, projet_id, callback) {
    mysql_connection.query("SELECT * FROM projet WHERE id="+projet_id,
	function (err,res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(res);
	    }
	}
    );
};

exports.get_waiting_comments_count = function( mysql_connection, callback ) {
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

exports.create_article = function( mysql_connection, mysql, req, callback ) {
    var d = new Date;
    mysql_connection.query("INSERT INTO article(title, summary, text, date, year, month, day, subject) VALUES("+mysql.escape(req.body.title)+", "+mysql.escape(req.body.summary)+", "+mysql.escape(req.body.text)+", NOW(),"+mysql.escape(d.getFullYear())+", "+mysql.escape(d.getMonth())+", "+mysql.escape(d.getDate())+", "+mysql.escape(req.body.theme)+")",
	function( err, res ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( res.insertId );
	    }
	}
    );
};

exports.certify_admin = function( mysql_connection, login, pass, callback ) {
    mysql_connection.query( "SELECT * FROM user WHERE name="+login,
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

exports.create_project = function( mysql_connection, name, summary, git_clone, ended, etat, progress, details, callback ) {
    mysql_connection.query("INSERT INTO projet(name, summary, git_clone, ended, etat, progress, details, begin, end) VALUES("+name+", "+summary+", "+git_clone+", "+ended+", "+etat+", "+progress+", "+details+", NOW(), NOW())",
	function( err, res ) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( res.insertId );
	    }
	}
    );
};

exports.projet_update_progress = function( mysql_connection, id, progress, callback) {
    mysql_connection.query("UPDATE `projet` SET progress="+progress+" WHERE id="+id,
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(  );
	    }
	}
    );
};

exports.projet_update_ended = function ( mysql_connection, id, ended, callback ) {
    mysql_connection.query("UPDATE `projet` SET ended="+ended+", end=NOW(), progress='100', etat='3' WHERE id="+id,
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(  );
	    }
	}
    );
};

exports.projet_update_etat = function ( mysql_connection, id, etat, callback ) {
    mysql_connection.query("UPDATE `projet` SET etat="+etat+" WHERE id="+id,
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback(  );
	    }
	}
    );
};

exports.get_waiting_comments = function ( mysql_connection, callback ) {
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

exports.accept_comment = function ( mysql_connection, id, callback ) {
    mysql_connection.query("UPDATE `commentaire` SET valid='1' WHERE id="+id,
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( );
	    }
	}
    );
};

exports.delete_comment = function ( mysql_connection, id, callback ) {
    mysql_connection.query("DELETE FROM commentaire WHERE id="+id,
	function( err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( );
	    }
	}
    );
};

exports.create_user = function ( mysql_connection, login, pass, callback ) {
    var sha2 = crypto.createHash('sha1');
    sha2.update(salt + pass);
    var q= "INSERT INTO user(name, pass) VALUES("+ login +", '"+ sha2.digest('hex') +"')";
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

exports.update_projet_details = function( mysql_connection, id, details, callback ) {
    mysql_connection.query("UPDATE `projet` SET details="+details+" WHERE id="+id ,
	function(err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( );
	    }
	}
    );
};

exports.insert_new_notif = function (mysql_connection, projet, type, text, callback ) {
    var q= "INSERT INTO projet_notification(projet, type, text, date) VALUES("+projet+","+type+","+text+",NOW())";
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

exports.select_project_notifs = function( mysql_connection, project_id, callback ) {
    mysql_connection.query("SELECT * FROM projet_notification WHERE projet="+project_id+" ORDER BY date DESC",
	function(err, res) {
	    if( err ) {
		console.log("SQL Error : " + err);
	    } else {
		callback( res );
	    }
	}
    );
};

exports.get_20_last_notifs = function( mysql_connection, callback ) {
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
