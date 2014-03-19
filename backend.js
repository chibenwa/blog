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

