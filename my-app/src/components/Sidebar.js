import React, { useRef, useState } from 'react';
import './css/Sidebar.css';
import { handleShpZipFile } from './fileUpload';
import { createBufferLayer } from './buffer';
import { createIntersectionLayer } from './intersect';
import { dissolveLayer } from './dissolve';
import { computeDifference } from './difference';

const Sidebar = ({ layers, addLayers, toggleLayerVisibility}) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  
  // For Buffer
  const [showBufferOptions, setShowBufferOptions] = useState(false); // Toggle for buffer options
  const [bufferDistance, setBufferDistance] = useState('');
  const [outputLayerName, setOutputLayerName] = useState('');
  const [selectedLayerId, setSelectedLayerId] = useState('');

  // For Intersection
  const [showIntersectionOptions, setShowIntersectionOptions] = useState(false);
  const [selectedLayerId1, setSelectedLayerId1] = useState('');
  const [selectedLayerId2, setSelectedLayerId2] = useState('');
  const [intersectionOutputName, setIntersectionOutputName] = useState('');

  // For Dissolve
  const [showDissolveOptions, setShowDissolveOptions] = useState(false);

  // For Difference
  const [showDifferenceOptions, setShowDifferenceOptions] = useState(false);
  const [baseLayerId, setBaseLayerId] = useState('');
  const [subtractLayerId, setSubtractLayerId] = useState('');



  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith('.zip')) {
        setError('Unsupported file type. Please upload a ZIP file containing shapefiles.');
        return;
      }

      try {
        const newLayers = await handleShpZipFile(file);
        addLayers(newLayers);
        setError(null); 
      } catch (error) {
        setError(error.message || 'Failed to process the ZIP file.');
      }
    }
  };

  const handleBufferSubmit = () => {
    if (!selectedLayerId || !bufferDistance || !outputLayerName) {
      setError('All fields are required for creating a buffer.');
      return;
    }
  
    const newLayer = createBufferLayer(layers, selectedLayerId, parseFloat(bufferDistance), outputLayerName);
    if (newLayer) {
      addLayers([newLayer]);
    }
    setShowBufferOptions(false);
    setBufferDistance('');
    setOutputLayerName('');
    setSelectedLayerId('');
  };

  const handleIntersectionSubmit = () => {
    if (!selectedLayerId1 || !selectedLayerId2 || !intersectionOutputName) {
      setError('All fields are required for creating an intersection.');
      return;
    }
    if (selectedLayerId1 === selectedLayerId2) {
      setError('Choose two different layers for the intersection.');
      return;
    }

    const newIntersectionLayer = createIntersectionLayer(
      layers,
      selectedLayerId1,
      selectedLayerId2,
      intersectionOutputName
    );

    if (newIntersectionLayer) {
      addLayers([newIntersectionLayer]); // pass as array
    }
    setShowIntersectionOptions(false);
    setSelectedLayerId1('');
    setSelectedLayerId2('');
    setIntersectionOutputName('');
  };

  const handleDissolveSubmit = () => {
    if (!selectedLayerId || !outputLayerName) {
      setError('All fields are required for dissolving.');
      return;
    }
  
    // Call the dissolve function
    const dissolvedLayer = dissolveLayer(
      layers,
      selectedLayerId,
      outputLayerName
    );
  
    if (dissolvedLayer) {
      addLayers([dissolvedLayer]);
      setShowDissolveOptions(false);
      setSelectedLayerId('');
      setOutputLayerName('');
    } else {
      setError('Failed to dissolve features.');
    }
  };

  const handleDifferenceSubmit = () => {
    if (!baseLayerId || !subtractLayerId || !outputLayerName) {
      setError('All fields are required for difference.');
      return;
    }
  
    const differenceLayer = computeDifference(
      layers,
      baseLayerId,
      subtractLayerId,
      outputLayerName
    );
  
    if (differenceLayer) {
      addLayers([differenceLayer]);
      setShowDifferenceOptions(false);
      setBaseLayerId('');
      setSubtractLayerId('');
      setOutputLayerName('');
    } else {
      setError('Failed to compute difference.');
    }
  };
  

  return (
    <aside className="sidebar">
      <ul>

        <li onClick={handleButtonClick} className="upload-button">
          Upload Shapefile ZIP
        </li>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".zip"
        />

        <li onClick={() => setShowBufferOptions(!showBufferOptions)}>
          Create Buffer
        </li>

        <li onClick={() => setShowIntersectionOptions(!showIntersectionOptions)}>
          Create Intersection
        </li>

        <li onClick={() => setShowDissolveOptions(!showDissolveOptions)}>
            Dissolve Features
        </li>

        <li onClick={() => setShowDifferenceOptions(!showDifferenceOptions)}>
            Difference
        </li>


      </ul>

      {showBufferOptions && (
        <div className="buffer-options">
          <h3>Buffer Options</h3>
          <label>
            Select Layer:
            <select
              value={selectedLayerId}
              onChange={(e) => setSelectedLayerId(e.target.value)}
            >
              <option value="">Select a layer</option>
              {layers.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Buffer Distance (meters):
            <input
              type="number"
              value={bufferDistance}
              onChange={(e) => setBufferDistance(e.target.value)}
            />
          </label>
          <label>
            Output Layer Name:
            <input
              type="text"
              value={outputLayerName}
              onChange={(e) => setOutputLayerName(e.target.value)}
            />
          </label>
          <button onClick={handleBufferSubmit}>Create Buffer</button>
        </div>
      )}

{showIntersectionOptions && (
        <div className="intersection-options">
          <h3>Intersection Options</h3>
          <label>
            Select First Layer:
            <select
              value={selectedLayerId1}
              onChange={(e) => setSelectedLayerId1(e.target.value)}
            >
              <option value="">Select a layer</option>
              {layers.map((layer) => (
                <option value={layer.id} key={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Select Second Layer:
            <select
              value={selectedLayerId2}
              onChange={(e) => setSelectedLayerId2(e.target.value)}
            >
              <option value="">Select a layer</option>
              {layers.map((layer) => (
                <option value={layer.id} key={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Output Layer Name:
            <input
              type="text"
              value={intersectionOutputName}
              onChange={(e) => setIntersectionOutputName(e.target.value)}
            />
          </label>
          <button onClick={handleIntersectionSubmit}>Create Intersection</button>
        </div>
      )}

{showDissolveOptions && (
  <div className="dissolve-options">
    <h3>Dissolve Options</h3>
    <label>
      Select Layer:
      <select
        value={selectedLayerId}
        onChange={(e) => setSelectedLayerId(e.target.value)}
      >
        <option value="">Select a layer</option>
        {layers.map((layer) => (
          <option key={layer.id} value={layer.id}>
            {layer.name}
          </option>
        ))}
      </select>
    </label>
    <label>
      Output Layer Name:
      <input
        type="text"
        value={outputLayerName}
        onChange={(e) => setOutputLayerName(e.target.value)}
      />
    </label>
    <button onClick={handleDissolveSubmit}>Dissolve</button>
  </div>
)}

{showDifferenceOptions && (
  <div className="difference-options">
    <h3>Difference Options</h3>
    <label>
      Layer to Subtract From (Base Layer):
      <select
        value={baseLayerId}
        onChange={(e) => setBaseLayerId(e.target.value)}
      >
        <option value="">Select a layer</option>
        {layers.map((layer) => (
          <option key={layer.id} value={layer.id}>
            {layer.name}
          </option>
        ))}
      </select>
    </label>
    <label>
      Layer to Subtract (Subtracting Layer):
      <select
        value={subtractLayerId}
        onChange={(e) => setSubtractLayerId(e.target.value)}
      >
        <option value="">Select a layer</option>
        {layers.map((layer) => (
          <option key={layer.id} value={layer.id}>
            {layer.name}
          </option>
        ))}
      </select>
    </label>
    <label>
      Output Layer Name:
      <input
        type="text"
        value={outputLayerName}
        onChange={(e) => setOutputLayerName(e.target.value)}
      />
    </label>
    <button onClick={handleDifferenceSubmit}>Compute Difference</button>
  </div>
)}

      <div className="layers-list">
        <h3>Layers</h3>
        {layers.length === 0 && <p>No layers uploaded.</p>}
        <ul>
          {layers.map((layer) => (
            <li key={layer.id}>
              <label>
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => toggleLayerVisibility(layer.id)}
                />
                {layer.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {error && <div className="error-message">{error}</div>}
    </aside>
  );
};

export default Sidebar;
