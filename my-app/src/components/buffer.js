import * as turf from '@turf/turf';

/**
 * Create a new buffer layer for the given layerId and return the layer object.
 * @param {Array} layers - Global layers state.
 * @param {String} layerId - The ID of the layer to buffer.
 * @param {Number} distance - Buffer distance in meters.
 * @param {String} outputLayerName - Name of the new buffer layer.
 * @returns {Object|null} - The new layer object or null if layer not found.
 */
export const createBufferLayer = (layers, layerId, distance, outputLayerName) => {
  const layer = layers.find(l => l.id === layerId);
  if (!layer) {
    console.error(`Layer with ID ${layerId} not found.`);
    return null;
  }

  const features = layer.geojson.features;
  const bufferedFeatures = features.map(feature =>
    turf.buffer(feature, distance, { units: 'meters' })
  );

  const bufferedGeoJSON = {
    type: 'FeatureCollection',
    features: bufferedFeatures.flat(),
  };

  return {
    id: `${outputLayerName}-${Date.now()}`,
    name: outputLayerName,
    geojson: bufferedGeoJSON,
    visible: true,
  };
};
