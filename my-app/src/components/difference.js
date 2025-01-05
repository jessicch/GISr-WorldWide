import * as turf from '@turf/turf';

/**
 * Compute the difference between two layers (Layer 1 - Layer 2).
 * @param {array} layers - Array of all layers.
 * @param {string} baseLayerId - The ID of the base layer (Layer 1).
 * @param {string} subtractLayerId - The ID of the subtracting layer (Layer 2).
 * @param {string} outputLayerName - Name for the output layer.
 * @returns {object|null} - A new layer containing the difference or null if failed.
 */
export const computeDifference = (layers, baseLayerId, subtractLayerId, outputLayerName) => {
  const baseLayer = layers.find((l) => l.id === baseLayerId);
  const subtractLayer = layers.find((l) => l.id === subtractLayerId);

  if (!baseLayer) {
    console.error(`Base layer with ID ${baseLayerId} not found.`);
    return null;
  }
  if (!subtractLayer) {
    console.error(`Subtracting layer with ID ${subtractLayerId} not found.`);
    return null;
  }

  const baseFeatures = baseLayer.geojson.features;
  const subtractFeatures = subtractLayer.geojson.features;

  if (!baseFeatures || baseFeatures.length === 0) {
    console.warn('No features in the base layer to compute the difference.');
    return null;
  }
  if (!subtractFeatures || subtractFeatures.length === 0) {
    console.warn('No features in the subtracting layer, returning base layer unchanged.');
    return baseLayer; // No subtraction needed
  }

  try {
    // Combine all features into a single FeatureCollection
    const combinedFeatureCollection = {
      type: 'FeatureCollection',
      features: [...baseFeatures, ...subtractFeatures],
    };

    // Compute the difference using turf.difference
    const difference = turf.difference(combinedFeatureCollection);

    if (!difference) {
      console.warn('No difference found between the layers.');
      return null;
    }

    // Create a new layer with the resulting difference
    const safeLayerName = outputLayerName.trim() || 'DifferenceLayer';

    return {
      id: `${safeLayerName}-${Date.now()}`,
      name: safeLayerName,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: difference.geometry,
            properties: {}, // Add combined properties if needed
          },
        ],
      },
      visible: true,
      color: '#FF5733', // Optional default color for the difference layer
    };
  } catch (err) {
    console.error('Failed to compute difference:', err);
    return null;
  }
};
