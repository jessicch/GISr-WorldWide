import * as turf from '@turf/turf';

export const createIntersectionLayer = (layers, layerId1, layerId2, outputLayerName) => {
  // Find the two layers
  const layer1 = layers.find((l) => l.id === layerId1);
  const layer2 = layers.find((l) => l.id === layerId2);

  if (!layer1 || !layer2) {
    console.error('At least one of the specified layers was not found.');
    return null;
  }

  // For simplicity, assume both layers have geometry compatible with turf.intersect (usually polygons)
  // If they're lines/points/polygons in any combination, you'll need more specialized logic.
  
  const features1 = layer1.geojson.features;
  const features2 = layer2.geojson.features;
  const intersections = [];

  // Iterate through all pairs of features between the two layers
  for (let i = 0; i < features1.length; i++) {
    for (let j = 0; j < features2.length; j++) {

      const feature1 = features1[i];
      const feature2 = features2[j];

      const featureCollection = {
        type: 'FeatureCollection',
        features: [feature1, feature2],
      };

      console.log(feature1, feature2)
      
      const intersection = turf.intersect(featureCollection);
      console.log(intersection)

      if (intersection) {
        // Add the intersection to the results
        intersections.push({
          type: 'Feature',
          geometry: intersection.geometry,
          properties: {
            ...intersection.properties,
            layer1FeatureIndex: i, // Track indices from both layers
            layer2FeatureIndex: j,
          },
        });
      }
    }}

  
  // Make sure to generate a non-empty ID
  const safeLayerName = outputLayerName.trim() || 'IntersectionLayer';

  return {
    id: `${safeLayerName}-${Date.now()}`,
    name: safeLayerName,
    geojson: {
      type: 'FeatureCollection',
      features: intersections,
    },
    visible: true,
  };
};
