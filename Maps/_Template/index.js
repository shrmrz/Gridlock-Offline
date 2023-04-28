/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * @section General debug settings
 * @dependency debug.js
 * @done
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

if (debug) {
  console.log("\n\nstart main: scenarioString=", scenarioString);
  /**
   * @todo add explainer comment
   */
  var crashinfo = new CrashInfo();
}

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * @section Define Canvas variables/objects by connecting to the html elements/objects
 * @done
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

/**
 * define simulation-Div-Window (simDivWindow) - the parent html (div) element that contains the canvas element
 */
var simDivWindow = document.getElementById("contents");

/**
 * define canvas (canvas) - the html element that draws the simulation,
 */
var canvas = document.getElementById("canvas");

/**
 * define graphics context (ctx) - the context specific to the canvas used for rendering frames,
 */
var ctx = canvas.getContext("2d");

/**
 * configure canvas element to take up the same screen dimensions as the parent div element (#contents)
 */
canvas.width = simDivWindow.clientWidth;
canvas.height = simDivWindow.clientHeight;

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * @section Add touch listeners
 * @done
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

/**
 * best approach to only run the console log if the debug flag is set to true
 */
void (
  debug &&
  console.log(
    "Attempting to run addTouchListeners() in " + scenarioString + ".js"
  )
);

/**
 * for mobile interactions / functionality
 * @dependency canvas_gui.js
 */
addTouchListeners();

void (
  debug &&
  console.log(
    "Successfully ran addTouchListeners() in " + scenarioString + ".js"
  )
);

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * @section Run-time calculations
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

var dt = timewarp / fps;

/**
 *  calculate the aspect ratio of the canvas
 */
var aspectRatio = canvas.width / canvas.height;

/**
 Global overall scenario settings and graphics objects

 refSizePhys  => reference size in m (generally smaller side of canvas)
 refSizePix   => reference size in pixel (generally smaller side of canvas)
 scale = refSizePix/refSizePhys 
       => roads have full canvas regardless of refSizePhys, refSizePix

 (1) refSizePix=Math.min(canvas.width, canvas.height) determined during run  

 (2) refSizePhys smaller  => all phys roadlengths smaller
  => vehicles and road widths appear bigger for a given screen size 
  => chose smaller for mobile, 

  NOTICE: Unless refSizePhys is constant during sim,  
  updateDimensions needs to re-define  
  the complete infrastructure geometry at every change



  Example: refSizePhys propto sqrt(refSizePix) => roads get more compact 
  and vehicles get smaller, both on a sqrt basis

  Or jump at trigger refSizePix<canvasSizeCrit propto clientSize 
  => css cntrl normal/mobile with 2 fixed settings

  NOTICE: canvas has strange initialization of width=300 in firefox 
  and DOS when try sizing in css (see there) only 
 
  document.getElementById("contents").clientWidth; .clientHeight;
  always works!

*/
/**
 * @name refSizePix
 * @constant
 * @description defines the refernce size of the canvas in pixels
 *
 * all objects scale with refSizePix (also adapts in updateDimensions)
 *
 * css/styleTrafficSimulationDe.css:
 *    canvas width:  112vmin; height: 100vmin;
 */
var refSizePix = Math.min(canvas.height, canvas.width / critAspectRatio);

/**
 * run media query to determine if the screen is a smartphone screen
 */
var isSmartphone = mqSmartphone();

/**
 * @name refSizePhys
 * @description defines the physical refernce size of the canvas based on if it is being displayed on a mobile device i.e. smartphones
 */
var refSizePhys = isSmartphone ? 150 : 250;

/**
 * @name scale
 * @description defines the scale / relationship between  refSizePix and refSizePhys
 */
var scale = refSizePix / refSizePhys;

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * @section Variables
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/
const PI = Math.PI;

/** ****************************************************************
 * @description specification of road and vehicle sizes
 * the following remains constant
 * road already becomes more compact for smaller screens
 */

/**
 * define the number of lanes each road has
 */
var nLanes_wf = 3;
var nLanes_ef = 3;
// var nLanes_er = 1;
// var nLanes_nf = 3;
// var nLanes_fs = 3;

/**
 * IC
 * @description density of how many cars are on the road when simulation starts
 */
density = 0.015;

/** ****************************************************************
 * @description Override defaults / set control_gui parameters
 * @dependency control_gui.js
 */

/**
 * @todo no clue what these do
 */
MOBIL_mandat_bSafe = 22; // standard 42
MOBIL_mandat_bThr = 0;
MOBIL_mandat_bias = 22;

// to allow faster slowing down of the uphill trucks
factor_a_truck = 1;

/** ****************************************************************
 * @description stochasticity settings
 * also see (acceleration noise spec at top of models.js)
 */

/**
 * v0 and a coeff of variation (of "agility")
 * need later override road setting by
 * calling road.setDriverVariation(.);
 *
 * seems to affect the "flow" of traffic i.e. the coeffecient that determines how smoothly / similarly drivers drive / flow together
 */
var driver_varcoeff = 0.15;

/** ****************************************************************
 * @description Specification of physical road geometry and vehicle properties
 *
 * If viewport or refSizePhys changes, then change them all by calling updateDimensions();
 *
 * All "Rel" (relative) settings are calculated with respect to refSizePhys (NOT refSizePix)
 */

var center_xPhys = center_xRel * refSizePhys; //[m]
var center_yPhys = center_yRel * refSizePhys;

var arcRadius = arcRadiusRel * refSizePhys;
var arcLen = arcRadius * PI;
var straightLen = refSizePhys * critAspectRatio - center_xPhys;
var mainroadLen = arcLen + 2 * straightLen;

var offLen = offLenRel * refSizePhys;
var divergeLen = 0.3 * offLen;

var mainRampOffset = 100; // mainroadLen - straightLen;
var taperLen = 0.1 * offLen;
var offRadius = 1 * arcRadius;

var isRing = false; // 0: false; 1: true

var fracTruckToleratedMismatch = 1.0; // 100% allowed => changes only by sources

/**
 * @description IC for speed
 * @todo write description for this variable
 */
var speedInit = 20;

// anticipation distance for applying mandatory LC rules
var duTactical = 310;

/**
 * define the lane width for each road
 */
var laneWidth = 7;

/**
 * define the number of lanes each road has
 */
var nLanes_wf = 4;

var nLanes_ef = 4;
var nLanes_er = 1;

// var nLanes_nf = 4;

// var nLanes_sf = 4;

/**
 * define car size (in meters)
 */
var car_length = 7;
var car_width = 5;

/**
 * define truck size (in meters)
 */
var truck_length = 15;
var truck_width = 7;

/** ****************************************************************
 * @description Specification of physical road geometry and vehicle properties
 *
 * If viewport or refSizePhys changes, then change them all by calling updateDimensions();
 *
 * All "Rel" (relative) settings are calculated with respect to refSizePhys (NOT refSizePix)
 */
var center_xRel = 0.43;
var center_yRel = -0.54;
var arcRadiusRel = 0.35;
var offLenRel = 0.95;

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * Define Roads and Trajectories
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

// road network (network declared in canvas_gui.js)

/**
 * east freeway
 */
var id_east_freeway = 1;
function east_freeway_trajectory_x(u) {
  return u;
}
function east_freeway_trajectory_y(u) {
  return -100;
}
var east_freeway_trajectory = [
  east_freeway_trajectory_x,
  east_freeway_trajectory_y,
];
var east_freeway = new road(
  id_east_freeway,
  mainroadLen,
  laneWidth,
  nLanes_ef,
  east_freeway_trajectory,
  density,
  speedInit,
  fracTruck,
  isRing
);
network[0] = east_freeway;

/**
 * east offramp
 */
var id_east_ramp1 = 2;
function east_ramp1_trajectory_x(u) {
  var xDivergeBegin = east_freeway_trajectory_x(mainRampOffset);
  return u < divergeLen
    ? xDivergeBegin + u
    : xDivergeBegin +
        divergeLen +
        offRadius * Math.sin((u - divergeLen) / offRadius);
}
function east_ramp1_trajectory_y(u) {
  var yDivergeBegin =
    east_freeway_trajectory_y(mainRampOffset) -
    0.5 * laneWidth * (nLanes_78e + nLanes_er) -
    0.02 * laneWidth;
  return u < taperLen
    ? yDivergeBegin + laneWidth - (laneWidth * u) / taperLen
    : u < divergeLen
    ? yDivergeBegin
    : yDivergeBegin - offRadius * (1 - Math.cos((u - divergeLen) / offRadius));
}
var east_ramp1_trajectory = [east_ramp1_trajectory_x, east_ramp1_trajectory_y];
var east_ramp1 = new road(
  id_east_ramp1,
  offLen,
  laneWidth,
  nLanes_er,
  east_ramp1_trajectory,
  0.1 * density,
  speedInit,
  fracTruck,
  isRing
);
network[1] = east_ramp1;

/**
 * west freeway
 */
var id_west_freeway = 3;
function west_freeway_trajectory_x(u) {
  return -u + 400;
}
function west_freeway_trajectory_y(u) {
  return -60;
}
var west_freeway_trajectory = [
  west_freeway_trajectory_x,
  west_freeway_trajectory_y,
];
var west_freeway = new road(
  id_west_freeway,
  mainroadLen,
  laneWidth,
  nLanes_wf,
  west_freeway_trajectory,
  density,
  speedInit,
  fracTruck,
  isRing
);
network[2] = west_freeway;

// /**
//  * south freeway
//  */
// var id_south_freeway = 4;
// function south_freeway_trajectory_x(u) {
//   return 60;
// }
// function south_freeway_trajectory_y(u) {
//   return u;
// }
// var south_freeway_trajectory = [
//   south_freeway_trajectory_x,
//   south_freeway_trajectory_y,
// ];
// var south_freeway = new road(
//   id_south_freeway,
//   mainroadLen,
//   laneWidth,
//   nLanes_sf,
//   south_freeway_trajectory,
//   density,
//   speedInit,
//   fracTruck,
//   isRing
// );
// network[3] = south_freeway;

// /**
//  * north freeway
//  */
// var id_north_freeway = 5;
// function north_freeway_trajectory_x(u) {
//   return -60;
// }
// function north_freeway_trajectory_y(u) {
//   return -u + 400;
// }
// var north_freeway_trajectory = [
//   north_freeway_trajectory_x,
//   north_freeway_trajectory_y,
// ];
// var north_freeway = new road(
//   id_north_freeway,
//   mainroadLen,
//   laneWidth,
//   nLanes_nf,
//   north_freeway_trajectory,
//   density,
//   speedInit,
//   fracTruck,
//   isRing
// );
// network[4] = north_freeway;

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * Created (Logical) Road Network(s)
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

for (var ir = 0; ir < network.length; ir++) {
  network[ir].setDriverVariation(driver_varcoeff);
  network[ir].drawVehIDs = drawVehIDs;
}

var offrampIDs = [2];
var offrampLastExits = [mainRampOffset + divergeLen];
var offrampToRight = [true];

east_freeway.setOfframpInfo(offrampIDs, offrampLastExits, offrampToRight);
east_freeway.duTactical = duTactical;

north_freeway.setOfframpInfo(offrampIDs, offrampLastExits, offrampToRight);
north_freeway.duTactical = duTactical;

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * Created Routes
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

// vehicle stays on east_freeway
var route_e = [1];
// vehicle takes offramp
var route_es = [1, 2];
var route_nw = [1, 2];

var route_w = [3];
var route_n = [4];
var route_s = [5];

for (var i = 0; i < west_freeway.veh.length; i++) {
  west_freeway.veh[i].route = route_w;
  // output for debugging
  void (
    debug &&
    console.log(
      "west_freeway.veh[" + i + "].route=" + west_freeway.veh[i].route
    )
  );
}

for (var i = 0; i < east_freeway.veh.length; i++) {
  east_freeway.veh[i].route = Math.random() < fracOff ? route_es : route_e;
  // output for debugging
  void (
    debug &&
    console.log(
      "east_freeway.veh[" + i + "].route=" + east_freeway.veh[i].route
    )
  );
}

// for (var i = 0; i < north_freeway.veh.length; i++) {
//   north_freeway.veh[i].route = route_n;
//   // output for debugging
//   void (
//     debug &&
//     console.log(
//       "north_freeway.veh[" + i + "].route=" + north_freeway.veh[i].route
//     )
//   );
// }

// for (var i = 0; i < south_freeway.veh.length; i++) {
//   south_freeway.veh[i].route = route_s;
//   // output for debugging
//   void (
//     debug &&
//     console.log(
//       "south_freeway.veh[" + i + "].route=" + south_freeway.veh[i].route
//     )
//   );
// }

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * Simulator Functions
 * @done
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

/**
 * @description
 * @done
 */
function updateDimensions() {
  void (debug && console.log("Updating Dimensions..."));

  // recalculate if viewport or sizePhys changes
  center_xPhys = center_xRel * refSizePhys;
  center_yPhys = center_yRel * refSizePhys;

  void (
    debug &&
    console.log(" mainroadLen=", mainroadLen) &&
    console.log(
      "updateDimensions: mainroadLen=",
      mainroadLen,
      " isSmartphone=",
      isSmartphone
    ) &&
    console.log("Done Updating Dimensions")
  );
}
/**
 * @description
 * @done
 */
function updateSim() {
  // (1) update times and, if canvas change,
  // scale and, if smartphone<->no-smartphone change, physical geometry

  time += dt; // dt depends on timewarp slider (fps=const)
  itime++;

  /**
   * Called from media.js
   */
  isSmartphone = mqSmartphone();

  // north_freeway.updateTruckFrac(fracTruck, fracTruckToleratedMismatch);
  // north_freeway.updateModelsOfAllVehicles(
  //   longModelCar,
  //   longModelTruck,
  //   LCModelCar,
  //   LCModelTruck,
  //   LCModelMandatory
  // );

  // south_freeway.updateTruckFrac(fracTruck, fracTruckToleratedMismatch);
  // south_freeway.updateModelsOfAllVehicles(
  //   longModelCar,
  //   longModelTruck,
  //   LCModelCar,
  //   LCModelTruck,
  //   LCModelMandatory
  // );

  west_freeway.updateTruckFrac(fracTruck, fracTruckToleratedMismatch);
  west_freeway.updateModelsOfAllVehicles(
    longModelCar,
    longModelTruck,
    LCModelCar,
    LCModelTruck,
    LCModelMandatory
  );

  // (2) transfer effects from slider interaction and mandatory regions
  // to the vehicles and models

  east_freeway.updateTruckFrac(fracTruck, fracTruckToleratedMismatch);
  east_freeway.updateModelsOfAllVehicles(
    longModelCar,
    longModelTruck,
    LCModelCar,
    LCModelTruck,
    LCModelMandatory
  );
  east_ramp1.updateTruckFrac(fracTruck, fracTruckToleratedMismatch);
  east_ramp1.updateModelsOfAllVehicles(
    longModelCar,
    longModelTruck,
    LCModelCar,
    LCModelTruck,
    LCModelMandatory
  );

  /**
   * updateSim (2a):
   * update moveable speed limits
   */

  for (var i = 0; i < network.length; i++) {
    network[i].updateSpeedlimits(trafficObjs);
  }

  /**
   * updateSim (2b):
   * without this zoomback cmd, everything works but depot vehicles
   * just stay where they have been dropped outside of a road
   * (here more responsive than in drawSim)
   */
  if (userCanDropObjects && !isSmartphone && !trafficObjPicked) {
    trafficObjs.zoomBack();
  }

  /**
   * updateSim (3):
   * do central simulation update of vehicles
   */

  // north_freeway.updateLastLCtimes(dt);
  // north_freeway.calcAccelerations();
  // north_freeway.changeLanes();
  // north_freeway.updateSpeedPositions();
  // north_freeway.updateBCdown();
  // north_freeway.updateBCup(qIn, dt, route_n); // qIn=total inflow, route opt. arg.

  // south_freeway.updateLastLCtimes(dt);
  // south_freeway.calcAccelerations();
  // south_freeway.changeLanes();
  // south_freeway.updateSpeedPositions();
  // south_freeway.updateBCdown();
  // south_freeway.updateBCup(qIn, dt, route_s); // qIn=total inflow, route opt. arg.

  west_freeway.updateLastLCtimes(dt);
  west_freeway.calcAccelerations();
  west_freeway.changeLanes();
  west_freeway.updateSpeedPositions();
  west_freeway.updateBCdown();
  west_freeway.updateBCup(qIn, dt, route_w); // qIn=total inflow, route opt. arg.

  east_freeway.updateLastLCtimes(dt);
  east_freeway.calcAccelerations();
  east_freeway.changeLanes();
  east_freeway.updateSpeedPositions();
  east_freeway.updateBCdown();
  var route = Math.random() < fracOff ? route_es : route_e;
  east_freeway.updateBCup(qIn, dt, route); // qIn=total inflow, route opt. arg.
  //east_freeway.writeVehicleRoutes(0.5*east_freeway.roadLen,east_freeway.roadLen);//!!!

  east_ramp1.updateLastLCtimes(dt); // needed since LC from main road!!
  east_ramp1.calcAccelerations();
  east_ramp1.updateSpeedPositions();
  east_ramp1.updateBCdown();

  //template: mergeDiverge(newRoad,offset,uStart,uEnd,isMerge,toRight)
  var u_antic = 20;
  east_freeway.mergeDiverge(
    east_ramp1,
    -mainRampOffset,
    mainRampOffset + taperLen,
    mainRampOffset + divergeLen - u_antic,
    false,
    true
  );

  /**
   * UpdateSim (4):
   * update detector readings
   */

  // nothing here

  /**
   * UpdateSim (5):
   * debug output
   */
  if (debug) {
    crashinfo.checkForCrashes(network);
    console.log("\n\nitime=", itime, ": end of updateSim loop");
    console.log(
      "mainroadLen=",
      formd(mainroadLen),
      " east_freeway.roadLen=",
      formd(east_freeway.roadLen),
      " east_freeway.offrampLastExits=",
      formd(east_freeway.offrampLastExits),
      " east_ramp1.roadLen=",
      formd(east_ramp1.roadLen),
      " mainRampOffset=",
      formd(mainRampOffset)
    );
    console.log(
      "mergeDiverge(east_ramp1",
      ",",
      formd(-mainRampOffset),
      ",",
      formd(mainRampOffset + taperLen),
      ",",
      formd(mainRampOffset + divergeLen - u_antic),
      ")"
    );
    console.log("\nmainroad vehicles:");
    east_freeway.writeVehiclesSimple();
    east_ramp1.writeVehiclesSimple();

    onlyTL = true;
    trafficObjs.writeObjects(onlyTL); //the trafficObjs general TL objects
    onlyTL = true;
    east_freeway.writeTrafficLights(); // the road's operational TL objects
    east_ramp1.writeTrafficLights();
    east_freeway.writeDepotVehObjects();
    east_ramp1.writeDepotVehObjects();
  }
} // end of updateSim function

/**
 * @description
 * @done
 */
function drawSim() {
  // (0) redefine graphical aspects of road (arc radius etc) using
  // responsive design if canvas has been resized
  // isSmartphone defined in updateSim
  var relTextsize_vmin = isSmartphone ? 0.03 : 0.02; //xxx
  var textsize = relTextsize_vmin * Math.min(canvas.width, canvas.height);

  if (debug) {
    console.log(
      " new total inner window dimension: ",
      window.innerWidth,
      " X ",
      window.innerHeight,
      " (full hd 16:9 e.g., 1120:630)",
      " canvas: ",
      canvas.width,
      " X ",
      canvas.height
    );
  }

  //updateDimensions();

  if (
    canvas.width != simDivWindow.clientWidth ||
    canvas.height != simDivWindow.clientHeight
  ) {
    hasChanged = true;
    canvas.width = simDivWindow.clientWidth;
    canvas.height = simDivWindow.clientHeight;
    aspectRatio = canvas.width / canvas.height;
    refSizePix = Math.min(canvas.height, canvas.width / critAspectRatio);

    scale = refSizePix / refSizePhys; // refSizePhys=constant unless mobile

    updateDimensions();

    trafficObjs.calcDepotPositions(canvas);

    if (debug) {
      console.log(
        "haschanged=true: new canvas dimension: ",
        canvas.width,
        " X ",
        canvas.height
      );
    }
  }

  // (1) update heading of all vehicles rel. to road axis
  // (for some reason, strange rotations at beginning)

  // (2) reset transform matrix and draw background
  // (only needed if changes, plus "reminders" for lazy browsers)

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (drawBackground) {
    if (
      hasChanged ||
      itime <= 10 ||
      itime % 50 == 0 ||
      userCanvasManip ||
      !drawRoad ||
      drawVehIDs
    ) {
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      if (debug) {
        console.log(
          "itime=",
          itime,
          " hasChanged=",
          hasChanged,
          " userCanvasManip=",
          userCanvasManip,
          " movingObserver=",
          movingObserver,
          " before drawing background"
        );
        console.log(
          " new total inner window dimension: ",
          window.innerWidth,
          " X ",
          window.innerHeight,
          " (full hd 16:9 e.g., 1120:630)",
          " canvas: ",
          canvas.width,
          " X ",
          canvas.height
        );
      }
    }
  }

  // (3) draw east_freeway and east_ramp1 (offramp "bridge" => draw last)
  // and vehicles (directly after frawing resp road or separately, depends)

  // (always drawn; changedGeometry only triggers making a new lookup table)

  //!! all args at and after umin,umax=0,east_ramp1.roadLen are optional
  // here only example for complete args (only in coffeemeterGame relevant
  // !!! DOS in road.draw, OK in road.drawVehicles

  var changedGeometry = userCanvasManip || hasChanged || itime <= 1;

  // (4) draw vehicles
  east_ramp1.draw(rampImg, rampImg, scale, changedGeometry);
  east_freeway.draw(roadImg1, roadImg2, scale, changedGeometry);
  west_freeway.draw(roadImg1, roadImg2, scale, changedGeometry);
  // north_freeway.draw(roadImg1, roadImg2, scale, changedGeometry);
  // south_freeway.draw(roadImg1, roadImg2, scale, changedGeometry);

  east_ramp1.drawVehicles(
    carImg,
    truckImg,
    obstacleImgs,
    scale,
    vmin_col,
    vmax_col
  );
  east_freeway.drawVehicles(
    carImg,
    truckImg,
    obstacleImgs,
    scale,
    vmin_col,
    vmax_col
  );
  west_freeway.drawVehicles(
    carImg,
    truckImg,
    obstacleImgs,
    scale,
    vmin_col,
    vmax_col
  );
  // north_freeway.drawVehicles(
  //   carImg,
  //   truckImg,
  //   obstacleImgs,
  //   scale,
  //   vmin_col,
  //   vmax_col
  // );
  // south_freeway.drawVehicles(
  //   carImg,
  //   truckImg,
  //   obstacleImgs,
  //   scale,
  //   vmin_col,
  //   vmax_col
  // );
  // (5a) draw traffic objects
  if (userCanDropObjects && !isSmartphone) {
    trafficObjs.draw(scale);
  }

  // (5b) draw speedlimit-change select box
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawSpeedlBox();

  // drawSim (6) draw some running-time vars
  // show simulation time and detector displays
  // @dependency called from timeView.js
  displayTime(time, textsize);

  // drawSim (7): show logical coordinates if activated
  if (showCoords && mouseInside) {
    showLogicalCoords(xPixUser, yPixUser);
  }

  // drawSim (8): reset/revert variables for the next step

  // may be set to true in next step if changed canvas
  // (updateDimensions) or if old sign should be wiped away

  hasChanged = false;

  // revert to neutral transformation at the end!
  ctx.setTransform(1, 0, 0, 1, 0, 0);
} // end of drawSim function

/**
 * @description Running function of the simulator's thread (triggered by setInterval)
 * @done
 */
function main_loop() {
  updateSim();
  drawSim();
  userCanvasManip = false;
}

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * Declare traffic objects and traffic-light control editor
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

/**
 * need to define canvas prior to calling cstr: e.g.,
 * TrafficObjects(canvas,nTL,nLimit,xRelDepot,yRelDepot,nRow,nCol)
 */
var trafficObjs = new TrafficObjects(canvas, 2, 2, 0.35, 0.15, 3, 2);

/**
 * also needed to just switch the traffic lights
 * (then args xRelEditor,yRelEditor not relevant)
 */
var trafficLightControl = new TrafficLightControlEditor(trafficObjs, 0.5, 0.5);

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * @section Menu_Sliders
 * @description Used for respoonding to User Configurations. Defines pre-set values for html slider (input) elements
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

/*************************************************************
 * adapt standard slider settings from control_gui.js
 * (sliders with default inits need not to be reassigned here)
 * and define variables w/o sliders in this scenario
 *************************************************************/

/**********************************************************
 * @name Offramp_Flow_Slider
 * @description
 */

/**
 * @initial 25%
 */
fracOff = 0.25;

setSlider(slider_fracOff, slider_fracOffVal, 100 * fracOff /* 25% */, 0, "%");

/**********************************************************
 * @name Inflow_Slider
 * @description
 */

/**
 * @initial 4000 / 3600 = 1.11
 */
qIn = 4600 / 3600;
commaDigits = 0;

setSlider(slider_qIn, slider_qInVal, 3600 * qIn, commaDigits, "veh/h");

/**********************************************************
 * @name Truck_Perc_Slider
 * @description
 */

/**
 * @initial 15%
 */
fracTruck = 0.15;

setSlider(slider_fracTruck, slider_fracTruckVal, 100 * fracTruck, 0, "%");

/**********************************************************
 * @name Max_Accel_A_Slider
 * @description
 */

/**
 * @initial 70%
 */
IDM_a = 0.7; // low to allow stopGo

setSlider(slider_IDM_a, slider_IDM_aVal, IDM_a, 1, "m/s<sup>2</sup>");

/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * Simulator Execution
 * @done
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

void (debug && console.log("first main execution"));

/**
 * initialize the model(s)
 * models and methods override control_gui.js
 *
 * define longModelCar,-Truck,LCModelCar,-Truck,-Mandatory
 */
updateModels();

/**
 * @todo change to showInfoString() plus strings defined inline or as external .js scripts
 * (external scripts will need to be added to the maps html page)
 *
 * works locally - See golfCourse.js.
 *
 * the command "showInfoString should be placed in control_gui.js;
 * @dependency control_gui.js
 */
showInfo();

/**
 * @purpose start the simulation process / thread
 *
 * Triggers:
 *      (i) automatically when loading the simulation
 *      (ii) when pressing the start button in *gui.js
 */
var myRun = setInterval(main_loop, 1000 / fps);
