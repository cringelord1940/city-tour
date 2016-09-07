"use strict";

var CityConfig = (function() {
  var config = {};

  config.STREET_WIDTH = 3;
  config.STREET_DEPTH = 3;
  config.BLOCK_WIDTH = 8;
  config.BLOCK_DEPTH = 8;
  config.BLOCK_AND_STREET_WIDTH = config.BLOCK_WIDTH + config.STREET_WIDTH;
  config.BLOCK_AND_STREET_DEPTH = config.BLOCK_DEPTH + config.STREET_DEPTH;
  config.BLOCK_ROWS = 64;
  config.BLOCK_COLUMNS = 64;
  config.HALF_BLOCK_ROWS = config.BLOCK_ROWS / 2;
  config.HALF_BLOCK_COLUMNS = config.BLOCK_COLUMNS / 2;
  config.TERRAIN_ROWS = 128;
  config.TERRAIN_COLUMNS = 128;
  config.HALF_TERRAIN_ROWS = config.TERRAIN_ROWS / 2;
  config.HALF_TERRAIN_COLUMNS = config.TERRAIN_COLUMNS / 2;
  config.MIN_STORY_HEIGHT = 1.2;
  config.MAX_STORY_HEIGHT = 1.5;
  config.MAX_BUILDING_MATERIALS = 50;
  config.TOTAL_SCENE_WIDTH = config.TERRAIN_COLUMNS * config.BLOCK_AND_STREET_WIDTH;
  config.HALF_SCENE_WIDTH = config.TOTAL_SCENE_WIDTH / 2;
  config.TOTAL_SCENE_DEPTH = config.TERRAIN_ROWS * config.BLOCK_AND_STREET_DEPTH;
  config.HALF_SCENE_DEPTH = config.TOTAL_SCENE_DEPTH / 2;

  return config;
})();

var Coordinates = (function() {
  var coordinates = {};

  coordinates.mapXToSceneX = function(mapX) {
    return mapX * CityConfig.BLOCK_AND_STREET_WIDTH;
  };

  coordinates.mapZToSceneZ = function(mapZ) {
    return mapZ * CityConfig.BLOCK_AND_STREET_DEPTH;
  };

  coordinates.sceneXToMapX = function(sceneX) {
    return sceneX / CityConfig.BLOCK_AND_STREET_WIDTH;
  };

  coordinates.sceneZToMapZ = function(sceneZ) {
    return sceneZ / CityConfig.BLOCK_AND_STREET_DEPTH;
  };

  return coordinates;
})();

var City = function(container) {
  var renderer, scene, camera;

  var detectWebGL = function() {
    if (!window.WebGLRenderingContext) {
      return false;
    }

    // Adapted from https://github.com/Modernizr/Modernizr/blob/master/feature-detects/webgl-extensions.js
    var canvas = document.createElement('canvas');
    var webgl_context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (webgl_context === null) {
      return false;
    }

    return true;
  };

  var animationTimer, animationManager;

  var init = function(onComplete) {
    var SKY_COLOR = 0x66ccff;

    if (!detectWebGL()) {
      document.getElementById("loading-message").innerText = "This page is not compatible with your browser, because it requires WebGL.";
      return;
    }

    var masterStartTime = new Date();

    var terrainStartTime = new Date();
    var terrain = new TerrainBuilder().build(CityConfig.TERRAIN_COLUMNS, CityConfig.TERRAIN_ROWS);
    var terrainEndTime = new Date();

    var roadStartTime = new Date();
    var roadNetwork = new AdditiveRoadNetwork(terrain,
                                              -CityConfig.HALF_BLOCK_COLUMNS,
                                               CityConfig.HALF_BLOCK_COLUMNS,
                                              -CityConfig.HALF_BLOCK_ROWS,
                                              CityConfig.HALF_BLOCK_ROWS);
    roadNetwork.pruneSteepEdges(terrain);
    var roadEndTime = new Date();

    var buildingsStartTime = new Date();
    var buildings = new Buildings(terrain, roadNetwork);
    var buildingsEndTime = new Date();

    var masterEndTime = new Date();

    console.log("Time to generate world data: " + (masterEndTime - masterStartTime) + "ms");
    console.log("  Terrain: "      + (terrainEndTime - terrainStartTime) + "ms");
    console.log("  Road Network: " + (roadEndTime - roadStartTime) + "ms");
    console.log("  Buildings: "    + (buildingsEndTime - buildingsStartTime) + "ms");

    roadNetwork.pruneHorizontalEdgesWithNoBuildings(buildings);
    roadNetwork.pruneVerticalEdgesWithNoBuildings(buildings);

    var sceneBuilder = new SceneBuilder();
    scene = sceneBuilder.build(terrain, roadNetwork, buildings);

    var cameraPoleGeometry = new THREE.BoxGeometry(1, 1, 1);
    var cameraPoleMaterial = new THREE.MeshLambertMaterial({ color: new THREE.Color(1.0, 0.0, 1.0), });
    var cameraPole = new THREE.Mesh(cameraPoleGeometry, cameraPoleMaterial);

    // Build camera
    var VIEW_ANGLE = 45, DEFAULT_ASPECT = 1.0, NEAR = 0.1, FAR = 10000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, DEFAULT_ASPECT, NEAR, FAR);
    camera.lookAt(scene.position);

    cameraPole.add(camera);
    scene.add(cameraPole);

    // Build renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1)
    renderer.setClearColor(SKY_COLOR, 1);
    resize();

    animationTimer = new AnimationTimer();
    animationManager = new AnimationManager(terrain, roadNetwork, cameraPole, camera);
    animationTimer.onAnimate = function(frameCount) {
      animationManager.animate(frameCount);
      renderer.render(scene, camera);
    }

    animationManager.animate(1);
    renderer.render(scene, camera);
    container.appendChild(renderer.domElement);

    animationTimer.start();

    onComplete();
  };

  var resize = function() {
    var width = container.clientWidth;
    var height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  var togglePause = function() {
    animationTimer.togglePause();
  };

  var city = {};

  city.init = init;
  city.resize = resize;
  city.togglePause = togglePause;

  return city;
};
