// Makes a new layer based on chosen features to extract!
export const extractFeatures = (layers, layerId, attribute, value, outputLayerName) => {
    const layer = layers.find((l) => l.id === layerId);

    if (!layer) {
    console.error(`Layer with ID ${layerId} not found.`);
    return null;
    }

    const features = layer.geojson.features;

    if (!features || features.length === 0) {
    console.warn('No features available in the selected layer.');
    return null;
    }

    try {
    // Filter features by the chosen attribute and value
    const filteredFeatures = features.filter(
        (feature) => String(feature.properties[attribute]) === String(value)
    );

    if (filteredFeatures.length === 0) {
        console.warn('No matching features found.');
        return null;
    }

    const safeLayerName = outputLayerName.trim() || 'ExtractedLayer';

    return {
        id: `${safeLayerName}-${Date.now()}`,
        name: safeLayerName,
        geojson: {
        type: 'FeatureCollection',
        features: filteredFeatures,
        },
        visible: true,
        color: '#FFC107',
    };
    } catch (err) {
    console.error('Failed to extract features:', err);
    return null;
    }
};
