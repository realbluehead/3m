var App3m = angular.module('App3m',  ['ngSanitize']);

App3m.controller('mainController',function($scope, $http){
	$scope.infoMsg = "Ready...";
	$scope.projects = [];
	$scope.codes = [];
	$scope.codisFiltrats = [];
	$scope.codiSeleccionat  = '';
	$scope.aFilterCodes = [];
	$scope.stats = {total_turns_analyzed:0, total_turns_matching:0};
	$scope.aMatchingTurns = [];

	$scope.init = function()
	{
		$scope.loadProjects();

	}

	$scope.loadProjects = function()
	{
		 var request = $http({
				method: "get",
				cache:false,
				url: "project/list/",
				params: {
					//id: iId
				}
			});
		request.success(function(data, status, headers, config) {
			$scope.projects = data;
			$scope.loadCodes();
		});
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

		     $scope.codisFiltrats = [];
		     $scope.codes = data;
		     for(var i=0;i<data.codis.length;i++)
		     {
		     	if(data.codis[i]!=null) 
		     		{
		     			data.codis[i].nom_complet = $scope.getNomComplet(data.codis,i);
		     			data.codis[i].nom_complet_pare = data.codis[i].nom_complet.substring(0,data.codis[i].nom_complet.length-$scope.codes.codis[i].name.length);
		     			
		     			$scope.codisFiltrats.push(data.codis[i]);
		     		}
		     }
			  console.log($scope.codisFiltrats);
		     $scope.postinit();
	 	});
		
	};
	$scope.getNomComplet = function(aCodis, iIndex)
	{
		if(aCodis[iIndex].id_pare!=0) return $scope.getNomComplet(aCodis, aCodis[iIndex].id_pare) + '/' + aCodis[iIndex].name;
		else return aCodis[iIndex].name;
	}
	$scope.postinit = function()
	{

	}

	$scope.nouCodiFiltre = function()
	{
		//console.log($scope.codiSeleccionat);
		for(var i=0;i<$scope.aFilterCodes.length;i++)
		{
			if($scope.aFilterCodes[i].id==$scope.codiSeleccionat.id) return;
		}
		$scope.aFilterCodes.push($scope.codiSeleccionat);
	}
	$scope.deleteFilterCode = function(code)
	{
		var iId = code.codi.id;
		var iPos;
		for(var i=0;i<$scope.aFilterCodes.length;i++)
		{
			if($scope.aFilterCodes[i].id==iId) iPos = i;
		}
		$scope.aFilterCodes.splice(iPos,1);
		console.log(iId);
	}

	$scope.getStats = function()
	{
		$scope.stats.total_turns_analyzed = 0;
		$scope.stats.total_turns_matching = 0;
		$scope.aMatchingTurns = [];
		for(var i=0;i<$scope.projects.length;i++)
		{
			$scope.getProjectStats(i);
		}
	}

	$scope.getProjectStats = function(iPrj)
	{
		var aTrans = $scope.projects[iPrj].projecte.aTrans.audio;
		for(var i=0;i<aTrans.length;i++)
		{
			$scope.stats.total_turns_analyzed++;
			if(aTrans[i].codings!=undefined)
			{
				// Per cada coding d'un block, mirem condicions
				for(var j=0;j<aTrans[i].codings.length;j++)
				{
					var oCodi = aTrans[i].codings[j];
					//console.log(oCodi);
					//console.log(oCodi.id_code);
					for(var k=0;k<$scope.aFilterCodes.length;k++)
					{
						if($scope.aFilterCodes[k].id==oCodi.id_code) 
						{
							$scope.stats.total_turns_matching++;
							$scope.aMatchingTurns.push({i:i, j:j, k:k, original:aTrans[i]});
						}
					}

				}
			}
		}
		var aTrans = $scope.projects[iPrj].projecte.aTrans.video;
		for(var i=0;i<aTrans.length;i++)
		{
			$scope.stats.total_turns_analyzed++;
			if(aTrans[i].codings!=undefined)
			{
				// Per cada coding d'un block, mirem condicions
				for(var j=0;j<aTrans[i].codings.length;j++)
				{
					var oCodi = aTrans[i].codings[j];
					//console.log(oCodi);
					//console.log(oCodi.id_code);
					for(var k=0;k<$scope.aFilterCodes.length;k++)
					{
						if($scope.aFilterCodes[k].id==oCodi.id_code) 
						{
							$scope.stats.total_turns_matching++;
							$scope.aMatchingTurns.push({i:i, j:j, k:k, original:aTrans[i]});
						}
					}

				}
			}
		}
		var aTrans = $scope.projects[iPrj].projecte.aTrans.text;
		for(var i=0;i<aTrans.length;i++)
		{
			$scope.stats.total_turns_analyzed++;
			if(aTrans[i].codings!=undefined)
			{
				// Per cada coding d'un block, mirem condicions
				for(var j=0;j<aTrans[i].codings.length;j++)
				{
					var oCodi = aTrans[i].codings[j];
					//console.log(oCodi);
					//console.log(oCodi.id_code);
					for(var k=0;k<$scope.aFilterCodes.length;k++)
					{
						if($scope.aFilterCodes[k].id==oCodi.id_code) 
						{
							$scope.stats.total_turns_matching++;
							$scope.aMatchingTurns.push({i:i, j:j, k:k, original:aTrans[i]});
						}
					}

				}
			}
		}
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
});