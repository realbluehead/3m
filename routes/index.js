var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient
/* GET home page. */
router.get('/', function(req, res, next) {
	// pagina inicial on carreguem projectes pel menú
	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3');
	    collection.find({},{'sort':'nom'}).toArray(function(err, results) {
	       	data = results;
	        // Tanquem la db
	        db.close(function()
	        	{
	        		 res.render('index', { title: '3M', data: data });
	        	});
	       
	      });
	});
  	
});

module.exports = router;
