var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

/* import code tree */
var aTurns = [];
var oCodes = {};
var iProcessats = 0;
var iRepes = 0;
router.get('/etl', function(req, res) {
	console.log("ETL");
	var iNumTurns,iNumCodes;
	aTurns = [];oCodes = {};iProcessats = 0;iRepes = 0;
	// get all codes
	getCodesAndTurns(function(aCodes, aTurns)
	{
		iNumCodes = aCodes.length;
		console.log(aCodes);
		for(var j=0;j<aCodes.length;j++)
		{
			oCodes['c'+aCodes[j].id] = j;
		}
		// get all turns
		iNumTurns = aTurns.length;
		// create matrix
		aMap = createMatrix(iNumTurns,iNumCodes);
		// fill matrix
		aMap = fillMatrix(aMap);
		console.log(iProcessats);
		console.log(iRepes);
		res.send({aMatrix:aMap, oCodes:oCodes, aCodes:aCodes, aTurns:aTurns, oTurns:oTurns});
	});
	
});

function fillMatrix(aMap)
{
	// recorro tots els torns
	//for(var i=0;i<2;i++)
	for(var i=0;i<aTurns.length;i++)
	{
		// recorro totes codificacions
		var oTorn = oTurns[aTurns[i]];
		if(oTorn.codings!=undefined) 
		{
			for(var j=0;j<oTorn.codings.length;j++)
			{
				var oCoding = oTorn.codings[j];
				var iIndex = oCodes['c'+oCoding.id_code];
				if(aMap[i][iIndex]==1 )
				{
					iRepes++;console.log("repetit "+iIndex+" coding "+oCoding.id_code);
					console.log(oCoding);
				} 
				aMap[i][iIndex]=1;
				iProcessats++;
			}
		}
		//console.log(oTorn);
	}
	return aMap;
}

var oTurns = {};
function getCodesAndTurns(callback)
{
	
	
	//console.log(aCodes);
	loadCodes(function(aCodes)
	{
		getProjectNames(function(aProjects)
		{
			//console.log(aProjects);
			loadTurns(aProjects, function()
			{
				callback(aCodes, aTurns);
			})
		})

	})

}

function loadTurns(aProjects, callback)
{
	loadProjectTurns(aProjects,0, function()
	{
		callback();
	})
}

function loadProjectTurns(aProjects, iNumProject, callback)
{
	var MongoClient = mongo.MongoClient;
	var ObjectId = mongo.ObjectID;
	var oProject = aProjects[iNumProject];
	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3');
	   
	    collection.find({nom:oProject.nom}).toArray(function(err, docs) {
	      if (err) console.log(err);
	      	// tenim l'arbre pero estaria be tenir un array indexat per id_codi
	      	console.log(docs[0].projecte.aTrans.audio.length);
	      	// posem els torns en un array indexats per projecte,mode,id
	      	processaTorn(docs[0].projecte.aTrans.audio, iNumProject,'a');
	      	processaTorn(docs[0].projecte.aTrans.video, iNumProject,'v');
	      	processaTorn(docs[0].projecte.aTrans.text, iNumProject,'t');
	      	var aResult = docs;
	      	db.close(
				function() {
					if(iNumProject<aProjects.length-1) loadProjectTurns(aProjects, iNumProject+1, callback);
						else callback(aResult);
			});
	    });
	  })
}

function processaTorn(aMode, iNumProject,sMode)
{
	var sKey ='';
	for(var i=0;i<aMode.length;i++)
	{
		sKey = 'p'+iNumProject+sMode+aMode[i].id;
		oTurns[sKey] = aMode[i];
		aTurns.push(sKey);
		//console.log(sKey);
	}
}
function getProjectNames(callback)
{
	var MongoClient = mongo.MongoClient;
	var ObjectId = mongo.ObjectID;

	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3');
	   
	    collection.find({},{nom:1}).toArray(function(err, docs) {
	      if (err) console.log(err);
	      	// tenim l'arbre pero estaria be tenir un array indexat per id_codi
	      	
	      	var aResult = docs;
	      	db.close(
				function() {
					callback(aResult);
			});
	    });
	  })
}

function loadCodes(callback)
{
	var MongoClient = mongo.MongoClient;
	var ObjectId = mongo.ObjectID;

	MongoClient.connect('mongodb://127.0.0.1:27017/m3', function(err, db) {
	    if(err) throw err;

	    var collection = db.collection('m3_codes_llista');
	    // CARREGUEM L'ARBRE DE CODIS
	    collection.find().toArray(function(err, docs) {
	      if (err) console.log(err);
	      	// tenim l'arbre pero estaria be tenir un array indexat per id_codi
	      	
	      	var aResult = docs[0].codis;
	      	db.close(
				function() {
					callback(aResult);
			});
	    });
	  })
}
function createMatrix(iNumTurns,iNumCodes)
{
	var aMap = [];
	console.log("Creant matriu de ["+iNumTurns+"]["+iNumCodes+"]");
	for(var i=0;i<iNumTurns;i++)
	{
		var aRow = [];
		for(var j=0;j<iNumCodes;j++)
		{
			aRow.push(0);
		}
		aMap.push(aRow);
	}
	return aMap;
}
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