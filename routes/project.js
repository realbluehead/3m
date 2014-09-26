var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

/* GET home page. */
router.post('/save/:id', function(req, res, next) {
	console.log(req.body);
	var iId = req.params.id;
	var oProjecte = req.body.projecte;
	var MongoClient = mongo.MongoClient;
	var ObjectId = mongo.ObjectID;
	
	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3');

	    collection.findOne({'_id': new ObjectId(iId)}, function(err, docs) {
	      if (err) console.log(err);
	      // Tenim el doc original. El modifiquem
	      
	      docs.projecte.grups = oProjecte.grups;
	      docs.projecte.aTrans = oProjecte.aTrans;
	      collection.findAndModify({'_id': new ObjectId(iId)},[],docs, function(err, doc)
	    	{
	    		console.log('updated');
	    		console.log(docs.projecte.grups);
	     		res.send('Hola');
	    	});
	     
	    });
	  })
	
});

router.get('/load/:id', function(req, res, next) {
   var iId = req.params.id;
 
   console.log("ID: "+iId);
	var MongoClient = mongo.MongoClient;
	var ObjectId = mongo.ObjectID;
	
	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3');
	    collection.findOne({'_id': new ObjectId(iId)}, function(err, docs) {
	    	//docs.projecte.aTrans = docs.projecte.aTrans2;
	      if (err) console.log(err);
	     	res.send(docs);
	    });
	  })
	
});




module.exports = router;