import * as turf from '@turf/turf';

// Disolves all elements in one layer using turf.union for all polygons within the layer. 
export const dissolveLayer = (layers, layerId, outputLayerName) => {
const layer = layers.find((l) => l.id === layerId);
if (!layer) {
    console.error(`Layer with ID ${layerId} not found.`);
    return null;
}

const features = layer.geojson;

if (!features || features.length === 0) {
    console.warn('No features available in the selected layer to dissolve.');
    return null;
}

try {
    // Uses turf.union to dissolve all features into one
    const dissolved = turf.union(features)

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
            properties: {}, // Not really functional, but keep anyways.
        },
        ],
    },
    visible: true,
    color: '#FF00FF',
    };
} catch (err) {
    console.error('Failed to dissolve features:', err);
    return null;
}
};
