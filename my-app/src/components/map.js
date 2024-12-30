import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect } from 'react';
import './css/Map.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiamVzc2ljY2giLCJhIjoiY2xlOGd4NWU4MDYzdjNzbzM3aGk5Ymd2ayJ9.7Ol_MM0V_vQPSIABfqcyXQ';

const Map = ({ geojson }) => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [10.4, 63.4],
      zoom: 12,
    });

    if (geojson) {
      map.on('load', () => {
        geojson.features.forEach((feature, index) => {
          const sourceId = `uploaded-data-${index}`;
          const layerId = `uploaded-layer-${index}`;
          const geometryType = feature.geometry.type;
      
          // Generates a random color for each feature
          const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Random HEX color
      
          // Adds a source for the feature
          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [feature],
            },
          });
      
          if (geometryType === 'Point' || geometryType === 'MultiPoint') {
            // Adds a circle layer for points
            map.addLayer({
              id: layerId,
              type: 'circle',
              source: sourceId,
              paint: {
                'circle-radius': 5,
                'circle-color': randomColor, // Use random color
              },
            });
          } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            // Adds a line layer for polylines
            map.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-width': 2,
                'line-color': randomColor, // Use random color
              },
            });
          } else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
            // Adds a fill layer for polygons
            map.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': randomColor, // Use random color
                'fill-opacity': 0.5,
              },
            });
          } else {
            console.warn(`Unsupported geometry type: ${geometryType}`);
          }
        });
        
       // CHATGPT : 
       try {
        const bounds = geojson.features.reduce((bounds, feature) => {
          const coords = feature.geometry.coordinates.flat(Infinity); // Flatten nested coordinates
          coords.forEach((coord) => {
            if (Array.isArray(coord) && coord.length === 2) {
              bounds.extend(coord); 
            }
          });
          return bounds;
        }, new mapboxgl.LngLatBounds());

        map.fitBounds(bounds, { padding: 20 });
      } catch (error) {
        console.error('Error calculating bounds:', error);
      }
    });
  }

    return () => map.remove();
  }, [geojson]);

  return <div id="map" className="map"></div>;
};

export default Map;