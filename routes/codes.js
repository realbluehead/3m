var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var aLlista = [];
/* GET home page. */
router.get('/load/', function(req, res, next) {
  
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
	      	generaLlista(docs[0].codis, function()
	      		{
	      			console.log(aLlista);
	      				aResult = {tree:docs[0],
      						codis:aLlista,
      						prova:'a'};
	      			console.log("FINAL"+aResult.codis);
		     		res.send(aResult);
	      		});
      		
      		

	    });
	  })
	
});

function generaLlista(aArbre, callback)
{
	var iCurrent=0;
	var iNum = aArbre.length;
	for(var i=0;i<aArbre.length;i++)
	{
		var aCodi = aArbre[i];
		aLlista[aCodi.id] = {id:aCodi.id, name:aCodi.name, id_pare:aCodi.id_pare};
		if(aCodi['children'].length>0)
		{
			generaLlista(aCodi['children'], function()
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