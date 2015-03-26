var App3m = angular.module('App3m',  ['ngSanitize']);

App3m.controller('mainController',function($scope, $http){
	$scope.infoMsg = "Ready...";
	$scope.aMatrix = [];
	$scope.workingMatrix = [];
	$scope.aCodes = [];
	$scope.oCodes = {};
	$scope.aTurns = [];
	$scope.oTurns = {};
	$scope.aSelected = [];
	$scope.bDebug = false;
	$scope.bReady = false;
	$scope.bQuery1 = false;
	$scope.aResult = [];
	$scope.newColSelected;
	$scope.aTurnsBossa = [];
	$scope.aFilteredCodes = [];
	$scope.aColumns = [];
	$scope.aRows = [];
	$scope.newColSelected;
	$scope.newRowSelected;
	$scope.aCurrentTurns;
	$scope.bShowCodings=false;
	$scope.bShowGroups=false;
	$scope.queryClass='col-sm-10';
	$scope.turnsClass='col-sm-2';
	$scope.aKeys = [];
	$scope.aList = {};
	

	$scope.init = function()
	{
		$scope.loadMatrix();

	}
	$scope.delColumn = function(index)
	{
		$scope.aColumns.splice(index,1);
		reQuery();
	}
	$scope.delRow = function(index)
	{
		$scope.aRows.splice(index,1);
		reQuery();
	}
	$scope.addColumn = function()
	{
		$scope.aColumns.push($scope.newColSelected);
		//for(var i=0;i<$scope.aCodes.length;i++) $scope.aColumns.push($scope.aCodes[i]);
		
		reQuery();
	}
	$scope.addRow = function()
	{
		$scope.aRows.push($scope.newRowSelected);
		//for(var i=0;i<$scope.aCodes.length;i++) $scope.aRows.push($scope.aCodes[i]);
		reQuery();
	}
	$scope.showQuery = function()
	{
		$scope.queryClass='col-sm-10';
		$scope.turnsClass='col-sm-2';
	}
	$scope.showTurns = function(iRow,iCol)
	{
		$scope.aCurrentTurns = $scope.aResult[iRow][iCol];
		$scope.queryClass='col-sm-3';
		$scope.turnsClass='col-sm-9';
		//console.log($scope.aResult[iRow][iCol]);
	}
	$scope.getTornText = function(iIndexTorn)
	{
		var sKeyTorn = $scope.aTurns[iIndexTorn];
		var oTorn = $scope.oTurns[sKeyTorn];
		//console.log(oTorn);
		return oTorn.contingut_filtrat;
	}
	$scope.getTorn = function(iIndexTorn)
	{
		var sKeyTorn = $scope.aTurns[iIndexTorn];
		var oTorn = $scope.oTurns[sKeyTorn];
		return oTorn;
	}
	$scope.getListMatches = function(sMatches)
	{
		var aMat = $scope.aList[sMatches];
		var sText = '';
		var bDone = {};
		for(var i=0;i<aMat.length;i++)
		{
			if(bDone['c'+aMat[i].i] && bDone['c'+aMat[i].j])
			{

			}
			else
			{
				sText += "(";
				var oCode = $scope.aCodes[aMat[i].i];
				sText += oCode.nom + ',';
				oCode = $scope.aCodes[aMat[i].j];
				sText += oCode.nom;
				sText += ")";
				bDone['c'+aMat[i].i] = true;
				bDone['c'+aMat[i].j] = true;
			}
		}
		return sText;
	}
	function reQuery()
	{
		//inicialitzem matriu
		$scope.aResult = [];
		for(var i=0;i<$scope.aRows.length;i++)
		{
			var aRow = [];
			for(var j=0;j<$scope.aColumns.length;j++)
			{
				aTornsMacthing = getTornsMatching(i,j);
				aRow.push(aTornsMacthing);
			}
			$scope.aResult.push(aRow);
			console.log("Row processada "+i);
		}
		if($scope.bDebug)
		{
			var aList = {};
			for(var i=0;i<$scope.aResult.length;i++)
			{
				for(var j=0;j<$scope.aResult[i].length;j++)
				{
					if(j!=i && $scope.aResult[i][j]!=0)
					{
						var sHits = 'h'+$scope.aResult[i][j].length;
						if(aList[sHits]===undefined) aList[sHits] = [] ;
						aList[sHits].push({i:i,j:j});
					}
				}
			}
			$scope.aList = aList;
			$scope.aKeys = Object.keys(aList);
			$scope.aKeys.sort(function(a,b)
				{
					if(parseInt(a.replace('h',''))>parseInt(b.replace('h','')))
						return -1;
					if(parseInt(a.replace('h',''))<parseInt(b.replace('h','')))
						return 1;
					return 0;
				});

			console.log($scope.aKeys);
		}
		//console.log($scope.aResult);
	}
	function getTornsMatching(iRow,jCol)
	{

		// Agafo els indexs de i, j
		
		var iIdR = $scope.aRows[iRow].id;
		var iIndexR = $scope.oCodes['c'+iIdR];
		var iIdC = $scope.aColumns[jCol].id;
		var iIndexC = $scope.oCodes['c'+iIdC];
		var aReturn = [];
		// per cada torn
		for(var i=0;i<$scope.aMatrix.length;i++)
		{
			var oTorn = $scope.aMatrix[i];
			if(oTorn[iIndexR]==1 && oTorn[iIndexC]==1)
			{
				
				aReturn.push(i);
			}
		}
		return aReturn;
	}
	$scope.loadMatrix = function()
	{
		 var request = $http({
				method: "get",
				cache:false,
				url: "utils/etl/",
				params: {
					//id: iId
				}
			});
		request.success(function(data, status, headers, config) {
			console.log("Carregat");
			$scope.infoMsg = "Codis carregats...";
			$scope.aMatrix = data.aMatrix;
			$scope.aCodes = data.aCodes.slice();
			$scope.oCodes = data.oCodes;
			$scope.aTurns = data.aTurns;
			$scope.oTurns = data.oTurns;
			$scope.bReady = true;
			iniBossa();
			
		});
	}
	function iniBossa()
	{
		console.log("Antiga matriu de "+$scope.aMatrix.length+"x"+$scope.aMatrix[0].length);
		// recorrem codis
		$scope.aFilteredCodes = [];
		for(var j=0;j<$scope.aMatrix[0].length;j++)
		{
			// recorrem torns
			var bFound = false
			for(var i=0;i<$scope.aMatrix.length;i++)
			{
				if($scope.aMatrix[i][j]==1)
				{
					bFound=true;
					i=$scope.aMatrix.length+1;
				}
			}
			$scope.aFilteredCodes.push(bFound);
		}
		// construeixo la working matrix
		$scope.workingMatrix = [];
		for(var i=0;i<$scope.aMatrix.length;i++)			
		{
			aTorn = [];
			for(var j=0;j<$scope.aMatrix[i].length;j++)
			{
				if($scope.aFilteredCodes[j])
				{
					aTorn.push($scope.aMatrix[i][j]);
				}
			}
			$scope.workingMatrix.push(aTorn);
		}
		console.log("Nova matriu de "+$scope.workingMatrix.length+"x"+$scope.workingMatrix[0].length);
	}
	$scope.query1 = function()
	{
		var aBossaSelected = {};
		// Get all the turns for each selected Code
		for(var i=0;i<$scope.query1Data.aSelectedCodes.length;i++)
		{
			var iIdCode = $scope.query1Data.aSelectedCodes[i];
			var iIndexCode = $scope.oCodes['c'+iIdCode];
			console.log($scope.aMatrix.length);
			for(var j=0;j<$scope.aMatrix.length;j++)
			{
				if($scope.aMatrix[j][iIndexCode]==1)
				{
					// aquest torn té aquest coding
					if(aBossaSelected['c'+iIdCode]===undefined) aBossaSelected['c'+iIdCode] = {aTurns:[]};
					aBossaSelected['c'+iIdCode].aTurns.push(j);
				}
			}
		}
		console.log(aBossaSelected);
		var aKeys = Object.keys(aBossaSelected);
		for(var i=0;i<aKeys.length;i++)
		{
			aBossaSelected[aKeys[i]].aDrill = {};
			for(var j=0;j<$scope.query1Data.aDrillCodes.length;j++)
			{
				var iIdDrillCode = $scope.query1Data.aDrillCodes[j];
				var iIndexCode = $scope.oCodes['c'+iIdDrillCode];
				// inicialitzem el sub array
				aBossaSelected[aKeys[i]].aDrill['c'+iIdDrillCode] = [];
				for(var k=0;k<aBossaSelected[aKeys[i]].aTurns.length;k++)
				{
					var curTurn = aBossaSelected[aKeys[i]].aTurns[k];
					if($scope.aMatrix[curTurn][iIndexCode]==1)
					{
						aBossaSelected[aKeys[i]].aDrill['c'+iIdDrillCode].push(curTurn);
					}
				}
			}
		}

		$scope.aResult = [];
		var aHeader = ["Strategy \\ Initiator", "Total"];
		for(var j=0;j<$scope.query1Data.aDrillCodes.length;j++)
		{
			var sNom = $scope.aCodes[$scope.oCodes['c'+$scope.query1Data.aDrillCodes[j]]].nom;
			aHeader.push(sNom);
		}
		$scope.aResult.push(aHeader);
		
		//for(var i=0;i<2;i++)
		for(var i=0;i<aKeys.length;i++)
		{
			var sNom = $scope.aCodes[$scope.oCodes[aKeys[i]]].nom;
			var aRow = [sNom, aBossaSelected[aKeys[i]].aTurns.length];
			for(var j=0;j<$scope.query1Data.aDrillCodes.length;j++)
			{
				var iIdDrillCode = $scope.query1Data.aDrillCodes[j];
				aRow.push(aBossaSelected[aKeys[i]].aDrill['c'+iIdDrillCode].length);	
			}
			
			$scope.aResult.push(aRow);
		}
		console.log($scope.aResult);
		$scope.bQuery1 = true;
	}

});