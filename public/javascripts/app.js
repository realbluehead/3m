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
	     $scope.codisFiltrats = [];
	     for(var i=0;i<data.codis.length;i++)
	     {
	     	if(data.codis[i]!=null) 
	     		{
	     			data.codis[i].nom_complet = $scope.getNomComplet(data.codis,i);
	     			$scope.codisFiltrats.push(data.codis[i]);
	     		}
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
		
		for(var i=0;i<$scope.grups.length;i++)
		{
			if($scope.grups[i].id == idGrup) oGrup = $scope.grups[i];
		}
		
		$scope.codisSeleccionats = oGrup.codis;
		$scope.currentGrup = oGrup.membres;
		$scope.canviFiltreCodis();
		// visualitzem l'editor
		$scope.editCurrentGroup();

	}
	$scope.toggleCheck  = function(block)
	{
		
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

	$scope.getMaxGroupId = function()
	{
		var iCurrentMaxId = 0;
		for(var i=0;i<$scope.grups.length;i++)
		{
			if($scope.grups[i].id>=iCurrentMaxId) iCurrentMaxId = $scope.grups[i].id;
		}
		return iCurrentMaxId+1;
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

	$scope.highlightTurns = function(type, start,coding)
	{
		if(type=='audio')
		{
			// hem de saber quants torns cal remarcar.
			
			console.log(coding.id_start_bloc + "=>"+coding.id_end_bloc);
			
			// Si el coding està dins del mateix bloc nomès cal resaltar aquell bloc
			if(coding.id_start_bloc=coding.id_end_bloc)
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
				while(!bFiGrup)
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
	}
	$scope.highlightCoding = function(code)
	{
		//console.log("Highlight coding");
		var bTrobat=false;
		var currentBlock = code.block;
		for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				if($scope.transcriptions.audio[j].id==currentBlock.id)
				{
					bTrobat= true;
					$scope.highlightTurns('audio', j, code.coding);
					
					j=10000;
				}
			}
		//console.log(currentBlock);
	}
	
	$scope.unhighlightCoding = function(code)
	{
		//console.log("Unhighlight coding");
		var bTrobat=false;
		var currentBlock = code.block;
		for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				if($scope.transcriptions.audio[j].id==currentBlock.id)
				{
					bTrobat= true;
					$scope.transcriptions.audio[j].contingut_filtrat =  $scope.transcriptions.audio[j].backup_contingut;
					j=10000;
				}
			}
	}

	$scope.modStartOffset = function(value)
	{
		$scope.currentCoding.start_offset += value;
		$scope.blocksCoding = $scope.getBlocksCoding();
	}

	$scope.modEndOffset = function(value)
	{
		$scope.currentCoding.end_offset += value;
		$scope.blocksCoding = $scope.getBlocksCoding();
	}

	$scope.addBlockCoding = function()
	{
		var coding = $scope.currentCoding;
		console.log(coding.id_end_bloc);
		for(var j=0;j<$scope.transcriptions.audio.length;j++)
		{
			// agafem tots els blocks del coding actual
			if($scope.transcriptions.audio[j].id==coding.id_end_bloc)
			{
				console.log("j:"+j+",id="+$scope.transcriptions.audio[j+1].id);
				$scope.currentCoding.id_end_bloc = $scope.transcriptions.audio[j+1].id;
				j=1000;
			}
		}
		$scope.blocksCoding = $scope.getBlocksCoding();
	}
	$scope.getBlocksCoding = function()
	{
		var bTrobat= false;
		var aBlocks = [];
		var coding = $scope.currentCoding;
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
					$scope.transcriptions.audio[iCurrentOffset].contingut_edit =  filtrat;
					
					aBlocks.push($scope.transcriptions.audio[iCurrentOffset]);
					
					if($scope.transcriptions.audio[iCurrentOffset].id == coding.id_end_bloc) bFiGrup=true;
					iCurrentOffset++;									
				}
				j=10000;
			}
		}
		//console.log(aBlocks);
		return aBlocks;
	}
	$scope.editSingleCoding = function(code)
	{
		console.log("Edit coding");
		$scope.currentCoding = code.coding;
		$scope.currentBlock = code.block;
		$scope.blocksCoding = $scope.getBlocksCoding();
		
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
					console.log($scope.transcriptions.audio[j]);
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
		
	}
	$scope.canviFiltreCodis = function()
	{
		$scope.codisFiltrats = [];
		sKeyword = $scope.filtreCodis;
		for(var i=0;i<$scope.codes.codis.length;i++)
	     {
	     	if($scope.codes.codis[i]!=null) 
	     		{
	     			if($scope.codes.codis[i].nom_complet.toUpperCase().indexOf(sKeyword.toUpperCase())!=-1 && !$scope.codiJaSeleccionat($scope.codes.codis[i].id)) $scope.codisFiltrats.push($scope.codes.codis[i]);
	     		}
	     }
		console.log("Yuhu"+i);
	}
	$scope.tecla = function($event)
	{
		console.log($event);
		if($event.ctrlKey)
		{
			switch($event.keyCode)
			{
				case 71:$scope.editCurrentGroup();
						$event.preventDefault();
						return false;
				break;
			}
		}
		
	}

	$scope.editCurrentGroup = function()
	{
		$('#editorGrups').modal('toggle');
	}

	$scope.saveProject = function()
	{
		var tempTrans = $scope.transcriptions;

		for (var i=0;i<tempTrans.audio.length;i++)
		{ 
			tempTrans.audio[i].contingut2 = $.base64.btoa($scope.transcriptions.audio[i].contingut2);
			tempTrans.audio[i].contingut_filtrat = "<pre>" + tempTrans.audio[i].contingut2 + "</pre>";
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
						grups: $scope.grups,
						transcriptions: tempTrans
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
			console.log(data);
		});
		request.success(function(data, status, headers, config) {
			console.log("Project saved!");
		});
	}
	$scope.contingutFiltrat = function(block)
	{
		console.log(block);
		return "Holaa";
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
	     	}

	     	for (var i=0;i<data.projecte.aTrans.text.length;i++)
			{ 
				data.projecte.aTrans.text[i].contingut2 = $.base64.atob(data.projecte.aTrans.text[i].contingut2);
	     	}
     		
			$scope.transcriptions.audio = data.projecte.aTrans.audio;
			$scope.transcriptions.video = data.projecte.aTrans.video;
			$scope.transcriptions.text = data.projecte.aTrans.text;
			$scope.infoMsg = 'Project loaded!';
			$scope.currentGrupId = 1;
			$scope.bProjectLoaded = true;

	      //$scope.transcriptions.audio.push('a');
	    });
		
	}
});