// src/App.js

import './App.css';
import Header from './components/Header.js';
import Map from './components/map.js';
import Sidebar from './components/Sidebar.js';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';


const App = () => {
  const [layers, setLayers] = useState([]); // Array of layer objects

  // Handler to add new layers
  const addLayers = (newLayers) => {
    setLayers((prevLayers) => {
      if (Array.isArray(newLayers)) {
        return [...prevLayers, ...newLayers];
      } else {
        // If newLayers is just one object
        return [...prevLayers, newLayers];
      }
    });
  };
  

  // Handler to toggle layer visibility
  const toggleLayerVisibility = (layerId) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const updateLayerColor = (layerId, newColor) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, color: newColor } : layer
      )
    );
  };

  const renameLayer = (layerId, newName) => {
    if (newName){
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, name: newName } : layer
      )
    )};
  };

  


  return (
    <div className="layout">
      <Header />
      <div className="content">
        <Sidebar layers={layers} addLayers={addLayers} toggleLayerVisibility={toggleLayerVisibility} updateLayerColor={updateLayerColor} renameLayer={renameLayer} />
        <Map layers={layers} addLayers={addLayers} updateLayerColor={updateLayerColor} />
      </div>
    </div>
  );
};

export default App;
