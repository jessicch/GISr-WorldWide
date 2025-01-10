import * as turf from '@turf/turf';

// Depending on if they are lines or points, uses turf's booleanpointinpolygon or linesplit. 
export const clipLayerToArea = (layers, layerId, clipLayerId, outputLayerName) => {
const layer = layers.find((l) => l.id === layerId);
const clipLayer = layers.find((l) => l.id === clipLayerId);

if (!layer) {
    console.error(`Layer with ID ${layerId} not found.`);
    return null;
}

if (!clipLayer) {
    console.error(`Clip area layer with ID ${clipLayerId} not found.`);
    return null;
}

const features = layer.geojson.features;
const clipFeatures = clipLayer.geojson.features.filter(
    (feature) => feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'
);

if (!features || features.length === 0 || !clipFeatures || clipFeatures.length === 0) {
    console.warn('No features available in the selected layers to perform clipping.');
    return null;
}

try {
    const clippedFeatures = [];

    features.forEach((feature) => {
    clipFeatures.forEach((polygon) => {
        if (feature.geometry.type === 'Point') {
        // Clips points using booleanPointInPolygon
        if (turf.booleanPointInPolygon(feature, polygon)) {
            clippedFeatures.push(feature);
        }
        } else if (feature.geometry.type === 'LineString') {
        // Clips lines using lineSplit and buffer. Inspired by QGEES implementation
        const clipped = turf.lineSplit(feature, turf.polygonToLine(polygon));
        if (clipped) {
            const bufferedPolygon = turf.buffer(polygon, 0.00001, { units: 'kilometers' });
            const insideSegments = clipped.features.filter((segment) =>
            turf.booleanContains(bufferedPolygon, segment)
            );
            clippedFeatures.push(...insideSegments);
        }
        }
    });
    });

    if (clippedFeatures.length === 0) {
    console.warn('No intersecting features found during clipping.');
    return null;
    }

    const safeLayerName = outputLayerName.trim() || 'ClippedLayer';

    return {
    id: `${safeLayerName}-${Date.now()}`,
    name: safeLayerName,
    geojson: {
        type: 'FeatureCollection',
        features: clippedFeatures,
    },
    visible: true,
    color: '#FFCC00', 
    };
} catch (err) {
    console.error('Error during clipping:', err);
    return null;
}
};
