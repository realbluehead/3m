var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
   //
	var pg = require('pg');
	var conString = "postgres://postgres:@localhost/carlesti";

	pg.connect(conString, function(err, client, done) {
	  if(err) {
	    return console.error('error fetching client from pool', err);
	  }
	  readProjects(client);
	   done();
	});

	res.send("FET");
});

module.exports = router;

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