// src/components/Map.js

import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './css/Map.css';
import { addLayerToMap, setLayerVisibility } from './layerHandler';

// Import Mapbox Draw and its CSS
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';


const accessToken = 'pk.eyJ1IjoiamVzc2ljY2giLCJhIjoiY2xlOGd4NWU4MDYzdjNzbzM3aGk5Ymd2ayJ9.7Ol_MM0V_vQPSIABfqcyXQ'

mapboxgl.accessToken = accessToken;

const Map = ({ layers, addLayers }) => {
  const [mapInstance, setMapInstance] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  const [featureToAdd, setFeatureToAdd] = useState(null);

  const drawRef = useRef(null);
  const mapContainerRef = useRef(null); // Ref for the map container

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current, 
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [10.42, 63.42],
      zoom: 12,
    });

    // Set up Mapbox Draw
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        point: true,
        trash: true,
      },
    });

    map.addControl(draw, 'bottom-left');
    drawRef.current = draw;

    map.on('load', () => {
      // Adds all layers
      layers.forEach((layer) => {
        addLayerToMap(map, layer);
        setLayerVisibility(map, layer);
      });

      // Handle draw events
      map.on('draw.create', (e) => {
        const feature = e.features[0];
        setFeatureToAdd(feature);
        setIsModalOpen(true);
      });
    });

    setMapInstance(map);

    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update layers when `layers` or `mapInstance` changes
  useEffect(() => {
    if (!mapInstance) return;

    layers.forEach((layer) => {

      if (!mapInstance.getSource(layer.id)) {
        addLayerToMap(mapInstance, layer);
      }
      setLayerVisibility(mapInstance, layer);

      // Update colors of layers
      if (mapInstance.getLayer(`${layer.id}-fill`)) {
        mapInstance.setPaintProperty(
          `${layer.id}-fill`,
          'fill-color',
          layer.color || '#FF0000'
        );
      }
      if (mapInstance.getLayer(`${layer.id}-point`)) {
        mapInstance.setPaintProperty(
          `${layer.id}-point`,
          'circle-color',
          layer.color || '#FF0000'
        );
      }
      if (mapInstance.getLayer(layer.id)) {
        mapInstance.setPaintProperty(layer.id, 'line-color', layer.color);
      }
    });
  }, [layers, mapInstance]);

  const handleSaveLayer = () => {
    if (!featureToAdd || !newLayerName.trim()) {
      if (drawRef.current) {
        drawRef.current.delete(featureToAdd.id);
      }
      setIsModalOpen(false);
      return;
    }

    const layerId = `layer-${newLayerName.replace(/\s+/g, '_')}-${Date.now()}`;
    const newLayer = {
      id: layerId,
      name: newLayerName,
      geojson: {
        type: 'FeatureCollection',
        features: [featureToAdd],
      },
      visible: true,
      color: '#FF0000', 
    };

    if (addLayers) {
      addLayers([newLayer]);
    }

    setIsModalOpen(false);
    setNewLayerName('');
    setFeatureToAdd(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setNewLayerName('');
    setFeatureToAdd(null);
  };

  return (
    <>
      <div ref={mapContainerRef} className="map" />

      {isModalOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2>Name the new layer</h2>
            <input
              type="text"
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
              placeholder="New Layer"
              style={{ width: '100%', border: 'none' }}
            />
            <div style={{ marginTop: '1em' }}>
              <button
                style={{
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#5a6c4b',
                }}
                onClick={handleSaveLayer}
              >
                Save
              </button>
              <button
                style={{
                  marginLeft: '1em',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#5a6c4b',
                }}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Inline styles for the modal
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modalStyle = {
  background: '#ced4c2',
  padding: '1rem',
  borderRadius: '4px',
  maxWidth: '400px',
  width: '90%',
};

export default Map;
