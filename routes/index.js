var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient
/* GET home page. */
router.get('/', function(req, res, next) {
	// pagina inicial on carreguem projectes pel menú
	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3');
	    var cursor = collection.find({}).batchSize(2);
	    var data = [];
	    cursor.each(function(err, item) {
	 		console.log("item");
	 		if(!err) 
	 		{
		       	if(item==null)
		       	{
			        // Tanquem la db
			        console.log("acabem");
			        db.close(function()
			        	{
			        		 res.render('index', { title: '3M', data: data });
			        	});
		       }
	      	 data.push(item);
	      	}
	      	else console.log(err);
	      });

	   
	});
  	
});

module.exports = router;
