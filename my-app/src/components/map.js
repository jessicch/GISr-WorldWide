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
      zoom: 12,
    });

    map.on('load', () => {
      layers.forEach((layer) => {
        addLayerToMap(map, layer);
        setLayerVisibility(map, layer);
      });

      // Feature Click Extraction
      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: layers.map((layer) => layer.id),
        });

        if (features.length) {
          onFeatureClick(features[0].properties);
        }
      });
    });

    return () => map.remove();
  }, [layers, onFeatureClick]);

  return <div id="map" className="map"></div>;
};

export default Map;