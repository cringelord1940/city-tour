"use strict";

var CityTour = CityTour || {};

CityTour.WorldGenerator = (function() {
  var generate = function(config) {
    var GENERATE_ROAD_NETWORK = true;
    var GENERATE_BUILDINGS = true && GENERATE_ROAD_NETWORK;

    var findLandPointNearCenter = function(terrain) {
      var x, z;
      var squareSize = 1;

      while (squareSize < CityTour.Config.TERRAIN_ROWS && squareSize < CityTour.Config.TERRAIN_COLUMNS) {
        for (x = -(squareSize - 1) / 2; x <= (squareSize - 1) / 2; x++) {
          for (z = -(squareSize - 1) / 2; z <= (squareSize - 1) / 2; z++) {
            if (terrain.materialAtCoordinates(x, z) === CityTour.Terrain.LAND) {
              return {x: x, z: z};
            }
          }
        }

        squareSize += 2;
      }

      return undefined;
    };

    var combinedStartTime = new Date();

    var terrainConfig = {
      heightJitter: config.terrain.heightJitter,
      heightJitterDecay: config.terrain.heightJitterDecay,
      river: (Math.random() < config.terrain.probabilityOfRiver),
    };

    var terrainStartTime = new Date();
    var terrain = CityTour.TerrainGenerator.generate(CityTour.Config.TERRAIN_COLUMNS, CityTour.Config.TERRAIN_ROWS, terrainConfig);
    var terrainEndTime = new Date();

    var cityCenter = findLandPointNearCenter(terrain);
    var centerX = cityCenter.x, centerZ = cityCenter.z;

    var roadConfig = {
      centerMapX: centerX,
      centerMapZ: centerZ,
      safeFromDecayPercentage: config.roadNetwork.safeFromDecayPercentage,
    };

    var roadStartTime = new Date();
    var roadNetwork = (GENERATE_ROAD_NETWORK) ? CityTour.RoadNetworkGenerator.generate(terrain, roadConfig) : new CityTour.RoadNetwork(terrain);
    var roadEndTime = new Date();

    var zonedBlockConfig = {
      percentageDistanceDecayBegins: config.zonedBlocks.percentageDistanceDecayBegins,
      maxBuildingStories: config.zonedBlocks.maxBuildingStories,
    };

    var zonedBlocksStartTime = new Date();
    var zonedBlocks = (GENERATE_BUILDINGS) ? CityTour.ZonedBlockGenerator.generate(terrain, roadNetwork, centerX, centerZ, zonedBlockConfig) : false;
    var zonedBlocksEndTime = new Date();
    var buildingsStartTime = new Date();
    var buildings = (GENERATE_BUILDINGS) ? CityTour.BuildingsGenerator.generate(terrain, zonedBlocks) : false;
    var buildingsEndTime = new Date();

    var combinedEndTime = new Date();

    console.log("Time to generate world data: " + (combinedEndTime - combinedStartTime) + "ms");
    console.log("  Terrain:      " + (terrainEndTime - terrainStartTime) + "ms");
    console.log("  Road Network: " + (roadEndTime - roadStartTime) + "ms");
    console.log("  Lots:         " + (zonedBlocksEndTime - zonedBlocksStartTime) + "ms");
    console.log("  Buildings:    " + (buildingsEndTime - buildingsStartTime) + "ms");

    return {
      terrain: terrain,
      roadNetwork: roadNetwork,
      buildings: buildings,
      centerX: centerX,
      centerZ: centerZ,
    };
  };

  return {
    generate: generate,
  };
})();
