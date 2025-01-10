// Used for uploading all files to the map! and converting to layers.
import JSZip from 'jszip';
import * as shapefile from 'shapefile';
import proj4 from 'proj4';
import wkt from 'wkt-parser'; // For future implementation of data for other projections, but was har to make work in this one. 

// Define the WGS84 (EPSG:4326) projection
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +datum=WGS84 +units=m +no_defs");


// Transforms UTM coordinates to WGS84
const transformCoordinates = (coords, sourceCRS) => {
return coords.map(([x, y]) => {
    const [lng, lat] = proj4(sourceCRS, "EPSG:4326", [x, y]); // Transforms coordinates
    return [lng, lat]; 
});
};

// Process each individual feature in each layer! Each file is its own layer.
const processFeature = (feature, sourceCRS) => {
if (feature.geometry.type === 'Point') {
    feature.geometry.coordinates = transformCoordinates([feature.geometry.coordinates], sourceCRS)[0];
} else if (['LineString', 'MultiPoint'].includes(feature.geometry.type)) {
    feature.geometry.coordinates = transformCoordinates(feature.geometry.coordinates, sourceCRS);
} else if (['Polygon', 'MultiLineString'].includes(feature.geometry.type)) {
    feature.geometry.coordinates = feature.geometry.coordinates.map((ring) =>
    transformCoordinates(ring, sourceCRS)
    );
} else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates = feature.geometry.coordinates.map((polygon) =>
    polygon.map((ring) => transformCoordinates(ring, sourceCRS))
    );
}
return feature;
};

// Takes in shapefiles in zipfiles and creates layers that can be loaded onto map by LayerHandler.
export const handleShpZipFile = async (zipFile) => {
const zip = new JSZip();
try {
    const contents = await zip.loadAsync(zipFile);
    const allLayers = [];

    for (const filename of Object.keys(contents.files)) {
    if (filename.toLowerCase().endsWith('.shp')) {
        console.log(`Processing shapefile: ${filename}`);
        
        // Extract the base name without extensions
        const baseName = filename.replace(/\.[^/.]+$/, '');

        // Ensures that all files (.dbf and optionally .prj) are present
        const dbfFile = contents.file(`${baseName}.dbf`);
        const prjFile = contents.file(`${baseName}.prj`); // Used for the later implementation, not used yet. 

        if (!dbfFile) {
        console.warn(`Missing .dbf file for shapefile: ${baseName}`);
        continue; // Skip this shapefile if .dbf is missing
        }

        // Detect CRS from the .prj file. NOT USED YET, For future impl. Now defaults to EPSG25832. 
        let sourceCRS = "EPSG:25832"; // Default to WGS84 if .prj is missing
        if (prjFile) {
        const prjText = await prjFile.async('string');
        console.log(prjText)
        try {
            const parsedCRS = wkt.parse(prjText);
            console.log(parsedCRS)
            //const crsProj4 = proj4.defs(parsedCRS.name, prjText); // Commented out bcs not implemented. 
            console.log(`Detected CRS for ${baseName}:`, parsedCRS.name);
            sourceCRS = parsedCRS.name;
        } catch (error) {
            console.warn(`Failed to parse .prj file for ${baseName}. Defaulting to EUREF zone 32.`, error);
        }
        } else {
        console.warn(`No .prj file found for shapefile: ${baseName}. Defaulting to WGS84.`);
        }

        // Reads shapefile data ( from shp and dbf files.)
        const shpData = await contents.files[filename].async('arraybuffer');
        const dbfData = await dbfFile.async('arraybuffer');
        const source = await shapefile.open(shpData, dbfData, { encoding: 'utf-8' });

        const features = [];
        let result;
        while (!(result = await source.read()).done) {
        const processedFeature = processFeature(result.value, sourceCRS); // Transform coordinates
        features.push(processedFeature);
        }

        // Combines all features into a single GeoJSON FeatureCollection, for the layerobject.
        const geojson = {
        type: 'FeatureCollection',
        features: features,
        };

        // Creates a layer object
        const layer = {
        id: `layer-${baseName}-${Date.now()}`, // Uses a unique ID so layers with same name arent a problem. 
        name: baseName,
        geojson: geojson,
        visible: true, 
        };

        allLayers.push(layer);
        console.log(allLayers)
    }
    }

    if (allLayers.length === 0) {
    throw new Error('No valid shapefiles found in the ZIP.');
    }

    console.log('Generated Layers from Shapefiles:', allLayers);
    return allLayers;
} catch (error) {
    console.error('Error processing shapefile ZIP:', error);
    throw error;
}
};
