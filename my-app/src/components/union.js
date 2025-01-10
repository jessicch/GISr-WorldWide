import * as turf from '@turf/turf';

// Self Created function for computing union while keeping features and properties. 
export const computeUnion = (layers, layer1Id, layer2Id, outputLayerName) => {
const layer1 = layers.find((l) => l.id === layer1Id);
const layer2 = layers.find((l) => l.id === layer2Id);

if (!layer1) {
    console.error(`Layer 1 with ID ${layer1Id} not found.`);
    return null;
}
if (!layer2) {
    console.error(`Layer 2 with ID ${layer2Id} not found.`);
    return null;
}

const features1 = layer1.geojson.features || [];
const features2 = layer2.geojson.features || [];

const intersections = [];
const uniqueLayer1 = [];
const uniqueLayer2 = [];

// Create copies of features to modify
const layer1FeaturesCopy = features1.map((f) => JSON.parse(JSON.stringify(f)));
const layer2FeaturesCopy = features2.map((f) => JSON.parse(JSON.stringify(f)));

// First we compute the intersections, and remove from total of features. 
for (let i = 0; i < layer1FeaturesCopy.length; i++) {
    for (let j = 0; j < layer2FeaturesCopy.length; j++) {
        var feature1 = layer1FeaturesCopy[i];
        var feature2 = layer2FeaturesCopy[j];

    
    const featureCollection = {
        type: 'FeatureCollection',
        features: [feature1, feature2],
    };

    // Compute intersection  first.
    const intersection = turf.intersect(featureCollection);

    if (intersection) {
        // Merges properties from both features to keep for feature extraction
        const mergedProperties = {
        ...feature1.properties,
        ...feature2.properties,
        sourceLayer1FeatureIndex: i,
        sourceLayer2FeatureIndex: j,
        };

        // Adds the intersecting area with merged properties
        intersections.push({
        type: 'Feature',
        geometry: intersection.geometry,
        properties: mergedProperties,
        });

        const featureCollection1 = {
            type: 'FeatureCollection',
            features: [feature1, intersection],
        };

        const featureCollection2 = {
            type: 'FeatureCollection',
            features: [feature2, intersection],
        };
    
        // Subtract the intersection from both features to get unique parts
        const difference1 = turf.difference(featureCollection1);
        const difference2 = turf.difference(featureCollection2);
        

        if (difference1) {
            layer1FeaturesCopy[i] = difference1;
            console.log(difference1)
            } else {
            layer1FeaturesCopy.splice(i, 1);
            i--;
            }

        if (difference2) {
            layer2FeaturesCopy[j] = difference2;
            } else {
            layer2FeaturesCopy.splice(j, 1);
            j--; 
        }
    }
    }
}

// The remaining features are unique, as we already removed intersections.
const remainingLayer1 = layer1FeaturesCopy;
const remainingLayer2 = layer2FeaturesCopy;

remainingLayer1.forEach((feature) => {
    uniqueLayer1.push({
    type: 'Feature',
    geometry: feature.geometry,
    properties: {
        ...feature.properties,
        sourceLayer: layer1Id,
        sourceFeatureIndex: features1.indexOf(feature),
    },
    });
});

remainingLayer2.forEach((feature) => {
    uniqueLayer2.push({
    type: 'Feature',
    geometry: feature.geometry,
    properties: {
        ...feature.properties,
        sourceLayer: layer2Id,
        sourceFeatureIndex: features2.indexOf(feature),
    },
    });
});

// Combines all intersecting and unique features
const mergedFeatures = [...intersections, ...uniqueLayer1, ...uniqueLayer2];
const outputFeatureCollection = turf.featureCollection(mergedFeatures);


const safeLayerName = outputLayerName.trim() || 'MergedLayer';

return {
    id: `${safeLayerName}-${Date.now()}`, 
    name: safeLayerName,
    geojson: outputFeatureCollection,
    visible: true,
    color: '#28a745', 
};
};
