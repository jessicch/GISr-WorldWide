import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useState, useRef } from 'react';
import './css/Map.css';
import { addLayerToMap, setLayerVisibility } from './layerHandler';

// Import Mapbox Draw and its CSS
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiamVzc2ljY2giLCJhIjoiY2xlOGd4NWU4MDYzdjNzbzM3aGk5Ymd2ayJ9.7Ol_MM0V_vQPSIABfqcyXQ';

const Map = ({ layers, addLayers }) => {
  const [mapInstance, setMapInstance] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  const [featureToAdd, setFeatureToAdd] = useState(null);

  const drawRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [10.42, 63.42],
      zoom: 12,
    });

    // Set up for drawing on the map
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

      // drawing
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

  // Whenever layers change, update the map with any new layers, visibility, or colors
  useEffect(() => {
    if (!mapInstance) return;

    layers.forEach((layer) => {
      // If layer is new to the map
      if (!mapInstance.getSource(layer.id)) {
        addLayerToMap(mapInstance, layer);
      }
      setLayerVisibility(mapInstance, layer);

      // Update colors of layers!!
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
      <div id="map" className="map" />

      {isModalOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2>Name the new layer</h2>
            <input
              type="text"
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
              placeholder="New Layer"
              style={{ width: '100%' , border: "None"}}
            />
            <div style={{ marginTop: '1em' }}>
              <button style = {{ color: "white", border: "None", borderRadius: "4px", backgroundColor: "#5a6c4b"}}onClick={handleSaveLayer}>Save</button>
              <button style = {{marginLeft: '1em', color: "white", border: "None", borderRadius: "4px", backgroundColor: "#5a6c4b" }} onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Inline styles for the modal, CSS was strange.
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
