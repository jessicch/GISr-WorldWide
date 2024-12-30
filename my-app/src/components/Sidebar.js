import React, { useRef } from 'react';
import './css/Sidebar.css';
import JSZip from 'jszip';
import * as shapefile from 'shapefile';
import proj4 from 'proj4';

// Define the UTM projection (EPSG:25832) and WGS84 (EPSG:4326)
proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +datum=WGS84 +units=m +no_defs");

// Function to transform UTM coordinates to WGS84
const transformCoordinates = (coords) => {
  return coords.map(([x, y]) => {
    const [lng, lat] = proj4('EPSG:25832', 'EPSG:4326', [x, y]); // Transform coordinates
    return [lng, lat]; // Ensure [lng, lat] format for Mapbox
  });
};

// Function to process individual GeoJSON features
const processFeature = (feature) => {
  if (feature.geometry.type === 'Point') {
    feature.geometry.coordinates = transformCoordinates([feature.geometry.coordinates])[0];
  } else if (['LineString', 'MultiPoint'].includes(feature.geometry.type)) {
    feature.geometry.coordinates = transformCoordinates(feature.geometry.coordinates);
  } else if (['Polygon', 'MultiLineString'].includes(feature.geometry.type)) {
    feature.geometry.coordinates = feature.geometry.coordinates.map(transformCoordinates);
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates = feature.geometry.coordinates.map((polygon) =>
      polygon.map(transformCoordinates)
    );
  }
  return feature;
};

const handleShpZipFile = async (zipFile, onGeoJSON) => {
    const zip = new JSZip();
    try {
      const contents = await zip.loadAsync(zipFile);
  
      // Collect all GeoJSON features from multiple shapefiles
      const allFeatures = [];
  
      // Iterate through all files in the ZIP
      for (const filename of Object.keys(contents.files)) {
        if (filename.toLowerCase().endsWith('.shp')) {
          console.log(`Processing shapefile: ${filename}`);
          
          const shpData = await contents.files[filename].async('arraybuffer');
          
          // Read shapefile and extract features
          const source = await shapefile.open(shpData);
  
          let result;
          while (!(result = await source.read()).done) {
            const processedFeature = processFeature(result.value); // Transform coordinates
            allFeatures.push(processedFeature);
          }
        }
      }
  
      // Combine all features into a single GeoJSON FeatureCollection
      const geojson = {
        type: 'FeatureCollection',
        features: allFeatures,
      };
  
      console.log('Generated GeoJSON from multiple shapefiles:', geojson);
  
      onGeoJSON(geojson);
    } catch (error) {
      console.error('Error processing shapefile ZIP:', error);
    }
  };


const Sidebar = ({ onGeoJSON }) => {
  const fileInputRef = useRef(null);

   const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleShpZipFile(file, onGeoJSON); // Process the uploaded ZIP file
    }
  };

  return (
    <aside className="sidebar">
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Contact</li>

        <li onClick={handleButtonClick} className="upload-button">
          Upload Shapefile
        </li>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </ul>
    </aside>
  );
};

export default Sidebar;
