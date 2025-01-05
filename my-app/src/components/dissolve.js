import * as turf from '@turf/turf';

export const dissolveLayer = (layers, layerId, outputLayerName) => {
  // Find the selected layer
  const layer = layers.find((l) => l.id === layerId);
  if (!layer) {
    console.error(`Layer with ID ${layerId} not found.`);
    return null;
  }

  // Extract the features from the layer
  const features = layer.geojson;

  if (!features || features.length === 0) {
    console.warn('No features available in the selected layer to dissolve.');
    return null;
  }

  try {
    // Use turf.union to dissolve all features into one
    const dissolved = turf.union(features)

    // Create a new layer with the dissolved geometry
    const safeLayerName = outputLayerName.trim() || 'DissolvedLayer';

    return {
      id: `${safeLayerName}-${Date.now()}`,
      name: safeLayerName,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: dissolved.geometry,
            properties: {}, // You can add combined properties here if needed
          },
        ],
      },
      visible: true,
      color: '#FF00FF', // Optional default color for the dissolved layer
    };
  } catch (err) {
    console.error('Failed to dissolve features:', err);
    return null;
  }
};
