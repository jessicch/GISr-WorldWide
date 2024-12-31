import React, { useRef, useState } from 'react';
import './css/Sidebar.css';
import { handleShpZipFile } from './fileUpload';

const Sidebar = ({ layers, addLayers, toggleLayerVisibility }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

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

  return (
    <aside className="sidebar">
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Contact</li>

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
      </ul>

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
