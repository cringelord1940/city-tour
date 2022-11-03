"use strict";

const NEW_CITY_MENU = 1;
const ABOUT_MENU = 2;

var MenusController = function(cityConfigService, messageBroker) {
  var menusContainer = document.getElementById("menus-container");

  // "New City" menu
  var newCityMenuTitle = document.getElementById("menu-newcity-title");
  var newCityMenu = document.getElementById("menu-newcity");
  var terrainJitter = document.getElementById("terrain-jitter");
  var heightJitterDecay = document.getElementById("terrain-decay");
  var hillCount = document.getElementById("terrain-hill-count");
  var maxHillHeight = document.getElementById("terrain-max-hill-height");
  var includeRiver = document.getElementById("terrain-river");
  var maxBuildingStories = document.getElementById("buildings-max-stories");
  var neighborhoodCount = document.getElementById("buildings-neighborhood-count");
  var resetButton = document.getElementById("reset");

  // "About" menu
  var aboutMenuTitle = document.getElementById("menu-about-title");
  var aboutMenu = document.getElementById("menu-about");

  // Non menu bar elements
  var loadingMessage = document.getElementById("loading-message");
  var navigationControlsContainer = document.getElementById("navigation-controls-container");

  var currentMenu = null;

  var toggleNewCityMenu = function(e) {
    setMenu(NEW_CITY_MENU);

    // Prevent page zoom from double tap on mobile
    e.preventDefault();
  };

  var toggleAboutMenu = function(e) {
    setMenu(ABOUT_MENU);

    // Prevent page zoom from double tap on mobile
    e.preventDefault();
  };

  var setMenu = function(menuID) {
    if (currentMenu === menuID) {
      currentMenu = null;
    }
    else {
      currentMenu = menuID;
    }

    render();
  };

  var reset = function(e) {
    currentMenu = null;
    loadingMessage.classList.add("flex");
    loadingMessage.classList.remove("display-none");
    render();

    // Allow DOM to update to show the "Loading..." message
    setTimeout(function() { messageBroker.publish("generation.started", {}); }, 1);
  };

  var resetPart2 = function() {
    loadingMessage.classList.remove("flex");
    loadingMessage.classList.add("display-none");
  };

  var onFlythroughStarted = function(e) {
    menusContainer.classList.add("display-none");
    currentMenu = null;
    render();
  };

  var onFlythroughStopped = function(e) {
    menusContainer.classList.remove("display-none");
  };

  var hideMenus = function(e) {
    currentMenu = null;
    render();
  };

  var render = function() {
    navigationControlsContainer.classList.toggle("display-none", currentMenu !== null);

    newCityMenuTitle.classList.toggle("menu-title-active", currentMenu === NEW_CITY_MENU);
    newCityMenu.classList.toggle("display-none", currentMenu !== NEW_CITY_MENU);

    aboutMenuTitle.classList.toggle("menu-title-active", currentMenu === ABOUT_MENU);
    aboutMenu.classList.toggle("display-none", currentMenu !== ABOUT_MENU);
  };

  // "New City" menu event handlers
  newCityMenuTitle.addEventListener("click", toggleNewCityMenu, false);
  terrainJitter.addEventListener("change", function(e) { cityConfigService.setHeightJitter(parseInt(e.target.value)); }, false);
  heightJitterDecay.addEventListener("change", function(e) { cityConfigService.setHeightJitterDecay(parseFloat(e.target.value)); }, false);
  hillCount.addEventListener("change", function(e) { cityConfigService.setHillCount(parseInt(e.target.value)); }, false);
  maxHillHeight.addEventListener("change", function(e) { cityConfigService.setMaxHillHeight(parseInt(e.target.value, 10)); }, false);
  includeRiver.addEventListener("change", function(e) { cityConfigService.setIncludeRiver(e.target.checked); }, false);
  maxBuildingStories.addEventListener("change", function(e) { cityConfigService.setMaxBuildingStories(parseInt(e.target.value)); }, false);
  neighborhoodCount.addEventListener("change", function(e) { cityConfigService.setNeighborhoodCount(parseInt(e.target.value)); }, false);
  resetButton.addEventListener("click", reset, false);

  // "About" menu event handlers
  aboutMenuTitle.addEventListener("click", toggleAboutMenu, false);

  var id1 = messageBroker.addSubscriber("flythrough.started", onFlythroughStarted);
  var id2 = messageBroker.addSubscriber("flythrough.stopped", onFlythroughStopped);
  var id3 = messageBroker.addSubscriber("generation.complete", resetPart2);
  var id4 = messageBroker.addSubscriber("touch.focus", hideMenus);

  render();


  return {};
};

export { MenusController };
