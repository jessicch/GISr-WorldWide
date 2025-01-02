import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect } from 'react';
import './css/Map.css';
import { addLayerToMap, setLayerVisibility } from './layerToggling';


mapboxgl.accessToken = 'pk.eyJ1IjoiamVzc2ljY2giLCJhIjoiY2xlOGd4NWU4MDYzdjNzbzM3aGk5Ymd2ayJ9.7Ol_MM0V_vQPSIABfqcyXQ';

const Map = ({ layers, onFeatureClick }) => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [10.4, 63.4],
      zoom: 11,
    });

    map.on('load', () => {

      const allLayerIds = [];
    
      layers.forEach((layer) => {
        addLayerToMap(map, layer);
        setLayerVisibility(map, layer);

        allLayerIds.push(`${layer.id}-fill`);
        allLayerIds.push(`${layer.id}-border`);
      });

      

      // Feature Click Extraction
      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: allLayerIds, 
        });
        
        // CHATGPT
        if (features.length) {
          const feature = features[0]; // Get the first feature
          const popupContent = Object.entries(feature.properties)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
    
          // Show popup at the clicked location
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<div style="max-width: 300px;">${popupContent}</div>`)
            .addTo(map);
        }
      });
    });

    return () => map.remove();
  }, [layers, onFeatureClick]);

  return <div id="map" className="map"></div>;
};

export default Map;