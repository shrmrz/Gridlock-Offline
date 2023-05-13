/**
 *
 *
 *
 * *************************************************************
 * *************************************************************
 *
 * User Defined Settings
 * (options displayed when user clicks settings icon)
 *
 * *************************************************************
 * *************************************************************
 *
 *
 *
 **/

/***************************************************************
 *
 * Mutable Values
 *
 **************************************************************/

/**
 * Name of the Map
 * scenarioString needed in
 * (1) showInfo (control_gui) if info panels are shown
 * (2) road: handle some exceptional behavior in the "*BaWue*" scenarios
 * otherwise not needed
 */
var scenarioString = "OffRamp";

/**
 * @purpose enable/disbale debugging feature / console messaging
 * if true, then sim stops after each vehicular crash (for testing)
 * Mainly for developers
 * Set =false for public deployment)
 */
var debug = false;

/**
 * @purpose enables droppable items to be added to the canvas (such as speed limits, lights, etc.)
 */
const userCanDropObjects = true;

/**
 * @purpose show logical coords of nearest road to mouse pointer
 * definition => showLogicalCoords(.) in canvas_gui.js
 * @dependency canvas_gui.js
 */
var showCoords = true;

/**
 * @purpose draw each vehicle id number above each vehicle in simulation
 * @dependency control_gui.js
 */
drawVehIDs = false;

/**
 * @description draw the road id number on each road in simulation
 * @bug this (if set to true does not change the map to show road id)
 * @solution need to call later road.drawVehIDs=drawVehIDs
 * @dependency control_gui.js
 */
drawRoadIDs = false;

var obstacleImgs = [];
var obstacleImgNames = [];
/** *************************************************************
 * dynamic values
 */

// min speed for speed colormap (drawn in red)
var vmin_col = 0;

/**
 * max speed for speed colormap (drawn in blue-violet)
 */
var vmax_col = 100 / 3.6;

// true only if user-driven geometry changes
var userCanvasManip;

/***************************************************************
 * * Static Values
 */

var drawColormap = false;

// window dimensions have changed (responsive design)
var hasChanged = true;

// if false, only vehicles are drawn
var drawRoad = true;

// if false, default unicolor background
var drawBackground = true;

// min speed for speed colormap (drawn in red)
var vmin_col = 0;

// max speed for speed colormap (drawn in blue-violet)
var vmax_col = 100 / 3.6;

/** *************************************************************
 * @description run-time specification and functions
 */

var time = 0;
var itime = 0;

// frames per second (unchanged during runtime)
var fps = 30;

/**
 * @name CritAspectRatio
 * @description defines the aspect ratio used for defining the size of the canvas
 *
 * should be consistent with width/height in css (#contents)
 *      the higher, the longer sim window
 *
 * must be the same as in css:
 *      max-aspect-ratio: 24/19 etc.
 */
var critAspectRatio = 24 / 19;

/** ****************************************************************
 * @description specification of road and vehicle sizes
 * the following remains constant
 * road already becomes more compact for smaller screens
 */

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

var nLanes_nf = 4;

var nLanes_fs = 4;

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
