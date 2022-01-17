async function main() {
  
  // query to pull earthquake data and storing it to 'data'
  const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  
  const response =  await fetch(queryUrl);
  const data = await response.json();

  // query to pull tectonicplate data and storing it to 'data2'
  const queryUrl2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

  const response2 =  await fetch(queryUrl2);
  const data2 = await response2.json();

  // console.log(data.features[0].properties.mag)
  // console.log(data.features[0].geometry.coordinates[2])
  // console.log(data2.features[0].properties)


  // Creating a GeoJSON layer with the retrieved earthquake data
  const earthquakes = L.geoJSON(data.features, {
    pointToLayer:(feature, latlng) => {
      return L.circleMarker(latlng,{
        //reflect magnitude of the earthequake by the size
        radius: markerSize(feature.properties.mag),
        //Call the chooseColor() function to decide which color to represent the depth
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        color: "#000",
        fillOpacity: 0.75,
        weight: 0.5,
        showlegend : true
      }
      );
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>\
      ${new Date(feature.properties.time)}<br>\
      <b>Magnitude : </b>${feature.properties.mag}<br>\
      <b>Location (lon, lat) : </b>${feature.geometry.coordinates[0]}, ${feature.geometry.coordinates[1]}<br>\
      <b>Depth : </b>${feature.geometry.coordinates[2]}</p>`);
    }

  });
  //function to reflect depth of the earthquake by color
  function chooseColor(depth) {
    if (depth > -10 && depth < 10) return "#1a9850";
    else if (depth < 30) return "#91cf60";
    else if (depth < 50) return "#d9ef8b";
    else if (depth < 70) return "#fee08b";
    else if (depth < 90) return "#fc8d59";
    else if (depth >= 90) return "#d73027";
    else return "#000000";
  }

  //function to rescale the size of the magnitude
  function markerSize(mag) {
    return mag*2.5;
  }


  // Creating a GeoJSON layer with the retrieved tectonic plate data
  const tectonic = L.geoJSON(data2.features,{
    style: function(feature) {
      return {
        color: "orange",
        fillOpacity: 0.75,
        weight: 1.5
      }
    }
  });


   // Create the base layers.
  var streetMap =  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
  maxZoom: 20,
  subdomains:['mt0','mt1','mt2','mt3'],
  attribution: '&copy; <a href="https://maps.google.com">GoogleMap</a> contributors'
  });

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var baseMaps = {
    "Street Map": streetMap,
    "Satellite Map": satellite,
    "Topographic Map": topo

  };

  var overlayMaps = {
    "Earthquakes" : earthquakes,
    "Tectonic Plates" : tectonic
  };

  var myMap = L.map("map", {
    center: [
      33.44, -112.07
    ],
    zoom: 4,
    layers:[streetMap, earthquakes]
    });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);



  //creating function to get different colors for the legend
  function getColor(d) {
    return d < 10 && d > -10 ? '#1a9850' :
          d < 30  ? '#91cf60' :
          d < 50  ? '#d9ef8b' :
          d < 70  ? '#fee08b' :
          d < 90  ? '#fc8d59' :
          d >= 90 ? '#d73027' :
                    '#000000' ;
  }


  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [-10, 10, 30, 50, 70, 90],
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(myMap);

  

}

main()


