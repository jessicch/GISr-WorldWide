import JSZip from 'jszip';
import * as shapefile from 'shapefile';
import proj4 from 'proj4';
import wkt from 'wkt-parser'; // Library to parse WKT from .prj files

// Define the WGS84 (EPSG:4326) projection
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +datum=WGS84 +units=m +no_defs");


// Function to transform UTM coordinates to WGS84
const transformCoordinates = (coords, sourceCRS) => {
  return coords.map(([x, y]) => {
    const [lng, lat] = proj4(sourceCRS, "EPSG:4326", [x, y]); // Transform coordinates
    return [lng, lat]; // Ensure [lng, lat] format for Mapbox
  });
};

// Function to process individual GeoJSON features
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

// Function to handle Shapefile ZIP upload
export const handleShpZipFile = async (zipFile) => {
  const zip = new JSZip();
  try {
    const contents = await zip.loadAsync(zipFile);
    const allLayers = [];

    for (const filename of Object.keys(contents.files)) {
      if (filename.toLowerCase().endsWith('.shp')) {
        console.log(`Processing shapefile: ${filename}`);
        
        // Extract the base name without extension
        const baseName = filename.replace(/\.[^/.]+$/, '');

        // Ensure accompanying files (.dbf, .shx, and optionally .prj) are present
        const dbfFile = contents.file(`${baseName}.dbf`);
        const prjFile = contents.file(`${baseName}.prj`);

        if (!dbfFile) {
          console.warn(`Missing .dbf file for shapefile: ${baseName}`);
          continue; // Skip this shapefile if .dbf is missing
        }

        // Detect CRS from the .prj file
        let sourceCRS = "EPSG:25832"; // Default to WGS84 if .prj is missing
        if (prjFile) {
          const prjText = await prjFile.async('string');
          console.log(prjText)
          try {
            const parsedCRS = wkt.parse(prjText);
            console.log(parsedCRS)
            //const crsProj4 = proj4.defs(parsedCRS.name, prjText);
            console.log(`Detected CRS for ${baseName}:`, parsedCRS.name);
            sourceCRS = parsedCRS.name;
          } catch (error) {
            console.warn(`Failed to parse .prj file for ${baseName}. Defaulting to EUREF zone 32.`, error);
          }
        } else {
          console.warn(`No .prj file found for shapefile: ${baseName}. Defaulting to WGS84.`);
        }

        // Read shapefile data
        const shpData = await contents.files[filename].async('arraybuffer');
        const dbfData = await dbfFile.async('arraybuffer');
        const source = await shapefile.open(shpData, dbfData, { encoding: 'utf-8' });

        const features = [];
        let result;
        while (!(result = await source.read()).done) {
          const processedFeature = processFeature(result.value, sourceCRS); // Transform coordinates
          features.push(processedFeature);
        }

        // Combine all features into a single GeoJSON FeatureCollection
        const geojson = {
          type: 'FeatureCollection',
          features: features,
        };

        // Create a layer object
        const layer = {
          id: `layer-${baseName}-${Date.now()}`, // Ensure unique ID
          name: baseName,
          geojson: geojson,
          visible: true, // Default visibility
        };

        allLayers.push(layer);
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
