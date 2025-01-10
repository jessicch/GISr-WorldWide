import * as turf from '@turf/turf';

// Uses turf's buffer function to calculate buffer around points, lines, n polygons. 
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
