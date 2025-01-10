import * as turf from '@turf/turf';

/**
 * Calculate Voronoi polygons for a given point layer.
 * @param {Array} layers - The list of layers in the application.
 * @param {string} layerId - The ID of the point layer to compute Voronoi.
 * @param {string} outputLayerName - The name for the output Voronoi layer.
 * @returns {object|null} - The new Voronoi layer or null if calculation fails.
 */
export const calculateVoronoiLayer = (layers, layerId, outputLayerName) => {
  // Find the selected layer
  const layer = layers.find((l) => l.id === layerId);

  if (!layer) {
    console.error(`Layer with ID ${layerId} not found.`);
    return null;
  }

  const features = layer.geojson.features;

  if (!features || features.length === 0) {
    console.warn('No points available in the selected layer to calculate Voronoi.');
    return null;
  }

  // Create a GeoJSON FeatureCollection from the points
  const pointsCollection = {
    type: 'FeatureCollection',
    features: features.filter((feature) => feature.geometry.type === 'Point'),
  };

  if (pointsCollection.features.length === 0) {
    console.warn('Selected layer does not contain any points.');
    return null;
  }

  try {
    // Compute bounding box from points
    const bbox = turf.bbox(pointsCollection);

    // Calculate Voronoi polygons
    const voronoiPolygons = turf.voronoi(pointsCollection, { bbox });

    if (!voronoiPolygons) {
      console.error('Voronoi calculation failed.');
      return null;
    }

    const safeLayerName = outputLayerName.trim() || 'VoronoiLayer';

    // Create a new Voronoi layer
    return {
      id: `${safeLayerName}-${Date.now()}`,
      name: safeLayerName,
      geojson: voronoiPolygons,
      visible: true,
      color: '#00FF00', // Default color for Voronoi polygons
    };
  } catch (err) {
    console.error('Error during Voronoi calculation:', err);
    return null;
  }
};
