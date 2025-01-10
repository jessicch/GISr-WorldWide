import * as turf from '@turf/turf';

// Removes one polygogonlayer from another using turf's difference. 
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

const baseFeatures = baseLayer.geojson;
console.log(baseFeatures)
const dissolvedBase = turf.union(baseFeatures)
const subtractFeatures = subtractLayer.geojson.features;

if (!baseFeatures || baseFeatures.length === 0) {
    console.warn('No features in the base layer to compute the difference.');
    return null;
}
if (!subtractFeatures || subtractFeatures.length === 0) {
    console.warn('No features in the subtracting layer, returning base layer unchanged.');
    return baseLayer; 
}
console.log(subtractFeatures)

try {
    // Combines all features into a single FeatureCollection, required by turf.
    const combinedFeatureCollection = {
    type: 'FeatureCollection',
    features: [dissolvedBase, ...subtractFeatures],
    };

    // Computes the difference using turf.difference
    const difference = turf.difference(combinedFeatureCollection);

    if (!difference) {
    console.warn('No difference found between the layers.');
    return null;
    }

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
            properties: {}, // Logs which layer each part is from.
        },
        ],
    },
    visible: true,
    color: '#FF5733',
    };
} catch (err) {
    console.error('Failed to compute difference:', err);
    return null;
}
};
