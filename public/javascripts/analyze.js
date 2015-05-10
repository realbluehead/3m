var App3m = angular.module('App3m',  ['ngSanitize']);

App3m.controller('mainController',function($scope, $http){
	$scope.infoMsg = "Ready...";
	$scope.aMatrix = [];
	$scope.workingMatrix = [];
	$scope.aSessions = [
						{title:'Session 1', checked:true},
						{title:'Session 2', checked:true},
						{title:'[Session 3]', checked:true},
						{title:'Session 4', checked:true},
						{title:'Session 5', checked:true},
						{title:'Session 6', checked:true},
						{title:'Session 7', checked:true},
						{title:'Session 8', checked:true},
						{title:'Session 9', checked:true},
						{title:'Session 10', checked:true},
						{title:'Session 11', checked:true},
						{title:'Session 12', checked:true}
						];
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
	$scope.newColSelectedSib = [];
	$scope.aTurnsBossa = [];
	$scope.aFilteredCodes = [];
	$scope.aColumns = [];
	$scope.aRows = [];
	$scope.newColSelected;
	$scope.newRowSelected;
	$scope.aCurrentTurns;
	$scope.aCurrentGroupTurns;
	$scope.bShowCodings=false;
	$scope.bShowGroups=false;
	$scope.queryClass='col-sm-10';
	$scope.turnsClass='col-sm-1';
	$scope.contextClass='col-sm-1';
	$scope.aKeys = [];
	$scope.aList = {};
	$scope.aStats = {total_time:0, total_words:0};
	
	$scope.reload = function()
	{
		$scope.loadMatrix();
	}
	$scope.init = function()
	{
		$scope.loadMatrix();

	}
	$scope.delColumn = function(indexpare, index)
	{
		$scope.aColumns[indexpare].splice(index,1);
		if($scope.aColumns[indexpare].length==0) $scope.aColumns.splice(indexpare,1);
		reQuery();
	}
	$scope.delRow = function(index)
	{
		$scope.aRows.splice(index,1);
		reQuery();
	}
	$scope.addColumnSibling= function(index)
	{
		console.log(index);
		$scope.aColumns[index].push($scope.newColSelectedSib[index]);
		reQuery();
	}
	$scope.addColumn = function()
	{
		$scope.aColumns.push([$scope.newColSelected]);
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
		$scope.turnsClass='col-sm-1';
		$scope.contextClass='col-sm-1';
	}
	$scope.showGTurns = function(iRow,iCol)
	{

	}
	$scope.showGroupTurns = function(oTorn, oGroup)
	{
		$scope.aCurrentGroupTurns = getGroupTurns($scope.aTurns[oTorn], oGroup);
		$scope.queryClass='col-sm-2';
		$scope.turnsClass='col-sm-2';
		$scope.contextClass='col-sm-8';
		console.log($scope.aTurns[oTorn]+':'+oGroup);
	}
	function getGroupTurns(sIdTorn, oGroup)
	{
		//for(var i=0;i<3;i++)
		var aTmp = sIdTorn.replace('a','t').replace('v','t').split('t');
		var sProject = aTmp[0].replace('p','');
		console.log('projecte:'+sProject);
		var iTotalTime = 0;
		var iTotalWords = 0;
		var aTurns = [];
		for(var i=0;i<$scope.aTurns.length;i++)
		{
			var aTmp = $scope.aTurns[i].replace('a','t').replace('v','t').split('t');
			var sProjectTmp = aTmp[0].replace('p','');

			if($scope.oTurns[$scope.aTurns[i]].groups!==undefined && sProjectTmp==sProject)
			{
				if($scope.oTurns[$scope.aTurns[i]].groups.indexOf(oGroup)!=-1) 
					{
						aTurns.push(i);

						console.log($scope.oTurns[$scope.aTurns[i]].groups);
					}
			}
		}
		return aTurns;
	}
	$scope.showTurns = function(iRow,iCol)
	{
		$scope.aCurrentTurns = $scope.aResult[iRow][iCol].torns;
		$scope.recalculateStats();
		$scope.queryClass='col-sm-2';
		$scope.turnsClass='col-sm-9';
		$scope.contextClass='col-sm-1';
		console.log($scope.aResult[iRow][iCol]);
	}
	$scope.countOf = function(text) {
	    var s = text ? text.split(/\s+/) : 0; // it splits the text on space/tab/enter
	    return s ? s.length : '';
	};
	$scope.recalculateStats = function()
	{
		var iTotalTime = 0;
		var iTotalWords = 0;
		for(var i=0;i<$scope.aCurrentTurns.length;i++)
		{
			var sKeyTorn = $scope.aTurns[$scope.aCurrentTurns[i]];
			var oTorn = $scope.oTurns[sKeyTorn];
			if(oTorn.contingut_filtrat.indexOf("LC")!==-1)
			{
				var sText = oTorn.contingut_filtrat.slice(oTorn.contingut_filtrat.indexOf("LC")+4);
				//console.log(sText+'=>'+$scope.countOf(sText));
				iTotalWords += $scope.countOf(sText)-1;
			}
			else
			if(oTorn.contingut_filtrat.indexOf("IM")!==-1)
			{
				var sText = oTorn.contingut_filtrat.slice(oTorn.contingut_filtrat.indexOf("LC")+4);
				//console.log(sText+'=>'+$scope.countOf(sText));
				iTotalWords += $scope.countOf(sText)-1;
			}
			else
			{
				if(oTorn.end>oTorn.start) iTotalTime += (oTorn.end - oTorn.start);
			}
			
			
		}
		$scope.aStats.total_time = iTotalTime;
		$scope.aStats.total_words = iTotalWords;
	}
	$scope.getTornText = function(iIndexTorn)
	{
		var sKeyTorn = $scope.aTurns[iIndexTorn];
		var oTorn = $scope.oTurns[sKeyTorn];
		//console.log(oTorn);
		return sKeyTorn+':'+oTorn.contingut_filtrat;
	}
	$scope.getTornClass = function(iIndexTorn)
	{
		var sKeyTorn = $scope.aTurns[iIndexTorn];
		var sClass = 'active';		
		if(sKeyTorn.indexOf('a')!==-1) sClass = 'active';	
		else if(sKeyTorn.indexOf('v')!==-1) sClass = 'success';	
		else if(sKeyTorn.indexOf('t')!==-1) sClass = 'warning';	
		console.log(sClass);
		return sClass;
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
				aTornsMacthing = {torns:getTornsMatching(i,j), grups:getGrupsMatching(i,j)};
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
		// convertir en array
		var aConds = [];

		var iIdR = $scope.aRows[iRow].id;
		var iIndexR = $scope.oCodes['c'+iIdR];
		aConds.push(iIndexR);
		for(var i=0;i<$scope.aColumns[jCol].length;i++)
		{
			var iIdC = $scope.aColumns[jCol][i].id;
			var iIndexC = $scope.oCodes['c'+iIdC];
			aConds.push(iIndexC);
		}
		
		var aReturn = [];
		// per cada torn
		for(var i=0;i<$scope.aMatrix.length;i++)
		{
			var oTorn = $scope.aMatrix[i];
			var iSuma = 0;
			for(var j=0;j<aConds.length;j++)
			{
				iSuma+=oTorn[aConds[j]];
			}
			if(iSuma==aConds.length)
			{
				aReturn.push(i);
			}
		}
		return aReturn;
	}
	function getGrupsMatching(iRow,jCol)
	{

		// Agafo els indexs de i, j
		// convertir en array
		var aConds = [];

		var iIdR = $scope.aRows[iRow].id;
		var iIndexR = $scope.oCodes['c'+iIdR];
		aConds.push(iIndexR);
		for(var i=0;i<$scope.aColumns[jCol].length;i++)
		{
			var iIdC = $scope.aColumns[jCol][i].id;
			var iIndexC = $scope.oCodes['c'+iIdC];
			aConds.push(iIndexC);
		}
		
		var aReturn = [];
		// per cada torn
		for(var i=0;i<$scope.aGMatrix.length;i++)
		{
			var oGrup = $scope.aGMatrix[i];
			var iSuma = 0;
			for(var j=0;j<aConds.length;j++)
			{
				if(oGrup[aConds[j]]>=1) iSuma++;
			}
			if(iSuma==aConds.length)
			{
				aReturn.push(i);
			}
		}
		return aReturn;
	}
	$scope.loadMatrix = function()
	{
		 var request = $http({
				method: "post",
				cache:false,
				url: "utils/etl/",
				data: {
					//id: iId
					sessions:$scope.aSessions
				}
			});
		request.success(function(data, status, headers, config) {
			console.log("Carregat");
			$scope.infoMsg = "Codis carregats...";
			$scope.aMatrix = data.aMatrix;
			$scope.aGMatrix = data.aGMatrix;
			$scope.aCodes = data.aCodes.slice();
			$scope.oCodes = data.oCodes;
			$scope.aTurns = data.aTurns;
			$scope.oTurns = data.oTurns;
			$scope.bReady = true;
			console.log($scope.oCodes);
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
		reQuery();
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