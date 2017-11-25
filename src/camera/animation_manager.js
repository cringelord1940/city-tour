"use strict";

var CityTour = CityTour || {};

CityTour.AnimationManager = function(terrain, roadNetwork, poleCamera) {
  var animationManager = {};

  var debug = false;
  var scheduleDebugChange = false;

  var vehicleController, debugAnimationController;
  var currentController;

  var syncCamera = function() {
    poleCamera.setPositionX(currentController.xPosition());
    poleCamera.setPositionY(currentController.yPosition());
    poleCamera.setPositionZ(currentController.zPosition());
    poleCamera.setRotationX(currentController.xRotation());
    poleCamera.setRotationY(currentController.yRotation());
  };

  animationManager.init = function(targetMapX, targetMapZ, initialXPosition, initialYPosition, initialZPosition, initialXRotation, initialYRotation) {
    vehicleController = new CityTour.VehicleController(terrain,
                                                       roadNetwork,
                                                       {
                                                         positionX: initialXPosition,
                                                         positionY: initialYPosition,
                                                         positionZ: initialZPosition,
                                                         rotationX: initialXRotation,
                                                         rotationY: initialYRotation,
                                                       },
                                                       {
                                                         positionX: CityTour.Coordinates.mapXToSceneX(targetMapX),
                                                         positionY: Number.NEGATIVE_INFINITY,
                                                         positionZ: CityTour.Coordinates.mapZToSceneZ(targetMapZ),
                                                         rotationX: 0.0,
                                                         rotationY: initialYRotation,
                                                       });

    currentController = vehicleController;

    syncCamera();
  };

  animationManager.tick = function(frameCount) {
    var i;

    for (i = 0; i < frameCount; i++) {
      vehicleController.tick();

      if (debugAnimationController) {
        if (!debug) {
          debugAnimationController.setTargetXPosition(vehicleController.xPosition());
          debugAnimationController.setTargetYPosition(vehicleController.yPosition());
          debugAnimationController.setTargetZPosition(vehicleController.zPosition());
          debugAnimationController.setTargetXRotation(vehicleController.xRotation());
          debugAnimationController.setTargetYRotation(vehicleController.yRotation());
        }

        debugAnimationController.tick();
      }
    }

    if (scheduleDebugChange) {
      debug = !debug;
      scheduleDebugChange = false;

      if (debug) {
        debugAnimationController =
          new CityTour.DebugAnimation({positionX: poleCamera.positionX(),
                                       positionY: poleCamera.positionY(),
                                       positionZ: poleCamera.positionZ(),
                                       rotationX: poleCamera.rotationX(),
                                       rotationY: poleCamera.rotationY()},
                                      {positionX: 0.0, positionY: 900, positionZ: 0.0, rotationX: -(Math.PI / 2), rotationY: 0.0},
                                      true);
      }
      else {
        debugAnimationController =
          new CityTour.DebugAnimation({positionX: poleCamera.positionX(),
                                       positionY: poleCamera.positionY(),
                                       positionZ: poleCamera.positionZ(),
                                       rotationX: poleCamera.rotationX(),
                                       rotationY: poleCamera.rotationY()},
                                      {positionX: vehicleController.xPosition(),
                                       positionY: vehicleController.yPosition(),
                                       positionZ: vehicleController.zPosition(),
                                       rotationX: vehicleController.xRotation(),
                                       rotationY: vehicleController.yRotation()},
                                      false);
      }

      currentController = debugAnimationController;
    }

    syncCamera();

    if (!debug && debugAnimationController && debugAnimationController.finished()) {
      debugAnimationController = null;
      currentController = vehicleController;
    }
  };

  animationManager.toggleDebug = function() {
    scheduleDebugChange = true;
  };

  return animationManager;
};