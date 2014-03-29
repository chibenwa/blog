
var fs = require('fs');

exports.rename = function ( previousName, nextName, callback ) {
    fs.rename( previousName, nextName , callback );
};

exports.ls = function ( path, res ) {
    var fileList = fs.readdirSync( path );
    for( var i = 0; i < fileList.length; i++ ) {
	var stats = fs.statSync( path + "/" + fileList[i] );
	if( stats.isDirectory() ) {
	    res.push( {isD : true, filePath : path + "/" +  fileList[i]} );
	    if( path + "/" + fileList[i] != "public/doc" ) {
		exports.ls( path + "/" + fileList[i], res );
	    } 
	} else {
	    res.push( {isD : false, filePath : path + "/" + fileList[i] } );
	}
    }
};

exports.createDir = function ( dirName, callback ) {
    fs.mkdir( dirName,
	function () {
	    console.log( "Creating dir " + dirName );
	    callback();
	}
    );
};
