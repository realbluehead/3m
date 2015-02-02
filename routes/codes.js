var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var aLlista = [];
/* GET home page. */
router.get('/loads/', function(req, res, next) {
  
	var MongoClient = mongo.MongoClient;
	var ObjectId = mongo.ObjectID;

	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3_codes');
	    // CARREGUEM L'ARBRE DE CODIS
	    collection.find().toArray(function(err, docs) {
	      if (err) console.log(err);
	      	// tenim l'arbre pero estaria be tenir un array indexat per id_codi
	      	console.log(docs);
	      	aLlista = [];
	      	generaLlista(docs[0].codis, '', function()
	      		{
	      			console.log(aLlista);
	      				var mongoClient2 = mongo.MongoClient;
						mongoClient2.connect('mongodb://127.0.0.1:27017/m3', function(err, db2) {
						    if(err) throw err;

						    var collection2 = db2.collection('m3_codes_llista');
						    // CARREGUEM L'ARBRE DE CODIS
						    var oCodis = {codis:aLlista};
						     collection2.findAndModify(null,[],oCodis, function(err, doc)
						    {
						      if (err) 
						      	{
						      		console.log("salvat fals!!!");
						      		console.log(err);
						      	}
						      	console.log("importats");
						      	console.log();
						      	db2.close(
			      				function(oCodis) {
			      						db.close(function() {
			      						res.send(aLlista);
			      					});
			      				});
						     });
						 });
	      			
		     		
	      		});
      		
      		

	    });
	  })
	
});

router.get('/load/', function(req, res, next) {
  
	var MongoClient = mongo.MongoClient;
	var ObjectId = mongo.ObjectID;

	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3_codes_llista');
	    // CARREGUEM L'ARBRE DE CODIS
	    collection.find().toArray(function(err, docs) {
	      if (err) console.log(err);
	      	// tenim l'arbre pero estaria be tenir un array indexat per id_codi
	      	console.log(docs);
	      	var aLlista = [];
	      	var aResult = {tree:null,
      						codis:docs[0].codis,
      						prova:'b'};
	      	db.close(
	      				function() {
	      					res.send(aResult);
	      				});
	    });
	  })
	
});
router.post('/save/', function(req,res,next)
{
	var oCodis = {codis:req.body.codes};
	//console.log(oCodis);

	var mongoClient = mongo.MongoClient;
	mongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3_codes_llista');
	    // CARREGUEM L'ARBRE DE CODIS
	     collection.findAndModify(null,[],oCodis, function(err, doc)
	    {
	      if (err) 
	      	{
	      		console.log("salvat fals!!!");
	      		console.log(err);
	      	}
	      	// tenim l'arbre pero estaria be tenir un array indexat per id_codi
	      	console.log("salvat");
	      	db.close(
	      				function() {
res.send({count:oCodis.length});

	      				});
	      	
	      });
	});
	
});

function generaLlista(aArbre, sPrefix, callback)
{
	var iCurrent=0;
	var iNum = aArbre.length;
	for(var i=0;i<aArbre.length;i++)
	{
		var aCodi = aArbre[i];
		aLlista.push({id:aCodi.id, nom:sPrefix+'/'+aCodi.name});
		if(aCodi['children'].length>0)
		{
			generaLlista(aCodi['children'],sPrefix+'/'+aCodi.name, function()
				{
					iCurrent++;
					if(iCurrent==iNum) callback();
				});
		} else
		{
			iCurrent++;
			if(iCurrent==iNum) callback();
		}
	}

}


module.exports = router;