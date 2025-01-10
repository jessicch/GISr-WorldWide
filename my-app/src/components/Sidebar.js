
import React, { useRef, useState, useEffect } from 'react';
import './css/Sidebar.css';
import { handleShpZipFile } from './fileUpload';
import { createBufferLayer } from './buffer';
import { createIntersectionLayer } from './intersect';
import { dissolveLayer } from './dissolve';
import { computeDifference } from './difference';
import { computeUnion } from './union';
import { extractFeatures } from './sbfeatureExtractor';
import { clipLayerToArea } from './clip';

// IMPORT icons
import FileUploadIcon from '@mui/icons-material/FileUpload';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import JoinInnerIcon from '@mui/icons-material/JoinInner';
import BorderOuterIcon from '@mui/icons-material/BorderOuter';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import JoinFullIcon from '@mui/icons-material/JoinFull';
import DnsIcon from '@mui/icons-material/Dns';
import ContentCutIcon from '@mui/icons-material/ContentCut';

const Sidebar = ({ layers, addLayers, toggleLayerVisibility, updateLayerColor, renameLayer }) => {
const fileInputRef = useRef(null);
const [error, setError] = useState(null);
// Commons 
const [outputLayerName, setOutputLayerName] = useState('');
const [selectedLayerId, setSelectedLayerId] = useState('');
// Rename Layer
const [renameLayerId, setRenameLayerId] = useState(null);
const [renameValue, setRenameValue] = useState('');

// For Buffer
const [showBufferOptions, setShowBufferOptions] = useState(false); // Toggle for buffer options
const [bufferDistance, setBufferDistance] = useState('');

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

// For Union
const [showUnionOptions, setShowUnionOptions] = useState(false);
const [layer1Id, setLayer1Id] = useState(''); // differ from intersection to differentiate.
const [layer2Id, setLayer2Id] = useState('');

// For Feature Extraction
const [showFeatureExtractorOptions, setShowFeatureExtractorOptions] = useState(false);
const [selectedAttribute, setSelectedAttribute] = useState('');
const [selectedValue, setSelectedValue] = useState('');
const [availableAttributes, setAvailableAttributes] = useState([]);
const [availableValues, setAvailableValues] = useState([]);

// For Clipping
const [showClipOptions, setShowClipOptions] = useState(false);
const [clipLayerId, setClipLayerId] = useState('');

// useffects
useEffect(() => {
    if (selectedLayerId) {
    const layer = layers.find((l) => l.id === selectedLayerId);
    if (layer) {
        const attributes = Object.keys(layer.geojson.features[0]?.properties || {});
        setAvailableAttributes(attributes);
    }
    } else {
    setAvailableAttributes([]);
    }
}, [selectedLayerId, layers]);

useEffect(() => {
    if (selectedAttribute && selectedLayerId) {
    const layer = layers.find((l) => l.id === selectedLayerId);
    if (layer) {
        const values = Array.from(
        new Set(layer.geojson.features.map((feature) => feature.properties[selectedAttribute]))
        );
        setAvailableValues(values);
    }
    } else {
    setAvailableValues([]);
    }
}, [selectedAttribute, selectedLayerId, layers]);


// ALL FUNCTIONS IN THE SIDEBAR ( using imports from each function)
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

const handleUnionSubmit = () => {
    if (!layer1Id || !layer2Id || !outputLayerName) {
    setError('All fields are required for union.');
    return;
    }

    const unionLayer = computeUnion(layers, layer1Id, layer2Id, outputLayerName);

    if (unionLayer) {
    addLayers([unionLayer]);
    setShowUnionOptions(false);
    setLayer1Id('');
    setLayer2Id('');
    setOutputLayerName('');
    } else {
    setError('Failed to compute union.');
    }
};

const handleFeatureExtractionSubmit = () => {
    if (!selectedLayerId || !selectedAttribute || !selectedValue || !outputLayerName) {
    setError('All fields are required for feature extraction.');
    return;
    }

    const extractedLayer = extractFeatures(
    layers,
    selectedLayerId,
    selectedAttribute,
    selectedValue,
    outputLayerName
    );

    if (extractedLayer) {
    addLayers([extractedLayer]);
    setShowFeatureExtractorOptions(false);
    setSelectedLayerId('');
    setSelectedAttribute('');
    setSelectedValue('');
    setOutputLayerName('');
    } else {
    setError('Failed to extract features.');
    }
};

const handleRenameIconClick = (layerId, currentName) => {
    setRenameLayerId(layerId);
    setRenameValue(currentName);
};

const handleRenameLayer = (layerId) => {
    // call rename from parent
    renameLayer(layerId, renameValue);
    // reset rename states
    setRenameLayerId(null);
    setRenameValue('');
};

const handleClipSubmit = () => {
    if (!selectedLayerId || !clipLayerId || !outputLayerName) {
    setError('All fields are required for clipping.');
    return;
    }

    const clippedLayer = clipLayerToArea(layers, selectedLayerId, clipLayerId, outputLayerName);

    if (clippedLayer) {
    addLayers([clippedLayer]);
    setShowClipOptions(false);
    setSelectedLayerId('');
    setClipLayerId('');
    setOutputLayerName('');
    } else {
    setError('Failed to clip the layer.');
    }
};


// HTML for the sidebar, very long but was easiest way. 
return (
    // Sidebar itself
    <aside className="sidebar">
    <ul> 
        {/* All Function Buttons */}
        <li onClick={handleButtonClick} className="upload-button">
        <FileUploadIcon className="icon" />
        <span className="upload-text" >Upload Shapefile ZIP</span>
        </li>

        <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".zip"
        />

        <li onClick={() => setShowBufferOptions(!showBufferOptions)}>
            <TripOriginIcon className="icon" />
        Buffer
        
        </li>

        <li onClick={() => setShowIntersectionOptions(!showIntersectionOptions)}>
            <JoinInnerIcon className="icon" />
        Intersection
        </li>

        <li onClick={() => setShowDissolveOptions(!showDissolveOptions)}>
            <BorderOuterIcon className="icon" />
        Dissolve
        </li>

        <li onClick={() => setShowDifferenceOptions(!showDifferenceOptions)}>
            <RemoveCircleOutlineIcon className="icon" /> 
        Difference
        </li>

        <li onClick={() => setShowUnionOptions(!showUnionOptions)}>
            <JoinFullIcon className="icon" />
        Union
        </li>

        <li onClick={() => setShowFeatureExtractorOptions(!showFeatureExtractorOptions)}>
            <DnsIcon className="icon" />
        Extract Features
        </li>

        <li onClick={() => setShowClipOptions(!showClipOptions)}>
            <ContentCutIcon className="icon" />
        Clip 
        </li>
    </ul>

    {/* The input boxes for each function, that opens when a button is clicked */}
        {/* Here is where we select which layers to process, and name the new layers*/}

        {/* BUFFER */}
    {showBufferOptions && (
        <div className="function-options">
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
    
    {/* INTERSECTION */}
    {showIntersectionOptions && (
        <div className="function-options">
        <h3>Intersection Options</h3>
        <label>
            Select First Layer:
            <select
            value={selectedLayerId1}
            onChange={(e) => setSelectedLayerId1(e.target.value)}
            >
            <option value="">Select a layer</option>
            {layers.filter((layer) =>
                        ['Polygon', 'MultiPolygon'].includes(
                        layer.geojson.features[0]?.geometry.type))
                    .map((layer) => (
                        <option key={layer.id} value={layer.id}>
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
            {layers.filter((layer) =>
                        ['Polygon', 'MultiPolygon'].includes(
                        layer.geojson.features[0]?.geometry.type))
                    .map((layer) => (
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
            value={intersectionOutputName}
            onChange={(e) => setIntersectionOutputName(e.target.value)}
            />
        </label>
        <button onClick={handleIntersectionSubmit}>Create Intersection</button>
        </div>
    )}

    {/* DISSOLVE */}

    {showDissolveOptions && (
        <div className="function-options">
        <h3>Dissolve Options</h3>
        <label>
            Select Layer:
            <select
            value={selectedLayerId}
            onChange={(e) => setSelectedLayerId(e.target.value)}
            >
            <option value="">Select a layer</option>
            {layers.filter((layer) =>
                        ['Polygon', 'MultiPolygon'].includes(
                        layer.geojson.features[0]?.geometry.type))
                    .map((layer) => (
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

    {/* DIFFERENCE */}

    {showDifferenceOptions && (
        <div className="function-options">
        <h3>Difference Options</h3>
        <label>
            Layer to Subtract From (Base Layer):
            <select
            value={baseLayerId}
            onChange={(e) => setBaseLayerId(e.target.value)}
            >
            <option value="">Select a layer</option>
            {layers.filter((layer) =>
                        ['Polygon', 'MultiPolygon'].includes(
                        layer.geojson.features[0]?.geometry.type))
                    .map((layer) => (
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
            {layers.filter((layer) =>
                        ['Polygon', 'MultiPolygon'].includes(
                        layer.geojson.features[0]?.geometry.type))
                    .map((layer) => (
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

    {/* UNION */}

    {showUnionOptions && (
        <div className="function-options">
        <h3>Union Options</h3>
        <label>
            Select Layer 1:
            <select
            value={layer1Id}
            onChange={(e) => setLayer1Id(e.target.value)}
            >
            <option value="">Select a layer</option>
            {layers.filter((layer) =>
                        ['Polygon', 'MultiPolygon'].includes(
                        layer.geojson.features[0]?.geometry.type))
                    .map((layer) => (
                        <option key={layer.id} value={layer.id}>
                        {layer.name}
                        </option>
                    ))}
            </select>
        </label>
        <label>
            Select Layer 2:
            <select
            value={layer2Id}
            onChange={(e) => setLayer2Id(e.target.value)}
            >
            <option value="">Select a layer</option>
            {layers.filter((layer) =>
                        ['Polygon', 'MultiPolygon'].includes(
                        layer.geojson.features[0]?.geometry.type))
                    .map((layer) => (
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
        <button onClick={handleUnionSubmit}>Union Layers</button>
        </div>
    )}

    {/* FEATURE EXTRACTOR */}

    {showFeatureExtractorOptions && (
        <div className="function-options">
        <h3>Feature Extraction Options</h3>
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
        {selectedLayerId && (
            <>
            <label>
                Select Attribute:
                <select
                value={selectedAttribute}
                onChange={(e) => setSelectedAttribute(e.target.value)}
                >
                <option value="">Select an attribute</option>
                {availableAttributes.map((attr) => (
                    <option key={attr} value={attr}>
                    {attr}
                    </option>
                ))}
                </select>
            </label>
            {selectedAttribute && (
                <label>
                Select Value:
                <select
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.target.value)}
                >
                    <option value="">Select a value</option>
                    {availableValues.map((val) => (
                    <option key={val} value={val}>
                        {val}
                    </option>
                    ))}
                </select>
                </label>
            )}
            </>
        )}
        <label>
            Output Layer Name:
            <input
            type="text"
            value={outputLayerName}
            onChange={(e) => setOutputLayerName(e.target.value)}
            />
        </label>
        <button onClick={handleFeatureExtractionSubmit}>Extract Features</button>
        </div>
    )}


    {/* CLIP  */}
    {showClipOptions && (
        <div className="function-options">
            <h3>Clip Layer Options</h3>
            <label>
            Select Layer to Clip (Points or Lines):
            <select
                value={selectedLayerId}
                onChange={(e) => setSelectedLayerId(e.target.value)}
            >
                <option value="">Select a layer</option>
                {layers
                .filter((layer) =>
                    ['Point', 'LineString'].includes(
                    layer.geojson.features[0]?.geometry.type
                    )
                )
                .map((layer) => (
                    <option key={layer.id} value={layer.id}>
                    {layer.name}
                    </option>
                ))}
            </select>
            </label>
            <label>
            Select Clipping Area Layer (Polygons Only):
            <select
                value={clipLayerId}
                onChange={(e) => setClipLayerId(e.target.value)}
            >
                <option value="">Select a layer</option>
                {layers
                .filter((layer) =>
                    ['Polygon', 'MultiPolygon'].includes(
                    layer.geojson.features[0]?.geometry.type
                    )
                )
                .map((layer) => (
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
            <button onClick={handleClipSubmit}>Clip Layer</button>
        </div>
        )}

<div className="layers-list">
        <hr className="section-divider" />
        <h3>Layers</h3>
        {layers.length === 0 && <p>No layers uploaded.</p>}
        <ul>
        {layers.map((layer) => (
            <li
            key={layer.id}
            style={{
                display: 'flex',
                flexDirection: 'column', 
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
            }}
            >
            {/* Row for checkbox, name, color, rename icon */}
            <div
                style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                }}
            >
                {/* Checkbox + name */}
                <div>
                <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => toggleLayerVisibility(layer.id)}
                    style={{ marginRight: '0.3rem' }}
                />
                <span>{layer.name}</span>
                </div>

                {/* Color picker */}
                <div style={{ display: 'flex', alignItems: 'center' }}>

                <div
                style={{ marginRight: '6px', cursor: 'pointer' }}
                onClick={() => handleRenameIconClick(layer.id, layer.name)}
                >
                ⋮
                </div>
                <span style={{ marginRight: '5px', cursor: 'pointer' }}>
                    
                </span>
                <input
                    type="color"
                    value={layer.color || '#FF0000'}
                    onChange={(e) => updateLayerColor(layer.id, e.target.value)}
                />
                
                </div>

            
            </div>

            {renameLayerId === layer.id && (
                <div style={{ marginTop: '0.5rem' }}>
                <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    style={{ marginRight: '0.5rem', border: 'None' }}
                    placeholder='Layer Name'
                />
                <button onClick={() => handleRenameLayer(layer.id)} style={{marginTop: '0.5rem', color: "white", border: "None", borderRadius: "4px", backgroundColor: "#5a6c4b"}}>
                    Save
                </button>
                </div>
            )}
            </li>
        ))}
        </ul>
    </div>

    {error && <div className="error-message">{error}</div>}
    </aside>
);
};

export default Sidebar;
