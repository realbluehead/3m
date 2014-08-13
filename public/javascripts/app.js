var App3m = angular.module('App3m',  []);

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
	     	if(data.codis[i]!=null) $scope.codisFiltrats.push(data.codis[i]);
	     }
	     console.log($scope.codes.codis);
	 });
	}

	$scope.toggleCheck  = function(block)
	{
		console.log(block.block);
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
		oNouGrup = {id:$scope.currentGrupId,membres:$scope.currentGrup};
		for(var i=0;i<$scope.currentGrup.length;i++)
		{
			// de moment nomes mirem audio per sha de fer per cada mode
			for(var j=0;j<$scope.transcriptions.audio.length;j++)
			{
				if($scope.transcriptions.audio[j].id==$scope.currentGrup[i])
				{
					if($scope.transcriptions.audio[j].groups==undefined) $scope.transcriptions.audio[j].groups = [];
					$scope.transcriptions.audio[j].groups.push(oNouGrup.id);
					$scope.transcriptions.audio[j].checked =false;
					j=60000;
				}
			}
		}
		$scope.currentGrupId++;
		$scope.currentGrup = [];
		$scope.grups.push(oNouGrup);
		$('#editorGrups').modal('toggle');
	}

	$scope.afegirCodiGrup = function(block)
	{
		console.log('Add '+block.block.id);
		$scope.codisSeleccionats.push(block.block);
		$scope.codes.codis[block.block.id].hide = true;
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
		// delete the hide boolean of the list of codes
		delete $scope.codes.codis[block.block.id]['hide'];
		$scope.canviFiltreCodis();
	}
	$scope.canviFiltreCodis = function()
	{
		$scope.codisFiltrats = [];
		sKeyword = $scope.filtreCodis;
		for(var i=0;i<$scope.codes.codis.length;i++)
	     {
	     	if($scope.codes.codis[i]!=null) 
	     		{
	     			if($scope.codes.codis[i].name.indexOf(sKeyword)!=-1 && !$scope.codes.codis[i].hide) $scope.codisFiltrats.push($scope.codes.codis[i]);
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

	$scope.loadProject = function(iId)
	{
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
	      //$scope.transcriptions.audio.push('a');
	    });
		
	}
});