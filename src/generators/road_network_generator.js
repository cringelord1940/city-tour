"use strict";

var CityTour = CityTour || {};

CityTour.RoadNetworkGenerator = (function() {
  var PERCENTAGE_DISTANCE_THAT_DECAY_BEGINS = 0.4;
  var DISTANCE_TO_CITY_EDGE = Math.min(CityTour.Config.HALF_BLOCK_COLUMNS, CityTour.Config.HALF_BLOCK_ROWS);
  var SAFE_FROM_DECAY_DISTANCE = DISTANCE_TO_CITY_EDGE * PERCENTAGE_DISTANCE_THAT_DECAY_BEGINS;
  var MAX_STEEPNESS = Math.PI / 6;

  var calculateBlockProbabilityOfBranching = function(mapX1, mapZ1, mapX2, mapZ2) {
    // Guarantee roads along x and z axes
    if (mapX1 === 0 && mapX2 === 0 && mapZ2 >= -CityTour.Config.HALF_BLOCK_ROWS && mapZ2 <= CityTour.Config.HALF_BLOCK_ROWS) {
      return 1.0;
    }
    else if (mapZ1 === 0 && mapZ2 === 0 && mapX2 >= -CityTour.Config.HALF_BLOCK_COLUMNS && mapX2 <= CityTour.Config.HALF_BLOCK_COLUMNS) {
      return 1.0;
    }
 
    var distanceFromCenter = Math.sqrt((mapX1 * mapX1) + (mapZ1 * mapZ1));
    var percentageFromCenter = (distanceFromCenter / DISTANCE_TO_CITY_EDGE);
    var normalizedPercentageFromCenter;

    if (percentageFromCenter >= PERCENTAGE_DISTANCE_THAT_DECAY_BEGINS) {
      normalizedPercentageFromCenter = (distanceFromCenter - SAFE_FROM_DECAY_DISTANCE) / (DISTANCE_TO_CITY_EDGE - SAFE_FROM_DECAY_DISTANCE);
    }
    else {
      normalizedPercentageFromCenter = 0.0;
    }

    return (Math.pow(0.5, normalizedPercentageFromCenter) - 0.5) * 2;
  };

  var isTerrainTooSteep = function(terrain, mapX, mapZ, targetMapX, targetMapZ) {
    var heightAtPoint1 = terrain.heightAtCoordinates(mapX, mapZ);
    var heightAtPoint2 = terrain.heightAtCoordinates(targetMapX, targetMapZ);
    var angle = Math.atan2((heightAtPoint1 - heightAtPoint2), CityTour.Config.BLOCK_DEPTH);

    return Math.abs(angle) > MAX_STEEPNESS;
  };

  var shouldConnectIntersections = function(terrain, mapX1, mapZ1, mapX2, mapZ2) {
    var probabilityOfConnection = calculateBlockProbabilityOfBranching(mapX1, mapZ1, mapX2, mapZ2);
    var edgeIsOnLand = terrain.materialAtCoordinates(mapX1, mapZ1) === 'land' &&
                       terrain.materialAtCoordinates(mapX2, mapZ2) === 'land';

    return edgeIsOnLand && (Math.random() < probabilityOfConnection) && !isTerrainTooSteep(terrain, mapX1, mapZ1, mapX2, mapZ2);
  };

  var branchFromIntersection = function(terrain, roadNetwork, mapX, mapZ) {
    connectIntersections(terrain, roadNetwork, mapX, mapZ, mapX - 1, mapZ);
    connectIntersections(terrain, roadNetwork, mapX, mapZ, mapX, mapZ - 1);
    connectIntersections(terrain, roadNetwork, mapX, mapZ, mapX + 1, mapZ);
    connectIntersections(terrain, roadNetwork, mapX, mapZ, mapX, mapZ + 1);
  };

  var connectIntersections = function(terrain, roadNetwork, mapX, mapZ, targetMapX, targetMapZ) {
    if (shouldConnectIntersections(terrain, mapX, mapZ, targetMapX, targetMapZ)) {
      if (roadNetwork.hasIntersection(targetMapX, targetMapZ)) {
        roadNetwork.addEdge(mapX, mapZ, targetMapX, targetMapZ);
      }
      else {
        roadNetwork.addEdge(mapX, mapZ, targetMapX, targetMapZ);
        branchFromIntersection(terrain, roadNetwork, targetMapX, targetMapZ);
      }
    }
  };

  var roadNetworkGenerator = {};

  roadNetworkGenerator.generate = function(terrain) {
    var roadNetwork = new CityTour.RoadNetwork();
    branchFromIntersection(terrain, roadNetwork, 0, 0);

    return roadNetwork;
  };

  return roadNetworkGenerator;
})();
