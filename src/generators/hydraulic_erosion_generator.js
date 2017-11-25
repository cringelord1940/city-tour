"use strict";

var CityTour = CityTour || {};

CityTour.HydraulicErosionGenerator = (function() {
  var RAINDROP_COUNT = 10000;
  var WATER_HEIGHT_PER_RAINDROP = 1.0;
  var EVAPORATION_WATER_HEIGHT = 1.2;

  var addRainfall = function(terrainCoordinates) {
    var i;
    var rowCount = terrainCoordinates.length;
    var columnCount = terrainCoordinates[0].length;

    for (i = 0; i < RAINDROP_COUNT; i++) {
      var row = Math.round((Math.random() * (rowCount - 1)));
      var column = Math.round(Math.random() * (columnCount - 1));

      terrainCoordinates[row][column].waterHeight += WATER_HEIGHT_PER_RAINDROP;
    }
  };

  var emptyWaterFlowCoordinates = function(terrainCoordinates) {
    var x, z;
    var waterFlowCoordinates = [];

    for (x = 0; x < terrainCoordinates.length; x++) {
      waterFlowCoordinates[x] = [];

      for (z = 0; z < terrainCoordinates[0].length; z++) {
        waterFlowCoordinates[x][z] = { landDelta: 0.0, waterDelta: 0.0 };
      }
    }

    return waterFlowCoordinates;
  };

  var erode = function(terrainCoordinates, iterationCount) {
    var waterFlowCoordinates;
    var northHeight, southHeight, westHeight, eastHeight, southWestHeight, northEastHeight;
    var currentHeight, minTargetHeight;
    var maxLandDelta, maxWaterDelta;
    var i, x, z;

    var rowCount = terrainCoordinates.length;
    var columnCount = terrainCoordinates[0].length;

    for (i = 0; i < iterationCount; i++) {
      waterFlowCoordinates = emptyWaterFlowCoordinates(terrainCoordinates);

      for (x = 0; x < rowCount; x++) {
        for (z = 0; z < columnCount; z++) {
          currentHeight = terrainCoordinates[x][z].height + terrainCoordinates[x][z].waterHeight;

          // North
          if (z > 0) {
            northHeight = terrainCoordinates[x][z - 1].height + terrainCoordinates[x][z - 1].waterHeight;
          }
          else {
            northHeight = Number.POSITIVE_INFINITY;
          }

          // South
          if (z < terrainCoordinates[0].length - 1) {
            southHeight = terrainCoordinates[x][z + 1].height + terrainCoordinates[x][z + 1].waterHeight;
          }
          else {
            southHeight = Number.POSITIVE_INFINITY;
          }

          // West
          if (x > 0) {
            westHeight = terrainCoordinates[x - 1][z].height + terrainCoordinates[x - 1][z].waterHeight;
          }
          else {
            westHeight = Number.POSITIVE_INFINITY;
          }

          // East
          if (x < terrainCoordinates.length - 1) {
            eastHeight = terrainCoordinates[x + 1][z].height + terrainCoordinates[x + 1][z].waterHeight;
          }
          else {
            eastHeight = Number.POSITIVE_INFINITY;
          }

          // Southwest
          if (x > 0 && z < (terrainCoordinates[0].length - 1)) {
            southWestHeight = terrainCoordinates[x - 1][z + 1].height + terrainCoordinates[x - 1][z + 1].waterHeight;
          }
          else {
            southWestHeight = Number.POSITIVE_INFINITY;
          }

          // Northeast
          if (x < (terrainCoordinates.length - 1) && z > 0) {
            northEastHeight = terrainCoordinates[x + 1][z - 1].height + terrainCoordinates[x + 1][z - 1].waterHeight;
          }
          else {
            northEastHeight = Number.POSITIVE_INFINITY;
          }

          minTargetHeight = Math.min(northHeight, southHeight, westHeight, eastHeight, southWestHeight, northEastHeight);

          if (currentHeight > minTargetHeight && terrainCoordinates[x][z].waterHeight > 0.0) {
            maxWaterDelta = (currentHeight - minTargetHeight) / 2;

            if (northHeight === minTargetHeight) {
              waterFlowCoordinates[x][z - 1].waterDelta += Math.min(maxWaterDelta, terrainCoordinates[x][z].waterHeight);
            }
            else if (southHeight === minTargetHeight) {
              waterFlowCoordinates[x][z + 1].waterDelta += Math.min(maxWaterDelta, terrainCoordinates[x][z].waterHeight);
            }
            else if (westHeight === minTargetHeight) {
              waterFlowCoordinates[x - 1][z].waterDelta += Math.min(maxWaterDelta, terrainCoordinates[x][z].waterHeight);
            }
            else if (eastHeight === minTargetHeight) {
              waterFlowCoordinates[x + 1][z].waterDelta += Math.min(maxWaterDelta, terrainCoordinates[x][z].waterHeight);
            }
            else if (southWestHeight === minTargetHeight) {
              waterFlowCoordinates[x - 1][z + 1].waterDelta += Math.min(maxWaterDelta, terrainCoordinates[x][z].waterHeight);
            }
            else if (northEastHeight === minTargetHeight) {
              waterFlowCoordinates[x + 1][z - 1].waterDelta += Math.min(maxWaterDelta, terrainCoordinates[x][z].waterHeight);
            }

            waterFlowCoordinates[x][z].waterDelta -= Math.min(maxWaterDelta, terrainCoordinates[x][z].waterHeight);
          }
        }
      }

      for (x = 0; x < rowCount; x++) {
        for (z = 0; z < columnCount; z++) {
          terrainCoordinates[x][z].waterHeight += waterFlowCoordinates[x][z].waterDelta;
        }
      }
    }
  };

  var evaporate = function(terrainCoordinates) {
    var x, z;

    for (x = 0; x < terrainCoordinates.length; x++) {
      for (z = 0; z < terrainCoordinates[0].length; z++) {
        terrainCoordinates[x][z].waterHeight = Math.max(terrainCoordinates[x][z].waterHeight - EVAPORATION_WATER_HEIGHT, 0.0);
      }
    }
  };


  return {
    addRainfall: addRainfall,
    evaporate: evaporate,
    erode: erode,
  };
})();