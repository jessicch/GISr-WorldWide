export const addLayerToMap = (map, layer) => {
    console.log(layer)
    if (!map.getSource(layer.id)) {
      map.addSource(layer.id, {
        type: 'geojson',
        data: layer.geojson,
      });
    }
  
    const geometryType = layer.geojson.features[0]?.geometry.type;
  
    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
      map.addLayer({
        id: layer.id,
        type: 'circle',
        source: layer.id,
        paint: {
          'circle-radius': 5,
          'circle-color': layer.color || '#FF0000',
        },
      });
    } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
      map.addLayer({
        id: layer.id,
        type: 'line',
        source: layer.id,
        paint: {
          'line-width': 2,
          'line-color': layer.color || '#0000FF',
        },
      });
    } else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      map.addLayer({
        id: `${layer.id}-fill`,
        type: 'fill',
        source: layer.id,
        paint: {
          'fill-color': layer.color || '#00FF00',
          'fill-opacity': 0.5,
        },
      });
  
      map.addLayer({
        id: `${layer.id}-border`,
        type: 'line',
        source: layer.id,
        paint: {
          'line-color': layer.borderColor || '#000000',
          'line-width': 2,
        },
      });
    } else {
      console.warn(`Unsupported geometry type for layer: ${layer.id}`);
    }
  };
  
  export const setLayerVisibility = (map, layer) => {
    const geometryType = layer.geojson.features[0]?.geometry.type;
  
    if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      if (map.getLayer(`${layer.id}-fill`)) {
        map.setLayoutProperty(`${layer.id}-fill`, 'visibility', layer.visible ? 'visible' : 'none');
      }
      if (map.getLayer(`${layer.id}-border`)) {
        map.setLayoutProperty(`${layer.id}-border`, 'visibility', layer.visible ? 'visible' : 'none');
      }
    } else {
      if (map.getLayer(layer.id)) {
        map.setLayoutProperty(layer.id, 'visibility', layer.visible ? 'visible' : 'none');
      }
    }
  };
  