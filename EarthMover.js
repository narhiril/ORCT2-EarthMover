//A really basic script that can load/save map terrain data to copy across maps.  Maps must be identical in size.

const verbose = true;
const version = 0.4;

var BaseHeightData = new Array();
var SlopeData = new Array();
var SurfaceStyleData = new Array();
var EdgeStyleData = new Array();
var WaterHeightData = new Array();

var terrainArraySetup = function()
{
	BaseHeightData = new Array();
	SlopeData = new Array();
	SurfaceStyleData = new Array();
	EdgeStyleData = new Array();
	WaterHeightData = new Array();
}

var initializeEarthMover = function()
{
	var mapSizeX = context.sharedStorage.get('narhiril.EarthMover.MapSizeX');
	if (!mapSizeX)
	{
		context.sharedStorage.set('narhiril.EarthMover.MapSizeX', 0);
	}
	var mapSizeY = context.sharedStorage.get('narhiril.EarthMover.MapSizeY');
	if (!mapSizeY)
	{
		context.sharedStorage.set('narhiril.EarthMover.MapSizeY', 0);
	}
	console.log("EarthMover: Plugin initialized");
}


var loadMapTerrainData = function()
{
	//check map dimensions for saved data
	var x = context.sharedStorage.get('narhiril.EarthMover.MapSizeX');
	var y = context.sharedStorage.get('narhiril.EarthMover.MapSizeY');
	if (y == 0 || x == 0)
	{
		console.log("EarthMover: Error, no saved terrain data!  Aborting load operation...");
		return;
	}
	if (map.size.x-2 != x || map.size.y-2 != y)
	{
		console.log("EarthMover: Error, mismatch in current map size and size of saved terrain data.");
		console.log("EarthMover: The saved terrain data is " + (x) + " tiles by " + (y) + " tiles.");
		console.log("EarthMover: Aborting load operation...");
		return;
	}
	//var numTiles = (map.size.x-2)*(map.size.y-2); //deprecated
	
	//load the rest of the saved data
    	try
	{	
		BaseHeightData = JSON.parse(context.sharedStorage.get('narhiril.EarthMover.BaseHeightData'));
		SlopeData = JSON.parse(context.sharedStorage.get('narhiril.EarthMover.SlopeData'));
		SurfaceStyleData = JSON.parse(context.sharedStorage.get('narhiril.EarthMover.SurfaceStyleData'));
		EdgeStyleData = JSON.parse(context.sharedStorage.get('narhiril.EarthMover.EdgeStyleData'));
		WaterHeightData = JSON.parse(context.sharedStorage.get('narhiril.EarthMover.WaterHeightData'));
	}
	catch(err)
	{
		console.log("EarthMover: Welp, something broke!  Couldn't load saved terrain data.");
		console.log("EarthMover: Aborting load operation...");
		return;
	}
	
	//loop through every tile
	var index = 0;
	for (var i = 0; i < (map.size.x-2); i++)
	{
		for (var j = 0; j < (map.size.y-2); j++)
		{
			var t = map.getTile(i+1, j+1);
			for (var n = 0; n < t.numElements; n++)
			{
				var element = t.getElement(n);
				if (element.type == 'surface')
				{
					//replace with loaded surface properties
					try
					{
						element.baseHeight = BaseHeightData[index];
						element.slope = SlopeData[index];
						element.surfaceStyle = SurfaceStyleData[index];
						element.edgeStyle = EdgeStyleData[index];
						element.waterHeight = WaterHeightData[index];
						index++;
					}
					catch(err)
					{
						console.log("EarthMover: Error when applying saved terrain data to current map.");
						console.log("EarthMover: Aborting load operation...");
						return;
					}
				}
			}
		}
	}
	console.log('EarthMover: Terrain data applied successfully!');
	try
	{
		park.postMessage('EarthMover: Terrain successfully loaded!');
	}
	catch(err)
	{
		if (verbose)
		{
			console.log('EarthMover: Error writing load success park message');
		}
	}
}

var saveMapTerrainData = function()
{
	terrainArraySetup();
	
	//loop through every tile and record data for surface elements
	for (var i = 0; i < (map.size.x-2); i++)
	{
		for (var j = 0; j < (map.size.y-2); j++)
		{
			var t = map.getTile(i+1, j+1);
			for (var n = 0; n < t.numElements; n++)
			{
				var element = t.getElement(n);
				if (element.type == 'surface')
				{
					BaseHeightData.push(element.baseHeight);
					SlopeData.push(element.slope);
					SurfaceStyleData.push(element.surfaceStyle);
					EdgeStyleData.push(element.edgeStyle);
					WaterHeightData.push(element.waterHeight);
				}
			}
		}
	}
	
	try
	{
		context.sharedStorage.set('narhiril.EarthMover.MapSizeX', map.size.x-2);
		context.sharedStorage.set('narhiril.EarthMover.MapSizeY', map.size.y-2);
		context.sharedStorage.set('narhiril.EarthMover.BaseHeightData', JSON.stringify(BaseHeightData));
		context.sharedStorage.set('narhiril.EarthMover.SlopeData', JSON.stringify(SlopeData));
		context.sharedStorage.set('narhiril.EarthMover.SurfaceStyleData', JSON.stringify(SurfaceStyleData));
		context.sharedStorage.set('narhiril.EarthMover.EdgeStyleData', JSON.stringify(EdgeStyleData));
		context.sharedStorage.set('narhiril.EarthMover.WaterHeightData', JSON.stringify(WaterHeightData));
		console.log('EarthMover: Terrain data saved!');
		try
		{
			park.postMessage('EarthMover: Terrain successfully saved!');
		}
		catch(err)
		{
			if (verbose)
			{
			console.log('EarthMover: Error writing save success park message');
			}
		}
		}
	catch(err)
	{
		console.log('EarthMover: Error writing save data');
	}
} 


var clearMapTerrainData = function()
{
	context.sharedStorage.set('narhiril.EarthMover.MapSizeX', 0);
	context.sharedStorage.set('narhiril.EarthMover.MapSizeY', 0);
	context.sharedStorage.set('narhiril.EarthMover.BaseHeightData', 0);
	context.sharedStorage.set('narhiril.EarthMover.SlopeData', 0);
	context.sharedStorage.set('narhiril.EarthMover.SurfaceStyleData', 0);
	context.sharedStorage.set('narhiril.EarthMover.EdgeStyleData', 0);
	context.sharedStorage.set('narhiril.EarthMover.WaterHeightData', 0);
	console.log('EarthMover: Saved data cleared!');
	if (verbose)
	{
		try
		{
			park.postMessage('EarthMover: Cleared saved terrain data!');
		}
		catch(err)
		{
			console.log('EarthMover: Error writing clear data success park message');
		}
		
	}
}


const earthMoverWindow = function()
{
	const window = ui.getWindow('EarthMover');
	if (window)
	{
		window.bringToFront();
		return;
	}
	try
	{
		ui.openWindow(
		{
		classification: 'EarthMover',
		width: 410,
		height: 80,
		title: 'EarthMover',
		widgets: [
		{
			type: 'button',
			x: 10,
			y: 20,
			height: 40,
			width: 120,
			text: 'Copy This Terrain',
			isPressed: false,
			onClick: saveMapTerrainData
		},
		{
			type: 'button',
			x: 140,
			y: 20,
			height: 40,
			width: 120,
			text: 'Paste Stored Terrain',
			isPressed: false,
			onClick: loadMapTerrainData
		},
		{
			type: 'button',
			x: 280,
			y: 20,
			height: 40,
			width: 120,
			text: 'Clear Stored Data',
			isPressed: false,
			onClick: clearMapTerrainData
		}
		]
		})
	}
	catch(err)
	{
		console.log('EarthMover: Error opening interface window');
	}
}

var main = function()
{
	initializeEarthMover();
	ui.registerMenuItem("EarthMover", function()
	{
		earthMoverWindow();
	});
}

registerPlugin
({
    name: 'EarthMover',
	version: JSON.stringify(version),
    authors: ['narhiril'],
    type: 'local',
    licence: 'MIT',
    targetApiVersion: 34,
    main: main
});
