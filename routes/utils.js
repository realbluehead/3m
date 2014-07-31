var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

/* import code tree */
router.get('/import_codes', function(req, res) {
   //
	var pg = require('pg');
	var conString = "postgres://postgres:@localhost/carlesti";

	pg.connect(conString, function(err, client, done) {
	  if(err) {
	    return console.error('error fetching client from pool', err);
	  }
	   console.log("Import codes from Postgres to MongoDB");
	   importCodes(client,0, function(aCodes)
	   	 {
	   	 	  saveCodis(aCodes);
	   	 });
	 
	   done();
	});

	res.send("FET");
});
/* import codificions */
router.get('/import_codings', function(req, res) {
   //
	var pg = require('pg');
	var conString = "postgres://postgres:@localhost/carlesti";

	pg.connect(conString, function(err, client, done) {
	  if(err) {
	    return console.error('error fetching client from pool', err);
	  }
	   console.log("Import codings from Postgres to MongoDB");
	   importCodings(client, function()
	   	{
	   		console.log("Codificacions Importades");
	   	});
	 
	   done();
	});

	res.send("FET");
});
/* import transcriptions. */
router.get('/import_transcriptions', function(req, res) {
   //
	var pg = require('pg');
	var conString = "postgres://postgres:@localhost/carlesti";

	pg.connect(conString, function(err, client, done) {
	  if(err) {
	    return console.error('error fetching client from pool', err);
	  }
	  console.log("Import projects from Postgres to MongoDB");
	  //readProjects(client);
	   done();
	});

	res.send("FET");
});

module.exports = router;

function importCodings(client, callback)
{
	var MongoClient = mongo.MongoClient;
	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3');
	    collection.find().toArray(function(err, docs) {
	      	if (err) console.log(err);
	    	var iNum = docs.length;
	    	var iCurrent = 0;
	      	docs.forEach(function(oDoc)
		    {
		    	getCodings(client, collection, oDoc, function()
		    	{
					iCurrent++;
					if(iCurrent==iNum)  callback();
		    	});
		   	});
	    });
	  })
}
function getCodings(client,collection, aDoc, callback)
{
	
	// Rebo un aDoc
	// Processo els blocs de audio
	var iBlock = 0;
	//console.log(aDoc.projecte.aTrans.audio[0]);
	aDoc.projecte.aTrans.audio.forEach(function(oBlock)
		{
			getCodesAndUpdate(client, oBlock, iBlock, function(iNewBlock,aCodings)
				{
 					aDoc.projecte.aTrans.audio[iNewBlock].codings = aCodings;
				    // fem update del document
				    collection.findAndModify({nom:aDoc.nom},[],aDoc, function(err, doc)
				    	{
				    		console.log('updated');
				    	});
				});
			
			iBlock++;
		});

	var iBlock = 0;
	//console.log(aDoc.projecte.aTrans.text[0]);
	aDoc.projecte.aTrans.text.forEach(function(oBlock)
		{
			getCodesAndUpdate(client, oBlock, iBlock, function(iNewBlock,aCodings)
				{
 					aDoc.projecte.aTrans.text[iNewBlock].codings = aCodings;
				    // fem update del document
				    collection.findAndModify({nom:aDoc.nom},[],aDoc, function(err, doc)
				    	{
				    		console.log('updated');
				    	});
				});
			
			iBlock++;
		});

	var iBlock = 0;
	//console.log(aDoc.projecte.aTrans.video[0]);
	aDoc.projecte.aTrans.video.forEach(function(oBlock)
		{
			getCodesAndUpdate(client, oBlock, iBlock, function(iNewBlock,aCodings)
				{
 					aDoc.projecte.aTrans.video[iNewBlock].codings = aCodings;
				    // fem update del document
				    collection.findAndModify({nom:aDoc.nom},[],aDoc, function(err, doc)
				    	{
				    		console.log('updated');
				    	});
				});
			
			iBlock++;
		});
	
}

function getCodesAndUpdate(client, oBlock, iBlock, callback)
{
	id_start_bloc = oBlock['id'];
	client.query('SELECT * from codificacio WHERE id_start_bloc=$1', [id_start_bloc], function(err, result) {
			    //call `done()` to release the client back to the pool
			     if(err) {
			      return console.error('error running query', err);
			    }
			    if(result.rows.length>0) 
		    	{
		    		console.log("BLOCK "+iBlock);
		    		console.log(result.rows.length);
				    callback(iBlock, result.rows);
				}
			});
}

function importCodes(client,id_pare, callback)
{
	client.query('SELECT * from code WHERE id_pare=$1', [id_pare], function(err, result) {
	    //call `done()` to release the client back to the pool
	     if(err) {
	      return console.error('error running query', err);
	    }
	    var aCodis = [];
	    var iNum = result.rows.length;
	    var iCurrent = 0;
	    if(iNum>0)
	    {
		    result.rows.forEach(function(oCodi)
		    {
		    	importCodes(client, oCodi.id, function(aChilds)
	    		{
	    			oCodi.children = aChilds;
	    			aCodis.push(oCodi);
	    			iCurrent++;
	    			if(iCurrent==iNum)  callback(aCodis);
	    		});
				
		    })
		}
		else callback([]);
	   
	});
}
function readProjects(client)
{
	client.query('SELECT * from projecte WHERE id=id', function(err, result) {
	    //call `done()` to release the client back to the pool
	   

	    if(err) {
	      return console.error('error running query', err);
	    }
	   
	    var aProjectes = result.rows;
	    aProjectes.forEach(function(oProjecte)
	    	{
	    		oProjecte.aTrans = {audio:[],text:[],video:[]};
	    		importTranscripcions(client, oProjecte.id,"AUDIO",function(aAudios)
				 	{
				 		
			 			oProjecte.aTrans.audio = aAudios;
			 			//console.log(oProjecte.aTrans.audio);
						importTranscripcions(client, oProjecte.id,"TEXT",function(aTexts)
							{
								oProjecte.aTrans.text = aTexts;
								importTranscripcions(client, oProjecte.id,"VIDEO",function(aVideos)
									{
										oProjecte.aTrans.video = aVideos;
										saveProject(oProjecte.nom,oProjecte);
										//console.log(oProjecte.aTrans.audio);
									});
							});
				 	});
	    		 
	    		 
	    	});
	    	
		    //output: 1
		  });

}

function importTranscripcions(client, id, type, callback)
{
	client.query('SELECT b.* from transcripcio t LEFT JOIN bloc_transcripcio b ON b.id_transcripcio=t.id WHERE t.id_projecte=$1 AND t.nom =$2 ORDER BY b.start', [id, type], function(err, result) {
	    //call `done()` to release the client back to the pool
	   

	    if(err) {
	      return console.error('error running import trans query', err);
	    }
	   
	    var aTrans = result.rows;
	    aRes = [];
	    aTrans.forEach(function(oTranscipcio)
    	{
    		 aRes.push(oTranscipcio);
    		
    	});
    	//console.log(aRes);
    	callback(aRes);
	    //output: 1
	  });
}

function saveProject(oNom,oProjecte)
{
	var MongoClient = require('mongodb').MongoClient
	var format = require('util').format;
	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3');
	    collection.insert({nom:oNom,projecte:oProjecte}, function(err, docs) {
	      console.log(docs);
	      collection.count(function(err, count) {
	        console.log(format("count = %s", count));
	      });

	     
	    });
	  })
}

function saveCodis(aCodis)
{
	var MongoClient = require('mongodb').MongoClient
	var format = require('util').format;
	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3_codes');
	    collection.insert({codis:aCodis}, function(err, docs) {
	      console.log(docs);
	      collection.count(function(err, count) {
	        console.log(format("count = %s", count));
	      });

	     
	    });
	  })
}