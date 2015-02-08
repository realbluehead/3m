var App3m = angular.module('App3m',  ['ngSanitize']);

App3m.controller('mainController',function($scope, $http){
	$scope.transcriptions = {audio:[],video:[],text:[]};
	$scope.infoMsg = '';
	$scope.codes = '';
	$scope.codisFiltrats ='';
	$scope.filtreCodis = '';
	$scope.codisSeleccionats = [];
	$scope.grups = [];
	$scope.currentGrup = [];
	$scope.currentGrupId ='';
	$scope.bProjectLoaded = false;
	$scope.currentProjectId = '';
	$scope.currentCoding = '';
	$scope.currentBlock = '';
	$scope.blocksCoding = '';
	$scope.codingEdit = {};
	$scope.currentMode = 'A';
	$scope.currentVideo = 'http://192.168.1.104:80/carlesti/videos/M1S1Tue.ogv';
	$scope.player = '';
	$scope.codiSeleccionat = '';
	$scope.offsetAudio = 0;
	$scope.lastoffsetAudio = 0;
	$scope.offsetVideo = 0;
	$scope.lastoffsetVideo = 0;
	$scope.offsetText = 0;
	$scope.lastoffsetText = 0;
	$scope.scrollAudio = '';
	$scope.audioToggle = true;
	$scope.videoToggle = true;
	$scope.textToggle = true;
	$scope.currentIdCode = '';
	$scope.codiArrel = '';
	$scope.projectName = 'Cap projecte carregat';

	$scope.init = function()
	{
		$scope.loadCodes();

	}

	$scope.loadCodes = function()
	{
		$scope.infoMsg = 'Loading codes tree...';
		 var request = $http({
				method: "get",
				cache:false,
				url: "codes/load/",
				params: {
					//id: iId
				}
			});
		request.success(function(data, status, headers, config) {
	      // this callback will be called asynchronously
	      // when the response is available
	     //
	     $scope.infoMsg = 'Codes tree loaded...';
	     $scope.codes = data;
	     //console.log(data);
	     $scope.codisFiltrats = [];
	     data.codis.sort(function (a,b) {
			  if (a.nom < b.nom)
			     return -1;
			  if (a.nom > b.nom)
			    return 1;
			  return 0;
			});
	     for(var i=0;i<data.codis.length;i++)
	     {
	     	$scope.codisFiltrats.push(data.codis[i])
	     }
	     
	 });
	}



	$scope.getNomComplet = function(aCodis, iIndex)
	{
		if(aCodis[iIndex].id_pare!=0) return $scope.getNomComplet(aCodis, aCodis[iIndex].id_pare) + '/' + aCodis[iIndex].name;
		else return aCodis[iIndex].name;
	}
	$scope.editGroupCode = function(block)
	{	
		var idGrup = block.groupId;
		console.log("Editant grup de codis "+idGrup);
		// inicializem les variables de l'editor
		var oGrup = '';
		$scope.currentGrupId = idGrup;
		var bTrobat = false;
		for(var i=0;i<$scope.grups.length;i++)
		{
			if($scope.grups[i].id == idGrup) 
				{
					bTrobat = true;
					oGrup = $scope.grups[i];
				}
		}
		if(!bTrobat) 
		{
				console.log("Error de coherencia de dades de grup "+idGrup);
				var pos = block.$parent.block.groups.indexOf(idGrup);
				block.$parent.block.groups.splice(pos,1);
			alert("Hi havia una incherencia de dades que s'ha resolt. Recorda salvar el projecte.");
		}
		else
		{
			$scope.codisSeleccionats = oGrup.codis;
			$scope.currentGrup = oGrup.membres;
			$scope.canviFiltreCodis();
			// visualitzem l'editor
			$scope.editCurrentGroup();
		}
	}
	$scope.fix = function(block,mode)
	{
		
		// reorder the block
		if(mode=='A')
		{
			var iBlockId = block.block.id;
			var bTime = 0;
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				//console.log(j+": "+$scope.transcriptions.text[j].start);
				if(block.block.id==$scope.transcriptions.audio[j].id)
				{
					$scope.transcriptions.audio.splice(j,1);
				}
			}
			
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				//console.log(j+": "+$scope.transcriptions.text[j].start);
				if(block.block.start<$scope.transcriptions.audio[j].start)
				{
					console.log("reinsertant a "+j);
					$scope.transcriptions.audio.splice(j,0,block.block);
					j = 10000;
				}
			}
		}
		if(mode=='T')
		{
			var iBlockId = block.block.id;
			var bTime = 0;
			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				//console.log(j+": "+$scope.transcriptions.text[j].start);
				if(block.block.id==$scope.transcriptions.text[j].id)
				{
					$scope.transcriptions.text.splice(j,1);
				}
			}
			
			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				//console.log(j+": "+$scope.transcriptions.text[j].start);
				if(block.block.start<$scope.transcriptions.text[j].start)
				{
					console.log("reinsertant a "+j);
					$scope.transcriptions.text.splice(j,0,block.block);
					j = 10000;
				}
			}
		}
		if(mode=='I')
		{
			var iBlockId = block.block.id;
			var bTime = 0;
			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				//console.log(j+": "+$scope.transcriptions.text[j].start);
				if(block.block.id==$scope.transcriptions.video[j].id)
				{
					$scope.transcriptions.video.splice(j,1);
				}
			}
			
			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				//console.log(j+": "+$scope.transcriptions.text[j].start);
				if(block.block.start<$scope.transcriptions.video[j].start)
				{
					console.log("reinsertant a "+j);
					$scope.transcriptions.video.splice(j,0,block.block);
					j = 10000;
				}
			}
		}
	}
	$scope.toggleCheck  = function(block,mode)
	{
		$scope.currentMode = mode;
		block.block.checked = !block.block.checked;
		if(block.block.checked)
		{
			// add the block id to the group
			$scope.currentGrup.push(block.block.id);
		}
		else
		{
			// remove the block id from the group
			var index = $scope.currentGrup.indexOf(block.block.id);
			$scope.currentGrup.splice(index, 1);
		}
	}
	$scope.deleteGroupCodes = function()
	{
		console.log('esborrant un grup '+$scope.currentGrupId);
		var id = $scope.currentGrupId;
		// Hem de buscar cada membre i treure'n el grup
		for(var i=0;i<$scope.currentGrup.length;i++)
		{
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				if($scope.transcriptions.audio[j].id==$scope.currentGrup[i])
				{
					var pos = $scope.transcriptions.audio[j].groups.indexOf(id);
					$scope.transcriptions.audio[j].groups.splice(pos,1);
					j=1000;
				}
			}
			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				if($scope.transcriptions.video[j].id==$scope.currentGrup[i])
				{
					var pos = $scope.transcriptions.video[j].groups.indexOf(id);
					$scope.transcriptions.video[j].groups.splice(pos,1);
					j=1000;
				}
			}
			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				if($scope.transcriptions.text[j].id==$scope.currentGrup[i])
				{
					var pos = $scope.transcriptions.text[j].groups.indexOf(id);
					$scope.transcriptions.text[j].groups.splice(pos,1);
					j=1000;
				}
			}
		}
		// Hem de treure el grup del array de grups
		
		for(var i=0;i<$scope.grups.length;i++)
		{
			if($scope.grups[i].id==id) pos = i;
		}
		console.log("Esborro de grups ["+id+"] que es a posicio ["+pos+"]");
		$scope.grups.splice(pos,1);
		$scope.currentGrup = [];
		$scope.codisSeleccionats = [];
	    $scope.filtreCodis='';
	    $scope.canviFiltreCodis();
		$scope.currentGrupId = $scope.getMaxGroupId();
		console.log("Despres desborrar");
		console.log($scope.grups);
		console.log($scope.currentGrupId);
		$('#editorGrups').modal('toggle');
	}

	$scope.saveGroupCodes = function()
	{
		// si grup ja exiteix, canviem valors
		// sino, lafegim a grups i afegim el grupId a cada membre del grup
		oNouGrup = {id:$scope.currentGrupId,
					membres:$scope.currentGrup,
					codis:$scope.codisSeleccionats};
					console.log('salvant un grup');
					console.log(oNouGrup);
		for(var i=0;i<$scope.currentGrup.length;i++)
		{
			// de moment nomes mirem audio per sha de fer per cada mode
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				if($scope.transcriptions.audio[j].id==$scope.currentGrup[i])
				{
					if($scope.transcriptions.audio[j].groups==undefined) $scope.transcriptions.audio[j].groups = [];
					if($scope.transcriptions.audio[j].groups.indexOf(oNouGrup.id)==-1) $scope.transcriptions.audio[j].groups.push(oNouGrup.id);
					$scope.transcriptions.audio[j].checked =false;
					j=60000;
				}
			}
			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				if($scope.transcriptions.text[j].id==$scope.currentGrup[i])
				{
					if($scope.transcriptions.text[j].groups==undefined) $scope.transcriptions.text[j].groups = [];
					if($scope.transcriptions.text[j].groups.indexOf(oNouGrup.id)==-1) $scope.transcriptions.text[j].groups.push(oNouGrup.id);
					$scope.transcriptions.text[j].checked =false;
					j=60000;
				}
			}
			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				if($scope.transcriptions.video[j].id==$scope.currentGrup[i])
				{
					if($scope.transcriptions.video[j].groups==undefined) $scope.transcriptions.video[j].groups = [];
					if($scope.transcriptions.video[j].groups.indexOf(oNouGrup.id)==-1) $scope.transcriptions.video[j].groups.push(oNouGrup.id);
					$scope.transcriptions.video[j].checked =false;
					j=60000;
				}
			}
		}
		
		$scope.currentGrup = [];
		$scope.codisSeleccionats = [];
	    $scope.filtreCodis='';
	    $scope.canviFiltreCodis();
	    var bUpdate=false;
	    // actualitzem el grup al array de grups del projecte ja sigui fent update o push d'un nou grup
	    for(var i=0;i<$scope.grups.length;i++)
		{
			if($scope.grups[i].id == oNouGrup.id) 
			{
				$scope.grups[i] = oNouGrup;
				bUpdate = true;
			}
		}
		if(!bUpdate)
		{
			$scope.grups.push(oNouGrup);
		}
		
		$scope.currentGrupId = $scope.getMaxGroupId();
		// deixem el currentGrupId a un id nou per si fem grups nous.
		console.log('Aixi keden els grups');
		console.log($scope.grups);
		$('#editorGrups').modal('toggle');
	}
	$scope.resetGroupEditing = function()
	{
		console.log("reseting");
		//$scope.currentGrup = [];
		//$scope.codisSeleccionats = [];
	    $scope.filtreCodis='';
	    $scope.canviFiltreCodis();
		//$scope.currentGrupId = $scope.getMaxGroupId();
	}
	$scope.getMaxGroupId = function()
	{
		var iCurrentMaxId = 0;
		for(var i=0;i<$scope.grups.length;i++)
		{
			if($scope.grups[i].id>=iCurrentMaxId) iCurrentMaxId = $scope.grups[i].id;
		}
		return iCurrentMaxId+1;
	}

	$scope.saveCurrentCoding = function()
	{
		// busquem el coding dins del code actual
		//$scope.currentMode = 'A';
		
		var coding = $scope.currentCoding;
		var iCodingId = coding.id;
		var bTrobat = false;
		//coding.id_code = $scope.codiSeleccionat.id;
		coding.id_code = $scope.currentIdCode;
		var iMaxId = 1;
		if($scope.currentMode=='A')
		{
			var iBlockId = $scope.currentBlock.id;
			console.log('salvem :'+iBlockId+' el seu coding: '+iCodingId);
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				if($scope.transcriptions.audio[j].id==iBlockId)
				{
					console.log("Estem al block");
					if($scope.transcriptions.audio[j].codings==undefined)
					{
						$scope.transcriptions.audio[j].codings = [];
					}
					for(var i=0;i<$scope.transcriptions.audio[j].codings.length;i++)
					{
						if($scope.transcriptions.audio[j].codings[i].id>=iMaxId) iMaxId = $scope.transcriptions.audio[j].codings[i].id;
						
						if($scope.transcriptions.audio[j].codings[i].id==iCodingId)
						{
							bTrobat= true;
							console.log("Canvio el coding "+iCodingId+" per "+coding.id_code);
							console.log($scope.transcriptions.audio[j].codings[i]);
							$scope.transcriptions.audio[j].codings[i].start_offset = coding.start_offset;
							$scope.transcriptions.audio[j].codings[i].end_offset = coding.end_offset;
							$scope.transcriptions.audio[j].codings[i].id_end_bloc = coding.id_end_bloc;
							$scope.transcriptions.audio[j].codings[i].id_code = coding.id_code;
							console.log($scope.transcriptions.audio[j].codings[i]);
							i=1000000;
						}

						
					}
					if(!bTrobat)
					{
						console.log("Nou codiiing");
						coding.id = iMaxId +1;
						console.log(coding);
						$scope.transcriptions.audio[j].codings.push(coding);
						
					}
					j=10000;
				}
			}
		}
		if($scope.currentMode=='T')
		{
			var iBlockId = $scope.currentBlock.id;
			console.log('salvem :'+iBlockId+' el seu coding: '+iCodingId);
			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				if($scope.transcriptions.text[j].id==iBlockId)
				{
					console.log("Estem al block");
					if($scope.transcriptions.text[j].codings==undefined)
					{
						$scope.transcriptions.text[j].codings = [];
					}
					for(var i=0;i<$scope.transcriptions.text[j].codings.length;i++)
					{
						if($scope.transcriptions.text[j].codings[i].id>=iMaxId) iMaxId = $scope.transcriptions.text[j].codings[i].id;
						
						if($scope.transcriptions.text[j].codings[i].id==iCodingId)
						{
							bTrobat= true;
							console.log("Canvio el coding "+iCodingId+" per "+coding.id_code);
							console.log($scope.transcriptions.text[j].codings[i]);
							$scope.transcriptions.text[j].codings[i].start_offset = coding.start_offset;
							$scope.transcriptions.text[j].codings[i].end_offset = coding.end_offset;
							$scope.transcriptions.text[j].codings[i].id_end_bloc = coding.id_end_bloc;
							$scope.transcriptions.text[j].codings[i].id_code = coding.id_code;
							console.log($scope.transcriptions.text[j].codings[i]);
							i=1000000;
						}
							
						
					}
					if(!bTrobat)
					{
						console.log("Nou codiiing");
						coding.id = iMaxId +1;
						console.log(coding);
						$scope.transcriptions.text[j].codings.push(coding);
						
					}
					j=10000;
				}
			}
		}
		if($scope.currentMode=='I')
		{
			var iBlockId = $scope.currentBlock.id;
			console.log('salvem :'+iBlockId+' el seu coding: '+iCodingId);
			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				if($scope.transcriptions.video[j].id==iBlockId)
				{
					console.log("Estem al block");
					if($scope.transcriptions.video[j].codings==undefined)
					{
						$scope.transcriptions.video[j].codings = [];
					}
					for(var i=0;i<$scope.transcriptions.video[j].codings.length;i++)
					{
						if($scope.transcriptions.video[j].codings[i].id>=iMaxId) iMaxId = $scope.transcriptions.video[j].codings[i].id;
						
						if($scope.transcriptions.video[j].codings[i].id==iCodingId)
						{
							bTrobat= true;
							console.log("Canvio el coding "+iCodingId+" per "+coding.id_code);
							console.log($scope.transcriptions.video[j].codings[i]);
							$scope.transcriptions.video[j].codings[i].start_offset = coding.start_offset;
							$scope.transcriptions.video[j].codings[i].end_offset = coding.end_offset;
							$scope.transcriptions.video[j].codings[i].id_end_bloc = coding.id_end_bloc;
							$scope.transcriptions.video[j].codings[i].id_code = coding.id_code;
							console.log($scope.transcriptions.video[j].codings[i]);
							i=1000000;
						}
							
						
					}
					if(!bTrobat)
					{
						console.log("Nou codiiing");
						coding.id = iMaxId +1;
						console.log(coding);
						$scope.transcriptions.video[j].codings.push(coding);
						
					}
					j=10000;
				}
			}
		}
		$('#editorCoding').modal('toggle');
	}

	$scope.afegirCodiGrup = function(block)
	{
		console.log('Add '+block.block.id);
		$scope.codisSeleccionats.push(block.block);
		$scope.canviFiltreCodis();
	}

	$scope.treureCodiGrup = function(block)
	{
		console.log('Del '+block.block.id);
		// delete the current code of the selectedCodes
		for(var i=0;i<$scope.codisSeleccionats.length;i++)
	     {
	     	if($scope.codisSeleccionats[i].id == block.block.id) $scope.codisSeleccionats.splice(i,1);
	     }
		
		$scope.canviFiltreCodis();
	}
	$scope.codiJaSeleccionat = function(iCodi)
	{
		
		for(var i=0;i<$scope.codisSeleccionats.length;i++)
	     {
	     	if($scope.codisSeleccionats[i].id == iCodi) return true;
	     }
	     return false;
	}

	$scope.highlightTurns = function(start,coding)
	{

		if($scope.currentMode=='A')
		{
			// hem de saber quants torns cal remarcar.
			
		//	console.log(coding.id_start_bloc + "=>"+coding.id_end_bloc);
			
			// Si el coding està dins del mateix bloc nomès cal resaltar aquell bloc
			if(coding.id_start_bloc==coding.id_end_bloc)
			{
				$scope.transcriptions.audio[start].backup_contingut = $scope.transcriptions.audio[start].contingut_filtrat;
				$scope.transcriptions.audio[start].contingut_filtrat =  "<span class='coding_highlight'>"+
																$scope.transcriptions.audio[start].contingut_filtrat + 
																"</span>";
			}
			else
			{
				// sino, hem de fer bucle recorrent següents blocs fins que l¡id del bloc sigui el de id_end_bloc
				var iCurrentOffset = start;
				var bFiGrup = false;
				while(!bFiGrup && $scope.transcriptions.audio[iCurrentOffset]!=undefined)
				{
					$scope.transcriptions.audio[iCurrentOffset].backup_contingut = $scope.transcriptions.audio[iCurrentOffset].contingut_filtrat;
					$scope.transcriptions.audio[iCurrentOffset].contingut_filtrat =  "<span class='coding_highlight'>"+
																$scope.transcriptions.audio[iCurrentOffset].contingut_filtrat + 
																"</span>";
					if($scope.transcriptions.audio[iCurrentOffset].id == coding.id_end_bloc) bFiGrup=true;
					iCurrentOffset++;									
				}

			}
		}
		if($scope.currentMode=='T')
		{
			// hem de saber quants torns cal remarcar.
			
			
			// Si el coding està dins del mateix bloc nomès cal resaltar aquell bloc
			if(coding.id_start_bloc==coding.id_end_bloc)
			{
				$scope.transcriptions.text[start].backup_contingut = $scope.transcriptions.text[start].contingut_filtrat;
				$scope.transcriptions.text[start].contingut_filtrat =  "<span class='coding_highlight'>"+
																$scope.transcriptions.text[start].contingut_filtrat + 
																"</span>";
			}
			else
			{
				// sino, hem de fer bucle recorrent següents blocs fins que l¡id del bloc sigui el de id_end_bloc
				var iCurrentOffset = start;
				var bFiGrup = false;
				while(!bFiGrup && $scope.transcriptions.text[iCurrentOffset]!=undefined)
				{
					$scope.transcriptions.text[iCurrentOffset].backup_contingut = $scope.transcriptions.text[iCurrentOffset].contingut_filtrat;
					$scope.transcriptions.text[iCurrentOffset].contingut_filtrat =  "<span class='coding_highlight'>"+
																$scope.transcriptions.text[iCurrentOffset].contingut_filtrat + 
																"</span>";
					if($scope.transcriptions.text[iCurrentOffset].id == coding.id_end_bloc) bFiGrup=true;
					iCurrentOffset++;									
				}

			}
		}
		if($scope.currentMode=='I')
		{
			// hem de saber quants torns cal remarcar.
			
		//	console.log(coding.id_start_bloc + "=>"+coding.id_end_bloc);
			
			// Si el coding està dins del mateix bloc nomès cal resaltar aquell bloc
			if(coding.id_start_bloc==coding.id_end_bloc)
			{
				$scope.transcriptions.video[start].backup_contingut = $scope.transcriptions.video[start].contingut_filtrat;
				$scope.transcriptions.video[start].contingut_filtrat =  "<span class='coding_highlight'>"+
																$scope.transcriptions.video[start].contingut_filtrat + 
																"</span>";
			}
			else
			{
				// sino, hem de fer bucle recorrent següents blocs fins que l¡id del bloc sigui el de id_end_bloc
				var iCurrentOffset = start;
				var bFiGrup = false;
				while(!bFiGrup && $scope.transcriptions.video[iCurrentOffset]!=undefined)
				{
					$scope.transcriptions.video[iCurrentOffset].backup_contingut = $scope.transcriptions.video[iCurrentOffset].contingut_filtrat;
					$scope.transcriptions.video[iCurrentOffset].contingut_filtrat =  "<span class='coding_highlight'>"+
																$scope.transcriptions.video[iCurrentOffset].contingut_filtrat + 
																"</span>";
					if($scope.transcriptions.video[iCurrentOffset].id == coding.id_end_bloc) bFiGrup=true;
					iCurrentOffset++;									
				}

			}
		}
	}

	$scope.unhighlightTurns = function(start,coding)
	{

		if($scope.currentMode=='A')
		{
			// hem de saber quants torns cal remarcar.
			
		//	console.log(coding.id_start_bloc + "=>"+coding.id_end_bloc);
			
			// Si el coding està dins del mateix bloc nomès cal resaltar aquell bloc
			if(coding.id_start_bloc==coding.id_end_bloc)
			{
				$scope.transcriptions.audio[start].contingut_filtrat =  $scope.transcriptions.audio[start].backup_contingut;
			}
			else
			{
				// sino, hem de fer bucle recorrent següents blocs fins que l¡id del bloc sigui el de id_end_bloc
				var iCurrentOffset = start;
				var bFiGrup = false;
				while(!bFiGrup && $scope.transcriptions.audio[iCurrentOffset]!=undefined)
				{
					$scope.transcriptions.audio[iCurrentOffset].contingut_filtrat =  $scope.transcriptions.audio[iCurrentOffset].backup_contingut;
					
					if($scope.transcriptions.audio[iCurrentOffset].id == coding.id_end_bloc) bFiGrup=true;
					iCurrentOffset++;									
				}

			}
		}
		if($scope.currentMode=='T')
		{
			// hem de saber quants torns cal remarcar.
			
			
			// Si el coding està dins del mateix bloc nomès cal resaltar aquell bloc
			if(coding.id_start_bloc==coding.id_end_bloc)
			{
				$scope.transcriptions.text[start].contingut_filtrat =  $scope.transcriptions.text[start].backup_contingut;

			}
			else
			{
				// sino, hem de fer bucle recorrent següents blocs fins que l¡id del bloc sigui el de id_end_bloc
				var iCurrentOffset = start;
				var bFiGrup = false;
				while(!bFiGrup && $scope.transcriptions.text[iCurrentOffset]!=undefined)
				{
					$scope.transcriptions.text[iCurrentOffset].contingut_filtrat =  $scope.transcriptions.text[iCurrentOffset].backup_contingut;
					
					if($scope.transcriptions.text[iCurrentOffset].id == coding.id_end_bloc) bFiGrup=true;
					iCurrentOffset++;												
				}

			}
		}
		
		if($scope.currentMode=='I')
		{
			// hem de saber quants torns cal remarcar.
		//	console.log("Cosas I");
		//	console.log(coding.id_start_bloc + "=>"+coding.id_end_bloc);
			
			// Si el coding està dins del mateix bloc nomès cal resaltar aquell bloc
			if(coding.id_start_bloc==coding.id_end_bloc)
			{
				$scope.transcriptions.video[start].contingut_filtrat =  $scope.transcriptions.video[start].backup_contingut;

			}
			else
			{
				// sino, hem de fer bucle recorrent següents blocs fins que l¡id del bloc sigui el de id_end_bloc
				var iCurrentOffset = start;
				var bFiGrup = false;
				while(!bFiGrup && $scope.transcriptions.video[iCurrentOffset]!=undefined)
				{
					$scope.transcriptions.video[iCurrentOffset].contingut_filtrat =  $scope.transcriptions.video[iCurrentOffset].backup_contingut;
					
					if($scope.transcriptions.video[iCurrentOffset].id == coding.id_end_bloc) bFiGrup=true;
					iCurrentOffset++;									
				}

			}
		}
	}

	$scope.highlightCoding = function(code,mode)
	{
		//console.log("Highlight coding");
		$scope.currentMode = mode;
		var bTrobat=false;
		var currentBlock = code.block;
		if($scope.currentMode=='A')
		{
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
				{
					if($scope.transcriptions.audio[j].id==currentBlock.id)
					{
						bTrobat= true;
						$scope.highlightTurns(j, code.coding);
						
						j=10000;
					}
				}
		}
		if($scope.currentMode=='T')
		{
			for(var j=0;j<$scope.transcriptions.text.length;j++)
				{
					if($scope.transcriptions.text[j].id==currentBlock.id)
					{
						bTrobat= true;
						$scope.highlightTurns(j, code.coding);
						
						j=10000;
					}
				}
		}
		if($scope.currentMode=='I')
		{
			for(var j=0;j<$scope.transcriptions.video.length;j++)
				{
					if($scope.transcriptions.video[j].id==currentBlock.id)
					{
						bTrobat= true;
						$scope.highlightTurns(j, code.coding);
						
						j=10000;
					}
				}
		}
		//console.log(currentBlock);
	}
	
	$scope.unhighlightCoding = function(code,mode)
	{
		//console.log("Unhighlight coding");
		$scope.currentMode = mode;
		var bTrobat=false;
		var currentBlock = code.block;
		if($scope.currentMode=='A')
		{
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
				{
					if($scope.transcriptions.audio[j].id==currentBlock.id)
					{
						bTrobat= true;
						$scope.unhighlightTurns(j, code.coding);
						//$scope.transcriptions.audio[j].contingut_filtrat =  $scope.transcriptions.audio[j].backup_contingut;
						
						j=10000;
					}
				}
		}
		if($scope.currentMode=='T')
		{
			for(var j=0;j<$scope.transcriptions.text.length;j++)
				{
					if($scope.transcriptions.text[j].id==currentBlock.id)
					{
						bTrobat= true;
						$scope.unhighlightTurns(j, code.coding);
						//$scope.transcriptions.text[j].contingut_filtrat =  $scope.transcriptions.text[j].backup_contingut;
						j=10000;
					}
				}
		}
		if($scope.currentMode=='I')
		{
			for(var j=0;j<$scope.transcriptions.video.length;j++)
				{
					if($scope.transcriptions.video[j].id==currentBlock.id)
					{
						bTrobat= true;
						$scope.unhighlightTurns(j, code.coding);
						//$scope.transcriptions.video[j].contingut_filtrat =  $scope.transcriptions.video[j].backup_contingut;
						j=10000;
					}
				}
		}
	}

	$scope.modStartOffset = function(value)
	{
		$scope.currentCoding.start_offset += value;
		if($scope.currentCoding.start_offset<=0) $scope.currentCoding.start_offset=0;
		if($scope.currentCoding.start_offset>=$scope.currentBlock.backup_contingut.length) $scope.currentCoding.start_offset=0;
		$scope.blocksCoding = $scope.getBlocksCoding();
	}

	$scope.modEndOffset = function(value)
	{
		$scope.currentCoding.end_offset += value;
		if($scope.currentCoding.start_offset<=0) $scope.currentCoding.start_offset=0;
		$scope.blocksCoding = $scope.getBlocksCoding();
	}

	$scope.addBlockCoding = function()
	{
		var coding = $scope.currentCoding;
		console.log(coding.id_end_bloc);
		if($scope.currentMode=='A')
		{
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.audio[j].id==coding.id_end_bloc)
				{
					console.log("j:"+j+",id="+$scope.transcriptions.audio[j+1].id);
					$scope.currentCoding.id_end_bloc = $scope.transcriptions.audio[j+1].id;
					$scope.currentCoding.end_offset = $scope.transcriptions.audio[j+1].backup_contingut.length;
					j=1000;
				}
			}
		}
		if($scope.currentMode=='T')
		{
			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.text[j].id==coding.id_end_bloc)
				{
					console.log("j:"+j+",id="+$scope.transcriptions.text[j+1].id);
					$scope.currentCoding.id_end_bloc = $scope.transcriptions.text[j+1].id;
					$scope.currentCoding.end_offset = $scope.transcriptions.text[j+1].backup_contingut.length;
					j=1000;
				}
			}
		}
		if($scope.currentMode=='I')
		{
			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.video[j].id==coding.id_end_bloc)
				{
					console.log("j:"+j+",id="+$scope.transcriptions.video[j+1].id);
					$scope.currentCoding.id_end_bloc = $scope.transcriptions.video[j+1].id;
					$scope.currentCoding.end_offset = $scope.transcriptions.video[j+1].backup_contingut.length;
					j=1000;
				}
			}
		}
		$scope.blocksCoding = $scope.getBlocksCoding();
	}

	$scope.delBlockCoding = function()
	{
		var coding = $scope.currentCoding;
		console.log(coding.id_end_bloc);
		if($scope.currentMode=='A')
		{
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.audio[j].id==coding.id_end_bloc)
				{
					console.log("j:"+j+",id="+$scope.transcriptions.audio[j+1].id);
					$scope.currentCoding.id_end_bloc = $scope.transcriptions.audio[j-1].id;
					$scope.currentCoding.end_offset = $scope.transcriptions.audio[j-1].backup_contingut.length;
					j=1000;
				}
			}
		}
		if($scope.currentMode=='T')
		{
			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.text[j].id==coding.id_end_bloc)
				{
					console.log("j:"+j+",id="+$scope.transcriptions.text[j+1].id);
					$scope.currentCoding.id_end_bloc = $scope.transcriptions.text[j-1].id;
					$scope.currentCoding.end_offset = $scope.transcriptions.text[j-1].backup_contingut.length;
					j=1000;
				}
			}
		}
		if($scope.currentMode=='I')
		{
			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.video[j].id==coding.id_end_bloc)
				{
					console.log("j:"+j+",id="+$scope.transcriptions.video[j+1].id);
					$scope.currentCoding.id_end_bloc = $scope.transcriptions.video[j-1].id;
					$scope.currentCoding.end_offset = $scope.transcriptions.video[j-1].backup_contingut.length;
					j=1000;
				}
			}
		}
		$scope.blocksCoding = $scope.getBlocksCoding();
	}

	$scope.getBlocksCoding = function()
	{
		var bTrobat= false;
		var aBlocks = [];
		var coding = $scope.currentCoding;
		console.log($scope.currentCoding);
		console.log($scope.currentCoding.start_offset);
		console.log($scope.currentCoding.end_offset);
		if($scope.currentMode=='A')
		{
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.audio[j].id==$scope.currentBlock.id)
				{
					bTrobat= true;
					//aBlocks.push($scope.transcriptions.audio[j]);

					var iCurrentOffset = j;
					var bFiGrup = false;
					while(!bFiGrup)
					{
						console.log("pintat llistat grup "+iCurrentOffset);
						// dividim string en PRE + SPAN + INTER + SPAN + POST;
						var sSubject = $scope.transcriptions.audio[iCurrentOffset].backup_contingut;
						
						if($scope.transcriptions.audio[iCurrentOffset].id == coding.id_start_bloc)
						{
							if(coding.id_start_bloc != coding.id_end_bloc)
							{
								var sPre = sSubject.substring(0,coding.start_offset);
								var sInter = sSubject.substring(coding.start_offset, sSubject.length);
								var sPost = '';
							}
							else
							{
								var sPre = sSubject.substring(0,coding.start_offset);
								var sInter = sSubject.substring(coding.start_offset, coding.end_offset);
								var sPost = sSubject.substring(coding.end_offset,sSubject.length);
							}
							
						}
						else
						{
							if($scope.transcriptions.audio[iCurrentOffset].id == coding.id_end_bloc)
							{
								var sPre = '';
								var sInter = sSubject.substring(0, coding.end_offset);
								var sPost = sSubject.substring(coding.end_offset, sSubject.length);
							}
							else
							{
								var sPre = '';
								var sInter = sSubject;
								var sPost = '';
							}
						}

						var  filtrat = sPre + "<span class='coding_highlight'>"+
																sInter + 
																"</span>" + sPost;
						//console.log(filtrat);
						//$scope.transcriptions.audio[iCurrentOffset].contingut_filtrat =  filtrat;
						var oTrans = $scope.transcriptions.audio[iCurrentOffset];
						oTrans.contingut_edit =  filtrat;
						
						aBlocks.push(oTrans);
						
						if($scope.transcriptions.audio[iCurrentOffset].id == coding.id_end_bloc) bFiGrup=true;
						iCurrentOffset++;									
					}
					j=10000;
				}
			}
		}
		if($scope.currentMode=='T')
		{
			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.text[j].id==$scope.currentBlock.id)
				{
					bTrobat= true;
					//aBlocks.push($scope.transcriptions.audio[j]);

					var iCurrentOffset = j;
					var bFiGrup = false;
					while(!bFiGrup)
					{
						console.log("pintat llistat grup "+iCurrentOffset);
						// dividim string en PRE + SPAN + INTER + SPAN + POST;
						var sSubject = $scope.transcriptions.text[iCurrentOffset].backup_contingut;
						
						if($scope.transcriptions.text[iCurrentOffset].id == coding.id_start_bloc)
						{
							if(coding.id_start_bloc != coding.id_end_bloc)
							{
								var sPre = sSubject.substring(0,coding.start_offset);
								var sInter = sSubject.substring(coding.start_offset, sSubject.length);
								var sPost = '';
							}
							else
							{
								var sPre = sSubject.substring(0,coding.start_offset);
								var sInter = sSubject.substring(coding.start_offset, coding.end_offset);
								var sPost = sSubject.substring(coding.end_offset,sSubject.length);
							}
							
						}
						else
						{
							if($scope.transcriptions.text[iCurrentOffset].id == coding.id_end_bloc)
							{
								var sPre = '';
								var sInter = sSubject.substring(0, coding.end_offset);
								var sPost = sSubject.substring(coding.end_offset, sSubject.length);
							}
							else
							{
								var sPre = '';
								var sInter = sSubject;
								var sPost = '';
							}
						}

						var  filtrat = sPre + "<span class='coding_highlight'>"+
																sInter + 
																"</span>" + sPost;
						//console.log(filtrat);
						//$scope.transcriptions.audio[iCurrentOffset].contingut_filtrat =  filtrat;
						var oTrans = $scope.transcriptions.text[iCurrentOffset];
						oTrans.contingut_edit =  filtrat;
						
						aBlocks.push(oTrans);
						
						if($scope.transcriptions.text[iCurrentOffset].id == coding.id_end_bloc) bFiGrup=true;
						iCurrentOffset++;									
					}
					j=10000;
				}
			}
		}
		if($scope.currentMode=='I')
		{
			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.video[j].id==$scope.currentBlock.id)
				{
					bTrobat= true;
					//aBlocks.push($scope.transcriptions.audio[j]);

					var iCurrentOffset = j;
					var bFiGrup = false;
					while(!bFiGrup)
					{
						console.log("pintat llistat grup "+iCurrentOffset);
						// dividim string en PRE + SPAN + INTER + SPAN + POST;
						var sSubject = $scope.transcriptions.video[iCurrentOffset].backup_contingut;
						
						if($scope.transcriptions.video[iCurrentOffset].id == coding.id_start_bloc)
						{
							if(coding.id_start_bloc != coding.id_end_bloc)
							{
								var sPre = sSubject.substring(0,coding.start_offset);
								var sInter = sSubject.substring(coding.start_offset, sSubject.length);
								var sPost = '';
							}
							else
							{
								var sPre = sSubject.substring(0,coding.start_offset);
								var sInter = sSubject.substring(coding.start_offset, coding.end_offset);
								var sPost = sSubject.substring(coding.end_offset,sSubject.length);
							}
							
						}
						else
						{
							if($scope.transcriptions.video[iCurrentOffset].id == coding.id_end_bloc)
							{
								var sPre = '';
								var sInter = sSubject.substring(0, coding.end_offset);
								var sPost = sSubject.substring(coding.end_offset, sSubject.length);
							}
							else
							{
								var sPre = '';
								var sInter = sSubject;
								var sPost = '';
							}
						}

						var  filtrat = sPre + "<span class='coding_highlight'>"+
																sInter + 
																"</span>" + sPost;
						//console.log(filtrat);
						//$scope.transcriptions.audio[iCurrentOffset].contingut_filtrat =  filtrat;
						var oTrans = $scope.transcriptions.video[iCurrentOffset];
						oTrans.contingut_edit =  filtrat;
						
						aBlocks.push(oTrans);
						
						if($scope.transcriptions.video[iCurrentOffset].id == coding.id_end_bloc) bFiGrup=true;
						iCurrentOffset++;									
					}
					j=10000;
				}
			}
		}
		//console.log(aBlocks);
		return aBlocks;
	}
	$scope.deleteTranscripcio = function(code,mode)
	{
		$scope.currentMode = mode;
		var bTrobat=false;
		if(confirm("Are youu suuure Andyyy?"))
		{
			console.log("Esborrant");
			if($scope.currentMode=='A')
			{
				for(var j=0;j<$scope.transcriptions.audio.length;j++)
				{
					if($scope.transcriptions.audio[j].id==code.block.id)
					{
						console.log("del yuuhu");
						$scope.transcriptions.audio.splice(j,1);
						bTrobat=true;						
						j=60000;
					}
				}
			}
			if($scope.currentMode=='T')
			{
				for(var j=0;j<$scope.transcriptions.text.length;j++)
				{
					if($scope.transcriptions.text[j].id==code.block.id)
					{
						console.log("del yuuhu");
						$scope.transcriptions.text.splice(j,1);
						bTrobat=true;						
						j=60000;
					}
				}
			}
			if($scope.currentMode=='I')
			{
				for(var j=0;j<$scope.transcriptions.video.length;j++)
				{
					if($scope.transcriptions.video[j].id==code.block.id)
					{
						console.log("del yuuhu");
						$scope.transcriptions.video.splice(j,1);
						bTrobat=true;						
						j=60000;
					}
				}
			}
			if(bTrobat)
			{
				// treure el codi dels grups
			}
			else
			{
				console.log("Error de coherencia al esborrar un block");
			}
		}
		else console.log("Esborrat abortat");
	}
	$scope.editTranscripcio = function(code,mode)
	{
		$scope.currentMode = mode;
		$scope.currentBlock = angular.copy(code.block);
		$('#editorTranscripcio').modal('toggle');
	}
	$scope.saveTranscripcio = function()
	{
		if($scope.currentMode=='A')
		{
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.audio[j].id==$scope.currentBlock.id)
				{
					$scope.transcriptions.audio[j].contingut_filtrat = $scope.currentBlock.contingut_filtrat;
					$scope.transcriptions.audio[j].contingut2 = $scope.currentBlock.contingut_filtrat;
					$scope.transcriptions.audio[j].start = $scope.currentBlock.start;
				}
			}
		}
		if($scope.currentMode=='T')
		{
			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.text[j].id==$scope.currentBlock.id)
				{
					$scope.transcriptions.text[j].contingut_filtrat = $scope.currentBlock.contingut_filtrat;
					$scope.transcriptions.text[j].contingut2 = $scope.currentBlock.contingut_filtrat;
					$scope.transcriptions.text[j].start = $scope.currentBlock.start;
				}
			}
		}
		if($scope.currentMode=='I')
		{
			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				// agafem tots els blocks del coding actual
				if($scope.transcriptions.video[j].id==$scope.currentBlock.id)
				{
					$scope.transcriptions.video[j].contingut_filtrat = $scope.currentBlock.contingut_filtrat;
					$scope.transcriptions.video[j].contingut2 = $scope.currentBlock.contingut_filtrat;
					$scope.transcriptions.video[j].start = $scope.currentBlock.start;
				}
			}
		}
		$('#editorTranscripcio').modal('toggle');
	}
	$scope.editSingleCoding = function(code,mode)
	{
		console.log("Edit coding");
		$scope.currentMode = mode;
		$scope.currentCoding = {
								id:code.coding.id,
								id_start_bloc:code.coding.id_start_bloc,
								id_end_bloc:code.coding.id_end_bloc,
								start_offset:code.coding.start_offset,
								end_offset:code.coding.end_offset,
								id_code:code.coding.id_code
							}
		$scope.currentIdCode = code.coding.id_code;
		//console.log("El codi editat es: "+code.coding.id_code);
		
		for(var i=0;i<$scope.codisFiltrats.length;i++)
		{
			//console.log($scope.codisFiltrats[i]);
			if($scope.codisFiltrats[i].id==code.coding.id_code)
			{
				$scope.codiSeleccionat = $scope.codisFiltrats[i];
				i=10000;
			}
		}
		//console.log($scope.codisFiltrats[code.id_code]);
		//$scope.codiSeleccionat = $scope.codes.codis[code.id_code];
		$scope.currentBlock = code.block;
		$scope.blocksCoding = $scope.getBlocksCoding();
		
		$('#editorCoding').modal('toggle');
	}
	$scope.getCodingNewId = function()
	{
		//$scope.currentMode = 'A';
		var iMaxId=0;
		var iBlockId = $scope.currentBlock.id;
		if($scope.currentMode=='A')
		{
			// busquem el block
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				if($scope.transcriptions.audio[j].id==iBlockId)
				{
					if($scope.transcriptions.audio[j].codings==undefined)
					{
						$scope.transcriptions.audio[j].codings = [];
					}
					for(var i=0;i<$scope.transcriptions.audio[j].codings.length;i++)
					{
						if($scope.transcriptions.audio[j].codings[i].id>iMaxId)
						{
							iMaxId = $scope.transcriptions.audio[j].codings[i].id;
						}
					}
					j=1000;
				}
			}
		}
		if($scope.currentMode=='T')
		{
			// busquem el block
			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				if($scope.transcriptions.text[j].id==iBlockId)
				{
					if($scope.transcriptions.text[j].codings==undefined)
					{
						$scope.transcriptions.text[j].codings = [];
					}
					for(var i=0;i<$scope.transcriptions.text[j].codings.length;i++)
					{
						if($scope.transcriptions.text[j].codings[i].id>iMaxId)
						{
							iMaxId = $scope.transcriptions.text[j].codings[i].id;
						}
					}
					j=1000;
				}
			}
		}
		if($scope.currentMode=='I')
		{
			// busquem el block
			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				if($scope.transcriptions.video[j].id==iBlockId)
				{
					if($scope.transcriptions.video[j].codings==undefined)
					{
						$scope.transcriptions.video[j].codings = [];
					}
					for(var i=0;i<$scope.transcriptions.video[j].codings.length;i++)
					{
						if($scope.transcriptions.video[j].codings[i].id>iMaxId)
						{
							iMaxId = $scope.transcriptions.video[j].codings[i].id;
						}
					}
					j=1000;
				}
			}
		}
		iMaxId++;
		console.log("Nou Id de coding: "+iMaxId);
		return iMaxId;
	}
	$scope.newSingleCoding = function(code,mode)
	{
		console.log("New coding");
		$scope.currentMode = mode;
		// hem de buscar un nou id
		// i cridar al editSingleCoding
		var iNewId = $scope.getCodingNewId();
		$scope.currentCoding = {
								id:iNewId,
								id_start_bloc:code.block.id,
								id_end_bloc:code.block.id,
								start_offset:0,
								end_offset:code.block.backup_contingut.length,
								id_code:116
							}
		console.log($scope.currentCoding);
		$scope.currentBlock = code.block;
		$scope.blocksCoding = $scope.getBlocksCoding();
		
		$('#editorCoding').modal('toggle');
	}
	$scope.deleteCurrentCodingAll = function()
	{
		var currBlock = $scope.currentBlock;
		currBlock.codings = [];
		$('#editorCoding').modal('toggle');
	}
	$scope.deleteCurrentCoding = function()
	{
		var currBlock = $scope.currentBlock;
		console.log("Deleting current coding");
		// busquem la transcripcio dins de audio
		// de moment nomes mirem audio per sha de fer per cada mode
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				if($scope.transcriptions.audio[j].id==currBlock.id)
				{
					// Li treiem la codificacio de larray de codifiacions
					
					for(var i=0;i<$scope.transcriptions.audio[j].codings.length;i++)
					{
						if($scope.transcriptions.audio[j].codings[i].id==$scope.currentCoding.id)
						{
							
							$scope.transcriptions.audio[j].codings.splice(i, 1);
							i=1000;
						}
					}
					j=60000;
				}
			}

			for(var j=0;j<$scope.transcriptions.video.length;j++)
			{
				if($scope.transcriptions.video[j].id==currBlock.id)
				{
					// Li treiem la codificacio de larray de codifiacions
					
					for(var i=0;i<$scope.transcriptions.video[j].codings.length;i++)
					{
						if($scope.transcriptions.video[j].codings[i].id==$scope.currentCoding.id)
						{
							
							$scope.transcriptions.video[j].codings.splice(i, 1);
							i=1000;
						}
					}
					j=60000;
				}
			}

			for(var j=0;j<$scope.transcriptions.text.length;j++)
			{
				if($scope.transcriptions.text[j].id==currBlock.id)
				{
					// Li treiem la codificacio de larray de codifiacions
					
					for(var i=0;i<$scope.transcriptions.text[j].codings.length;i++)
					{
						if($scope.transcriptions.text[j].codings[i].id==$scope.currentCoding.id)
						{
							
							$scope.transcriptions.text[j].codings.splice(i, 1);
							i=1000;
						}
					}
					j=60000;
				}
			}
		$('#editorCoding').modal('toggle');
	}
	$scope.canviFiltreCodis = function()
	{
		$scope.codisFiltrats = [];
		sKeyword = $scope.filtreCodis;
		for(var i=0;i<$scope.codes.codis.length;i++)
	     {
	     	if($scope.codes.codis[i]!=null) 
     		{
     			if($scope.codes.codis[i].nom.toUpperCase().indexOf(sKeyword.toUpperCase())!=-1 && !$scope.codiJaSeleccionat($scope.codes.codis[i].id)) $scope.codisFiltrats.push($scope.codes.codis[i]);
     		}
	     }
		console.log("Yuhu"+i);
	}
	$scope.tecla = function($event)
	{
		//console.log($event.keyCode);
		//$event.preventDefault();
		//				return false;
		if($event.ctrlKey)
		{
			switch($event.keyCode)
			{
				case 71:$scope.editCurrentGroup();
						$event.preventDefault();
						return false;
				break;
				case 84:$scope.nouBlock();
						$event.preventDefault();
						return false;
				break;
			}
		}
		
	}
	$scope.getMaxIdBlock = function()
	{
		var iCurrentMaxId = 0;
		for(var i=0;i<$scope.transcriptions.text.length;i++)
		{
			if($scope.transcriptions.text[i].id>=iCurrentMaxId) iCurrentMaxId = $scope.transcriptions.text[i].id;
		}
		for(var i=0;i<$scope.transcriptions.audio.length;i++)
		{
			if($scope.transcriptions.audio[i].id>=iCurrentMaxId) iCurrentMaxId = $scope.transcriptions.audio[i].id;
		}
		for(var i=0;i<$scope.transcriptions.video.length;i++)
		{
			if($scope.transcriptions.video[i].id>=iCurrentMaxId) iCurrentMaxId = $scope.transcriptions.video[i].id;
		}
		console.log("MAX ID:"+(iCurrentMaxId+1));
		return iCurrentMaxId+1;
	}
	$scope.copyTransToText = function(block)
	{
		var nouBlock = {
						id:$scope.getMaxIdBlock(),
						contingut2: block.block.contingut2,
						contingut_filtrat:block.block.contingut2,
						backup_contingut:block.block.contingut2,
						codings:[]
						};
		var i=0;
		nouBlock.start = block.block.start;
		var startOriginal = block.block.start;
		if($scope.transcriptions.text.length>0) 
			{
				while(i<$scope.transcriptions.text.length)
				{
					if($scope.transcriptions.text[i].start>startOriginal)
					{
						console.log('Afegim el nou block');
						$scope.transcriptions.text.splice(i, 0, angular.copy(nouBlock));
						i = $scope.transcriptions.text.length+3;
					}
					i++;
				}	
			}
			else $scope.transcriptions.text.push(angular.copy(nouBlock));		

	}
	$scope.copyTransToVideo = function(block)
	{
		var nouBlock = {
						id:$scope.getMaxIdBlock(),
						contingut2: block.block.contingut2,
						contingut_filtrat:block.block.contingut2,
						backup_contingut:block.block.contingut2,
						codings:[]
						};
		var i=0;
		nouBlock.start = block.block.start;
		var startOriginal = block.block.start;
		if($scope.transcriptions.video.length>0) 
			{
				while(i<$scope.transcriptions.video.length)
				{
					if($scope.transcriptions.video[i].start>startOriginal)
					{
						console.log('Afegim el nou block');
						$scope.transcriptions.video.splice(i, 0, angular.copy(nouBlock));
						i = $scope.transcriptions.video.length+3;
					}
					i++;
				}				
			}
			else $scope.transcriptions.video.push(angular.copy(nouBlock));	
	}
	$scope.copyTransToAudio = function(block)
	{
		var nouBlock = {
						id:$scope.getMaxIdBlock(),
						contingut2: block.block.contingut2,
						contingut_filtrat:block.block.contingut2,
						backup_contingut:block.block.contingut2,
						codings:[]
						};
		var i=0;
		nouBlock.start = block.block.start;
		var startOriginal = block.block.start;
		if($scope.transcriptions.audio.length>0) 
			{
			while(i<$scope.transcriptions.audio.length)
			{
				if($scope.transcriptions.audio[i].start>startOriginal)
				{
					console.log('Afegim el nou block');
					$scope.transcriptions.audio.splice(i, 0, angular.copy(nouBlock));
					i = $scope.transcriptions.audio.length+3;
				}
				i++;
			}		
		}
		else 	$scope.transcriptions.audio.push(angular.copy(nouBlock));	
	}
	$scope.nouBlock = function()
	{
		
		var nouBlock = {						
						contingut2:'New',
						contingut_filtrat:'New',
						backup_contingut:'New',
						codings:[]
						};
		var currTime = $scope.player.currentTime();
		nouBlock.start = Math.floor(currTime*1000);
		console.log("CurrTime:"+currTime);
		var secs = Math.floor(currTime%60);
		var mins =  Math.floor(currTime/60);
		var hores =   Math.floor(currTime/3600);
		if(secs<9) secs = '0'+secs;
		if(mins<9) mins = '0'+mins;
		//if(hores<9) hores = '0'+hores;
		var sTime = "("+hores+":"+mins+":"+secs+") ";
		nouBlock.contingut2 = sTime;
		nouBlock.contingut_filtrat = sTime;
		nouBlock.backup_contingut = sTime;
		$scope.player.pause();
		if($scope.audioToggle==true)
		{
			//console.log("Nou block a audio");
			var i=0;
			var bInsertat=false;
			nouBlock.id = $scope.getMaxIdBlock();

			if($scope.transcriptions.audio.length>0) 
			{
				while(i<$scope.transcriptions.audio.length)
				{
					if($scope.transcriptions.audio[i].start/1000>currTime)
					{
						//console.log('Afegim el nou block');
						$scope.transcriptions.audio.splice(i, 0, angular.copy(nouBlock));
						i = $scope.transcriptions.audio.length+3;
						bInsertat=true;
					}
					i++;
				}
				if(!bInsertat)
				{
					$scope.transcriptions.audio.push(angular.copy(nouBlock));
				}
			}
			else
			{
				$scope.offsetAudio = 0;
				$scope.lastoffsetAudio = 0;
				
				$scope.transcriptions.audio.splice(i, 0, angular.copy(nouBlock));
			}
		}
		if($scope.textToggle==true)
		{
			console.log("Nou block a text");
			var i=0;
			var bInsertat=false;
			nouBlock.id = $scope.getMaxIdBlock();
			if($scope.transcriptions.text.length>0) 
			{
				while(i<$scope.transcriptions.text.length)
				{
					if($scope.transcriptions.text[i].start/1000>currTime)
					{
						console.log('Afegim el nou block');
						$scope.transcriptions.text.splice(i, 0, angular.copy(nouBlock));
						i = $scope.transcriptions.text.length+3;
						bInsertat=true;
					}
					i++;
				}
				if(!bInsertat)
				{
					$scope.transcriptions.text.push(angular.copy(nouBlock));
				}
			}
			else
			{
				
				$scope.offsetText = 0;
				$scope.lastoffsetText = 0;
				$scope.transcriptions.text.splice(i, 0, angular.copy(nouBlock));
			}
		}
		if($scope.videoToggle==true)
		{
			console.log("Nou block a video");
			var i=0;
			var bInsertat=false;
			nouBlock.id = $scope.getMaxIdBlock();
			if($scope.transcriptions.video.length>0) 
			{
				console.log("Yeaaaah");
				while(i<$scope.transcriptions.video.length)
				{
					if($scope.transcriptions.video[i].start/1000>=currTime)
					{
						console.log('Afegim el nou block');
						$scope.transcriptions.video.splice(i, 0, angular.copy(nouBlock));
						i = $scope.transcriptions.video.length+3;
						bInsertat=true;
					}
					i++;
				}
				if(!bInsertat)
				{
					$scope.transcriptions.video.push(angular.copy(nouBlock));
				}
			}
			else
			{
				$scope.offsetVideo = 0;
				$scope.lastoffsetVideo = 0;
				
				$scope.transcriptions.video.splice(i, 0, angular.copy(nouBlock));
				console.log($scope.transcriptions.video);
			}
		}
	}
	$scope.editCurrentGroup = function()
	{
		$('#editorGrups').modal('toggle');
	}

	$scope.saveProject = function()
	{
		var tempTrans = '';
		$scope.infoMsg = 'Saving project!';
		tempTrans = angular.copy($scope.transcriptions);
		for (var i=0;i<tempTrans.audio.length;i++)
		{ 
			tempTrans.audio[i].contingut2 = $.base64.btoa($scope.transcriptions.audio[i].contingut2);			
     	}

     	for (var i=0;i<tempTrans.video.length;i++)
		{ 
			tempTrans.video[i].contingut2 = $.base64.btoa($scope.transcriptions.video[i].contingut2);			
     	}

     	for (var i=0;i<tempTrans.text.length;i++)
		{ 
			tempTrans.text[i].contingut2 = $.base64.btoa($scope.transcriptions.text[i].contingut2);
     	}

		var projecte = {
						grups: angular.copy($scope.grups),
						aTrans: tempTrans
		}
		var iId = $scope.currentProjectId;
		var request = $http({
				method: "post",
				url: "project/save/"+iId,
				data: {
					//id: iId
					projecte: projecte
				}
			});
		request.error(function(data, status, headers, config) {
			console.log("Project error!");
			$scope.infoMsg = 'Project error saving!';
			console.log(data);
		});
		request.success(function(data, status, headers, config) {
			console.log("Project saved!");
			$scope.infoMsg = 'Project saved!';
		});
	}
	$scope.contingutFiltrat = function(block)
	{
		console.log(block);
		return "Holaa";
	}

	$scope.seekPlayer = function(block)
	{
		console.log("Seek to:"+block.block.start);
		var iTemps = block.block.start;
		$scope.player.currentTime((iTemps/1000));
		$scope.player.play();
		$scope.reiniTrackingPlayer();
	}

	$scope.reiniTrackingPlayer = function()
	{
		// Per cada mode 
		// Anem al primer block 
		// Parem al primer que sigui major que currentTime del player
		$scope.offsetAudio = 0;
		$scope.offsetVideo = 0;
		$scope.offsetText = 0;

	}
	$scope.loadProject = function(iId)
	{
		$scope.currentProjectId = iId;
		$scope.infoMsg = 'Loading project...';
		 var request = $http({
				method: "get",
				url: "project/load/"+iId,
				params: {
					//id: iId
				}
			});
		request.success(function(data, status, headers, config) {
	      // this callback will be called asynchronously
	      // when the response is available
	     //
	     $scope.infoMsg = 'Converting texts...';
	     	for (var i=0;i<data.projecte.aTrans.audio.length;i++)
			{ 
				data.projecte.aTrans.audio[i].contingut2 = $.base64.atob(data.projecte.aTrans.audio[i].contingut2);
				data.projecte.aTrans.audio[i].contingut_filtrat = $("<p>"+data.projecte.aTrans.audio[i].contingut2+"</p>").text();
				data.projecte.aTrans.audio[i].backup_contingut = data.projecte.aTrans.audio[i].contingut_filtrat;
	     	}

	     	for (var i=0;i<data.projecte.aTrans.video.length;i++)
			{ 
				data.projecte.aTrans.video[i].contingut2 = $.base64.atob(data.projecte.aTrans.video[i].contingut2);
				data.projecte.aTrans.video[i].contingut_filtrat = $("<p>"+data.projecte.aTrans.video[i].contingut2+"</p>").text();
				data.projecte.aTrans.video[i].backup_contingut = data.projecte.aTrans.video[i].contingut_filtrat;
	     	}


	     	for (var i=0;i<data.projecte.aTrans.text.length;i++)
			{ 
				data.projecte.aTrans.text[i].contingut2 = $.base64.atob(data.projecte.aTrans.text[i].contingut2);
				data.projecte.aTrans.text[i].contingut_filtrat = $("<p>"+data.projecte.aTrans.text[i].contingut2+"</p>").text();
				data.projecte.aTrans.text[i].backup_contingut = data.projecte.aTrans.text[i].contingut_filtrat;
	     	}
     		
			$scope.transcriptions.audio = data.projecte.aTrans.audio;
			$scope.transcriptions.video = data.projecte.aTrans.video;
			$scope.transcriptions.text = data.projecte.aTrans.text;
			// sort
			$scope.transcriptions.audio.sort(function (a,b)
			{
				if(a.start < b.start) return -1;
				    if(a.start > b.start) return 1;
				    return 0;
			});
			$scope.transcriptions.video.sort(function (a,b)
			{
				if(a.start < b.start) return -1;
				    if(a.start > b.start) return 1;
				    return 0;
			});
			$scope.transcriptions.text.sort(function (a,b)
			{
				if(a.start < b.start) return -1;
				    if(a.start > b.start) return 1;
				    return 0;
			});
			if(data.projecte.grups==undefined) $scope.grups = [];
			else $scope.grups = data.projecte.grups;
			console.log("Volcat de grups");
			console.log($scope.grups);
			$scope.currentVideo =  'http://192.168.1.104:80/carlesti/videos/' + data.projecte.video+'.webm';
			$('#main_video_html5_api').attr('src',$scope.currentVideo);
			$('#id_source_video').attr('src',$scope.currentVideo);
			$scope.player = videojs('main_video');
			$scope.player.on("timeupdate", $scope.updateHighlightedPlaying);
			$scope.infoMsg = 'Project loaded!';
			//$scope.currentGrupId = 1;
			$scope.currentGrupId = $scope.getMaxGroupId();
			$scope.bProjectLoaded = true;
			$scope.projectName = data.projecte.nom;
			console.log(aNotrobats);
	      //$scope.transcriptions.audio.push('a');
	    });
		
	}

	$scope.updateHighlightedPlaying = function()
	{
		//console.log('Timestamp '+ $scope.player.currentTime());
		if($scope.transcriptions.audio[$scope.offsetAudio]!=undefined)
		while($scope.transcriptions.audio[$scope.offsetAudio].start<=$scope.player.currentTime()*1000)
		{
			//console.log('Timestamp '+ $scope.player.currentTime()*1000+'=>'+$scope.transcriptions.audio[$scope.offsetAudio].start);
		    $scope.transcriptions.audio[$scope.lastoffsetAudio].playing = false;
			$scope.transcriptions.audio[$scope.offsetAudio].playing = true;
			// scroll the panel to the block.
			//console.log("offset "+$scope.transcriptions.audio[$scope.offsetAudio].id+":"+$('#block_'+$scope.transcriptions.audio[$scope.offsetAudio].id).scrollTop());
			var top = $('#block_'+$scope.transcriptions.audio[$scope.offsetAudio].id).position().top;
			$scope.scrollAudio = {'top':top};
			$scope.lastoffsetAudio = $scope.offsetAudio;
			$scope.offsetAudio++;
			//$scope.$digest();
		}
		console.log($scope.offsetVideo);
		if($scope.transcriptions.video[$scope.offsetVideo]!=undefined)
		while($scope.transcriptions.video[$scope.offsetVideo].start<=$scope.player.currentTime()*1000)
		{
			//console.log('Timestamp '+ $scope.player.currentTime()*1000+'=>'+$scope.transcriptions.audio[$scope.offsetAudio].start);
		    $scope.transcriptions.video[$scope.lastoffsetVideo].playing = false;
			$scope.transcriptions.video[$scope.offsetVideo].playing = true;
			$scope.lastoffsetVideo = $scope.offsetVideo;
			$scope.offsetVideo++;
		//	$scope.$digest();
		}
		if($scope.transcriptions.text[$scope.offsetText]!=undefined)
		while($scope.transcriptions.text[$scope.offsetText].start<=$scope.player.currentTime()*1000)
		{
			//console.log('Timestamp '+ $scope.player.currentTime()*1000+'=>'+$scope.transcriptions.audio[$scope.offsetAudio].start);
		    $scope.transcriptions.text[$scope.lastoffsetText].playing = false;
			$scope.transcriptions.text[$scope.offsetText].playing = true;
			$scope.lastoffsetText = $scope.offsetText;
			$scope.offsetText++;
			//
		}
		//$scope.$digest();
	}

	$scope.showCodeManager = function()
	{
		$('#editorCodis').modal('toggle');
		
	}

	$scope.insertCode = function(aTree, idPare, nouCodi,level)
	{
		if(idPare==0)
		{
			aTree.push(nouCodi);
			return true;
		}
		for(var i=0;i<aTree.length;i++)
		{
			if(aTree[i].id==idPare)
			{
				aTree[i].children.push(nouCodi);
				return true;
			}
			//console.log(level);
			if($scope.insertCode(aTree[i].children, idPare, nouCodi, level+1)) return true;

		}
		return false;
	}
	$scope.aLlistaNova = [];
	$scope.regenerateCodeList = function(aTree)
	{
		console.log(aTree);
		for(var i=0;i<aTree.length;i++)
		{
			aCodi = aTree[i];
			$scope.aLlistaNova[aCodi.id] = {id:aCodi.id, name:aCodi.name, id_pare:aCodi.id_pare};
			if(aCodi.children!=undefined) $scope.regenerateCodeList(aCodi.children);
		}
		

	}
	$scope.getNextCodeId = function()
	{
		var iCurrentMaxId = 0;
		for(var i=0;i<$scope.codisFiltrats.length;i++)
		{
			if($scope.codisFiltrats[i].id>=iCurrentMaxId) iCurrentMaxId = $scope.codisFiltrats[i].id;
		}
		return iCurrentMaxId+1;
	}
	$scope.saveCodeTree = function()
	{
		
		var aCodisBons = [];
		/*for(var i=0;i<$scope.codisFiltrats.length;i++)
		{
			aCodisBons.push({'nom':$scope.codisFiltrats[i].nom_complet,id:$scope.codisFiltrats[i].id});
		}
		console.log(aCodisBons);*/
		aCodisBons = $scope.codisFiltrats;
		/*
		$scope.updateCodeTree($scope.codes.tree.codis);*/
		 var request = $http({
				method: "post",
				cache:false,
				url: "codes/save/",
				data: {
					codes: aCodisBons
				}
			});

		request.success(function(data, status, headers, config) {
			console.log("Salvats!");
			//$scope.loadCodes();
			$scope.showCodeManager();
		});

	}
	$scope.updateCodeTree = function(aTree)
	{
		for(var i=0;i<aTree.length;i++)
		{
			var aCode = aTree[i];
			
			var iIndex =0; 
			var bTrobat=false;
			while((!bTrobat) && (iIndex<$scope.codisFiltrats.length))
			{
				if($scope.codisFiltrats[iIndex].id==aCode.id) bTrobat=true;
				else iIndex++;
			}
			if(!bTrobat) {
				console.log("Ens el carreguem!");
				aTree.splice(i,1);
			}
			else
			{
				aCode.name = $scope.codisFiltrats[iIndex].name;
				if(aCode.children!=undefined) $scope.updateCodeTree(aCode.children);
			}
		}
		
	}
	var aNotrobats = {};
	$scope.getCodeById = function(iId, bFull, oCode)
	{
		//console.log(oCode);
		for(var i=0;i<$scope.codes.codis.length;i++)
		{
			if($scope.codes.codis[i].id==iId) 
			{
				if(bFull) return $scope.codes.codis[i].nom;
				else 
				{
					var aParts = $scope.codes.codis[i].nom.split("/");
					return aParts[aParts.length-1];
				}
			}
		}
		// NO trobat! Que fem?
		if(aNotrobats['id_'+iId] === undefined) aNotrobats['id_'+iId]=0;
		else aNotrobats['id_'+iId]++;
		//console.log("NO TROBAT!"+iId);
		if(oCode!=null) 
			{
				delete oCode;
				return "[["+oCode.id_code+"]]";
			}
	}
	$scope.addCodeTreeRoot = function ()
	{
		var idPare  = 0;
		var nouCodi = {
					id:$scope.getNextCodeId(),
					nom:$scope.codiArrel};
		console.log(nouCodi);
		$scope.codisFiltrats.push(nouCodi);
		//$scope.updateCodeTree($scope.codes.tree.codis);
		//$scope.insertCode($scope.codes.tree.codis, idPare, nouCodi,0);
		//$scope.regenerateCodeList($scope.codes.tree.codis);
		
		//$scope.codes.codis = $scope.aLlistaNova;
		//$scope.codisFiltrats = [];

		 /*for(var i=0;i<$scope.codes.codis.length;i++)
	     {
	     	if($scope.codes.codis[i]!=null) 
	     		{
	     			$scope.codes.codis[i].nom_complet = $scope.getNomComplet($scope.codes.codis,i);
	     			$scope.codes.codis[i].nom_complet_pare = $scope.codes.codis[i].nom_complet.substring(0,$scope.codes.codis[i].nom_complet.length-$scope.codes.codis[i].name.length);
	     			$scope.codisFiltrats.push($scope.codes.codis[i]);
	     		}
	     }*/
	}
	$scope.addCodeTreeChild = function (code)
	{
		var idPare = code.code.id;
		var nouCodi = {
					id:$scope.getNextCodeId(),
					name:'New Code',
					nom_complet:'',
					id_pare: idPare,
					children:[]
				};
		$scope.updateCodeTree($scope.codes.tree.codis);
		$scope.insertCode($scope.codes.tree.codis, idPare, nouCodi,0);
		$scope.regenerateCodeList($scope.codes.tree.codis);
		
		$scope.codes.codis = $scope.aLlistaNova;
		$scope.codisFiltrats = [];
	     for(var i=0;i<$scope.codes.codis.length;i++)
	     {
	     	if($scope.codes.codis[i]!=null) 
	     		{
	     			$scope.codes.codis[i].nom_complet = $scope.getNomComplet($scope.codes.codis,i);
	     			$scope.codes.codis[i].nom_complet_pare = $scope.codes.codis[i].nom_complet.substring(0,$scope.codes.codis[i].nom_complet.length-$scope.codes.codis[i].name.length);
	     			$scope.codisFiltrats.push($scope.codes.codis[i]);
	     		}
	     }
	    
				/*
		for (var i=0;i<$scope.codisFiltrats.length;i++)
		{
			if($scope.codisFiltrats[i].id==code.code.id)
			{
				nouCodi.id_pare = $scope.codisFiltrats[i].id;
				nouCodi.nom_complet = $scope.codisFiltrats[i].nom_complet + '/New Code';
				$scope.codisFiltrats.splice(i+1, 0, nouCodi);
				i=9999;
			} 
		}*/

	}

	$scope.delCodeTreeChild = function (code)
	{
		if(confirm("Are you suuuure Andy?"))
		{
			console.log(code.code);
			for (var i=0;i<$scope.codisFiltrats.length;i++)
			{
				if($scope.codisFiltrats[i].id==code.code.id)
				{
					$scope.codisFiltrats.splice(i, 1);
				} 
			}
			//$scope.updateCodeTree($scope.codes.tree.codis);
		}
	}
	$scope.setCodi = function(block)
	{
		console.log('Add '+block.block.id);
		$scope.currentIdCode = block.block.id;
	}

	$scope.showStats = function()
	{
		$('#stats').modal('toggle');
		var aDataVerbal = [];
		var aDataTextual = [];
		var aDataVideo = [];
		var aSuma=[];
		var iMaxTimestamp = 0;
		for (var i=0;i<400;i++)
		{
			aSuma[i] = 0;
		}
		for (var i=0;i<$scope.transcriptions.audio.length;i++)
		{
			var iNum = 0;
			if($scope.transcriptions.audio[i].codings!=undefined)
			{
				iNum+= $scope.transcriptions.audio[i].codings.length;
			}
			if($scope.transcriptions.audio[i].groups!=undefined)
			{

				for(var j=0;j<$scope.transcriptions.audio[i].groups[j];j++)
				{
					var iIdGrup = $scope.transcriptions.audio[i].groups[j];
					for(var k=0;k<$scope.grups.length;k++)
					{
						if($scope.grups[k].id == iIdGrup) 
							{
								oGrup = $scope.grups[k];
							}
					}
					iNum+= oGrup.codis.length;
				}
			}
			if($scope.transcriptions.audio[i].start!=undefined) 
				{
					aDataVerbal.push([$scope.transcriptions.audio[i].start, iNum]);
					aSuma[Math.round($scope.transcriptions.audio[i].start/60000)]+=iNum;
				}
			if(iMaxTimestamp<$scope.transcriptions.audio[i].start && iNum>0) 

			 iMaxTimestamp = $scope.transcriptions.audio[i].start;
		}
		for (var i=0;i<$scope.transcriptions.text.length;i++)
		{
			var iNum = 0;
			if($scope.transcriptions.text[i].codings!=undefined)
			{
				iNum+= $scope.transcriptions.text[i].codings.length;
			}
			if($scope.transcriptions.text[i].groups!=undefined)
			{

				for(var j=0;j<$scope.transcriptions.text[i].groups[j];j++)
				{
					var iIdGrup = $scope.transcriptions.text[i].groups[j];
					for(var k=0;k<$scope.grups.length;k++)
					{
						if($scope.grups[k].id == iIdGrup) 
							{
								oGrup = $scope.grups[k];
							}
					}
					iNum+= oGrup.codis.length;
				}
			}
			if($scope.transcriptions.text[i].start!=undefined) 
				{
					aDataTextual.push([$scope.transcriptions.text[i].start, iNum]);
					aSuma[Math.round($scope.transcriptions.text[i].start/60000)]+=iNum;
				}
			if(iMaxTimestamp<$scope.transcriptions.text[i].start && iNum>0) 
			 iMaxTimestamp = $scope.transcriptions.text[i].start;
		}

		for (var i=0;i<$scope.transcriptions.video.length;i++)
		{
			var iNum = 0;
			if($scope.transcriptions.video[i].codings!=undefined)
			{
				iNum+= $scope.transcriptions.video[i].codings.length;
			}
			if($scope.transcriptions.video[i].groups!=undefined)
			{

				for(var j=0;j<$scope.transcriptions.video[i].groups[j];j++)
				{
					var iIdGrup = $scope.transcriptions.video[i].groups[j];
					for(var k=0;k<$scope.grups.length;k++)
					{
						if($scope.grups[k].id == iIdGrup) 
							{
								oGrup = $scope.grups[k];
							}
					}
					iNum+= oGrup.codis.length;
				}
			}
			if($scope.transcriptions.video[i].start!=undefined) 
				{
					aDataVideo.push([$scope.transcriptions.video[i].start, iNum]);
					aSuma[Math.round($scope.transcriptions.video[i].start/60000)]+=iNum;
				}
			if(iMaxTimestamp<$scope.transcriptions.video[i].start && iNum>0) 
			 iMaxTimestamp = $scope.transcriptions.video[i].start;
		}
		// genero un array amb acumulats per cada minut (60000)
		console.log(iMaxTimestamp)
		console.log(iMaxTimestamp/60000);
		var aAcumulat = [];
		for(var m=0;m<Math.round(iMaxTimestamp/60000)+1;m++)
		{
			aAcumulat.push([m,aSuma[m]]);
		}
		$('#stat_graf').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Code density'
        },
        xAxis: {
            title: {
                text: 'Timestamp'
            },
            max: m+1
        },
        yAxis: {
            title: {
                text: 'Number of codes'
            },
            min: 0
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: 'Minut {point.x}: {point.y} codes'
        },

        series: [{
            name: 'Per minut',
            // Define the data points. All series have a dummy year
            // of 1970/71 in order to be compared on the same x axis. Note
            // that in JavaScript, months start at 0 for January, 1 for February etc.
            data: aAcumulat
        	}]
    	});

	}
	
});
