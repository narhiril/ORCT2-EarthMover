// <reference path="C:\Users\Velvet\Documents\OpenRCT2\bin\openrct2.d.ts" />

//EarthMover by narhiril
//a script for saving/loading terrain data between maps of identical size
const earthMoverVersion: number = 0.7;
const verbose = true;

let makeSurfaceTileDataObject = function(element: SurfaceElement, xCoord: number, yCoord: number): object {
    const tileData: object = {
        x: xCoord,
        y: yCoord
    }
    const savedKeys: string[] = [
        //"type",
        "baseHeight",
        "baseZ",
        "clearanceHeight",
        "clearanceZ",
        //"occupiedQuadrants",
        "isGhost",
        "isHidden",
        "slope",
        "surfaceStyle",
        "edgeStyle",
        "waterHeight",
        //"ownership",
        //"parkFences",
        //"hasOwnership",
        //"hasConstructionRights",
        "grassLength"
    ];
    for (const key of savedKeys) {
        tileData[key] = element[key];
    }
    return tileData;
}

let initializeEarthMover = function() {
    if (context.sharedStorage.get('narhiril.EarthMover.Version') !== earthMoverVersion) {
        clearDeprecated();
    }
	if (!context.sharedStorage.has('narhiril.EarthMover.MapSizeX'))
	{
		context.sharedStorage.set('narhiril.EarthMover.MapSizeX', 0);
	}
	if (!context.sharedStorage.has('narhiril.EarthMover.MapSizeY'))
	{
		context.sharedStorage.set('narhiril.EarthMover.MapSizeY', 0);
	}
	if (verbose)
	{
		console.log("EarthMover: Plugin initialized!");
	}
}


let loadMapTerrainData = function() {
    //check if we even have save data
	let x = context.sharedStorage.get('narhiril.EarthMover.MapSizeX');
	let y = context.sharedStorage.get('narhiril.EarthMover.MapSizeY');
    if (x === 0 || y === 0) {
		console.log("EarthMover: Error, no saved terrain data!  Aborting load operation...");
		try
		{
			park.postMessage('EarthMover: No saved terrain data!');
		}
		catch(err)
		{
		if (verbose)
			{
			console.log('EarthMover: Error when writing a park message about an error caused by no saved data.   Not an error message I am all that proud of, honestly.');
			}
		}
		return;
    } 
    //check if our save data can be applied to this map
    else if (map.size.x-2 !== x || map.size.y-2 !== y) {
		console.log("EarthMover: Error, mismatch in current map size and size of saved terrain data.");
		console.log("EarthMover: The saved terrain data is " + (x) + " tiles by " + (y) + " tiles.");
		console.log("EarthMover: Aborting load operation...");
		try
		{
			park.postMessage('EarthMover: Map size needs to match that of saved data.  Saved terrain data is ' + (x) + ' by ' + (y) + '.');
		}
		catch(err)
		{
		if (verbose)
			{
			console.log('EarthMover: Error when writing a park message about a load error.  Ironic.');
			}
		}
		return;
    }
    //actually load the save data
    try 
    {
        const rawSaveData: string | undefined = context.sharedStorage.get('narhiril.EarthMover.MapData');
        let surfaceTileArray: object[];
        if (typeof rawSaveData !== "undefined") {
            surfaceTileArray = JSON.parse(rawSaveData);
            if (verbose) {
                console.log("EarthMover: Saved terrain data found, loading...");
            }
            //danger zone
            removeExistingSurfaceElements();
            for (const tileData of surfaceTileArray) {
                //these coords are already corrected
                const tile = map.getTile(tileData[x], tileData[y]);
                const newSurface = <SurfaceElement>tile.insertElement(0);
                for (const field in tileData) {
                    if (field !== "x" && field !== "y") {
                        newSurface[field] = tileData[field];
                    }
                }
            }
        } 
        else {
            throw Error("EarthMover: Attempted to load save data that doesn't exist");
        }

    }
    catch(err) {
		console.log(err.message);
		console.log("EarthMover: Aborting load operation...");
		return;
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
			console.log('EarthMover: Error writing terrain load success park message');
		}
	}

}

let removeExistingSurfaceElements = function() {
    //loop through all map tiles
	for (let k = 0; k < (map.size.x-2); k++)
	{
		for (let l = 0; l < (map.size.y-2); l++)
		{
			const currentTile = map.getTile(k+1, l+1);
            for (let m = 0; m < currentTile.numElements; m++)
            {
                const tElement = currentTile.getElement(m);
                if (tElement.type === 'surface') {
                    currentTile.removeElement(m);
                }
            }
        }
    }
}

let saveMapTerrainData = function() {
    let mapSaveData: object[] = [];
    context.sharedStorage.set('narhiril.EarthMover.MapSizeX', map.size.x-2);
    context.sharedStorage.set('narhiril.EarthMover.MapSizeY', map.size.y-2);

	//loop through every tile and record data for surface elements
	for (let i = 0; i < (map.size.x-2); i++)
	{
		for (let j = 0; j < (map.size.y-2); j++)
		{
			const tile = map.getTile(i+1, j+1);
			for (let n = 0; n < tile.numElements; n++)
			{
				const element = tile.getElement(n);
				if (element.type === 'surface')
				{
                    mapSaveData.push(makeSurfaceTileDataObject(element, i+1, j+1));
				}
			}
		}
	}
    context.sharedStorage.set('narhiril.EarthMover.MapData', JSON.stringify(mapSaveData));
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

let clearMapTerrainData = function() {
    context.sharedStorage.set('narhiril.EarthMover.MapSizeX', 0);
    context.sharedStorage.set('narhiril.EarthMover.MapSizeY', 0);
    context.sharedStorage.set('narhiril.EarthMover.MapData', undefined);

	console.log('EarthMover: Saved data cleared!');
		try
		{
			park.postMessage('EarthMover: Cleared saved terrain data!');
		}
		catch(err)
		{
			if (verbose)
			{
			console.log('EarthMover: Error writing clear data success park message');
			}
		}
}

let clearDeprecated = function() {
	try
	{	
        const oldDataKeys: string[] = [
            'narhiril.EarthMover.BaseHeightData',
            'narhiril.EarthMover.SlopeData',
            'narhiril.EarthMover.SurfaceStyleData',
            'narhiril.EarthMover.EdgeStyleData',
            'narhiril.EarthMover.WaterHeightData',
            'narhiril.EarthMover.BaseZData',
            'narhiril.EarthMover.ClearanceHeightData',
            'narhiril.EarthMover.ClearanceZData'
        ];

        for (const key of oldDataKeys) {
            if (typeof context.sharedStorage.get(key) === "string") {
                context.sharedStorage.set(key, undefined);
            }
        }
        context.sharedStorage.set('narhiril.EarthMover.Version', earthMoverVersion);
	}
	catch(err)
	{
		console.log("EarthMover: Encountered an error when attempting to clear deprecated data keys.  This is a bug, please report it!");
	}
}

let earthMoverWindow = function() {

    if (typeof ui === 'undefined') {
        return;
    }

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
			onClick: () => saveMapTerrainData()
		},
		{
			type: 'button',
			x: 140,
			y: 20,
			height: 40,
			width: 120,
			text: 'Paste Stored Terrain',
			isPressed: false,
			onClick: () => loadMapTerrainData()
		},
		{
			type: 'button',
			x: 280,
			y: 20,
			height: 40,
			width: 120,
			text: 'Clear Stored Terrain',
			isPressed: false,
			onClick: () => {
                clearDeprecated();
                clearMapTerrainData();
            }
		}
		]
		})
	}
	catch(err)
	{
		console.log('EarthMover: Error opening UI window');
	}
}

let main = function() {
	initializeEarthMover();
	ui.registerMenuItem("EarthMover", () => earthMoverWindow());
}

registerPlugin
({
    name: 'EarthMover',
    version: JSON.stringify(earthMoverVersion),
    authors: ['narhiril'],
    type: 'local',
    licence: 'MIT',
    targetApiVersion: 34,
    main: main
});