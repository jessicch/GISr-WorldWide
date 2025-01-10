import * as turf from '@turf/turf';

// Uses turf.intersect to calculate intersection between two polygon layers. 
export const createIntersectionLayer = (layers, layerId1, layerId2, outputLayerName) => {
const layer1 = layers.find((l) => l.id === layerId1);
const layer2 = layers.find((l) => l.id === layerId2);

if (!layer1 || !layer2) {
    console.error('At least one of the specified layers was not found.');
    return null;
}

const features1 = layer1.geojson.features;
const features2 = layer2.geojson.features;
const intersections = [];

// Checks all pairs of features within a layers, for all possible intersectionareas.
for (let i = 0; i < features1.length; i++) {
    for (let j = 0; j < features2.length; j++) {

    const feature1 = features1[i];
    const feature2 = features2[j];

    const featureCollection = {
        type: 'FeatureCollection',
        features: [feature1, feature2],
    };

    
    const intersection = turf.intersect(featureCollection);

    if (intersection) {
        // Adds each small intersection to total results for intersection. 
        intersections.push({
        type: 'Feature',
        geometry: intersection.geometry,
        properties: {
            ...feature1.properties, // Properties from the first feature
            ...feature2.properties, // Properties from the second feature
            layer1FeatureIndex: i, // Tracks indices from both layers, which feature from which layer. 
            layer2FeatureIndex: j,
        },
        });
    }
    }}


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
