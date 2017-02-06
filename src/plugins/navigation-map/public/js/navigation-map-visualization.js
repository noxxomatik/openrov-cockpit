/**
 * Visualization of ROV pose and buoy position on a map.
 *
 * @author Sven Otte
 * @module navigation-map-visualization
 */

/**
 * Continuously visualizes the current ROV pose and buoy position on a map.
 * @param {boolean} useOrientationMode - Whether or not to show only the absolute orientation of the ROV.
 * @constructor
 */
function NavMapVis(useOrientationMode) {
    var scene;
    var camera;
    var renderer;
    var poseHistory = [];
    var buoyHistory = [];
    var cameraDistance = 5;
    var renderFunction;

    // ROV representation
    var rovMesh;
    var rovObject;

    // buoy representation
    var buoyObject;

    // orientation mode
    var useOrientationMode = useOrientationMode;

    /**
     * Initialize the render scene with all helper objects.
     * @param {string} rendererSelector - The id of the DOM-element on which the renderer is appended.
     */
    this.init = function(rendererSelector) {
        // scene dimensions
        var width = $(rendererSelector).width();
        var height = $(rendererSelector).height();
        //dim = width < height ? width : height;

        // scene
        scene = new THREE.Scene();
        //scene.background = new THREE.Color(1, 1, 1);
        //this.createWater();
        this.createROV();

        // camera
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
        if (!useOrientationMode) {
            camera.position.z = cameraDistance;
            camera.position.y = -cameraDistance;
            camera.rotation.x =  1 / 4 * Math.PI;
        }
        else {
            camera.rotation.x =  1 / 2 * Math.PI;
        }

        // light
        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        directionalLight.position.set( -1, 0, 2 ); // target by default is (0,0,0)
        scene.add( directionalLight );

        var light = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( light );

        // grid
        var size = 50;
        var divisions = 100;
        var colorCenterLine = new THREE.Color(1, 0, 0);
        var colorGrid = new THREE.Color(0, 0, 0);
        var gridHelper = new THREE.GridHelper( size, divisions, colorCenterLine, colorGrid);
        gridHelper.rotation.x = 1 / 2 * Math.PI;
        scene.add( gridHelper );

        // axis helper
        /*var axisHelper = new THREE.AxisHelper( 5 );
        scene.add( axisHelper );*/

        // compilation
        renderer = new THREE.WebGLRenderer({alpha: true}); // transparent background
        renderer.setClearColor( 0x000000, 0 );
        renderer.setSize(width, height);

        // append renderer
        $(rendererSelector).append(renderer.domElement);

        // append north
        $(rendererSelector).append("<img src='res/north.svg' width='30px' style='position: absolute; top: 4px; right: 4px'/>");

        renderFunction = this.render;
        this.render();
    };

    /**
     * Start render loop.
     * @private
     */
    this.render = function() {
        requestAnimationFrame( renderFunction );

        // camera follows the ROV
        if (rovObject != undefined) {
            var position = rovObject.getWorldPosition();
            if (!useOrientationMode) {
                camera.matrix.setPosition(new THREE.Vector3(position.x, position.y - cameraDistance, position.z + cameraDistance));
            }
            else {
                camera.matrix.setPosition(new THREE.Vector3(position.x, position.y - cameraDistance, position.z));
            }
            camera.matrixAutoUpdate = false;
            camera.getWorldPosition(); // updates the camera position (updateMatrix doesn't work)
        }

        renderer.render(scene, camera);
    };

    /**
     * Adds a current ROV pose to the scene. The pose gets updated with the position in world space of the visualization.
     * @param {Pose} pose - The pose which shall be added.
     * @returns {Pose} The updated pose.
     */
    this.addROVPose = function(pose) {
        // initialize the ROV object at the center
        if (poseHistory.length < 1) {
            // set the ROV to the initial depth
            rovObject.matrix.setPosition(new THREE.Vector3(0, 0, -(pose.depth)));
            scene.add(rovObject);
        }

        // set rov to the new pose
        rovObject.setRotationFromEuler(new THREE.Euler(pose.roll, pose.pitch, pose.yaw, "XYZ"));
        rovObject.translateX(pose.transX);
        rovObject.translateY(pose.transY);
        rovObject.translateZ(pose.transZ);
        rovObject.updateMatrix();

        // save new position to history
        var position = rovObject.getWorldPosition();
        console.log("position: x=" + position.x + ", y=" + position.y + ", z=" + position.z);
        var savePose = new Pose();
        savePose.x = position.x;
        savePose.y = position.y;
        savePose.z = position.z;
        savePose.roll = pose.roll;
        savePose.pitch = pose.pitch;
        savePose.yaw = pose.yaw;
        poseHistory.push(savePose);

        // create a ghost pose of the last pose
        if (poseHistory.length > 1) {
            var ghostPose = poseHistory[poseHistory.length - 2];
            if(!useOrientationMode){
                this.createGhostROV(ghostPose);
            }
            // draw a line to new pose
            this.drawConnection(ghostPose, savePose, new THREE.Color(1, 1, 0));
        }

        return savePose.clone();
    };

    /**
     * Adds a current buoy position to the scene.
     * @param {Buoy} buoy - The buoy position which shall be added.
     */
    this.addBuoyPosition = function(buoy) {
        // initialize the buoy
        if (buoyHistory.length < 1) {
            this.createBuoy(buoy);
        }

        // set the buoy to the new position
        if (buoy.position.x != null && buoy.position.y != null) {
            buoyObject.matrix.setPosition(new THREE.Vector3(buoy.position.x, buoy.position.y, 0.01));
        }
        // use bearing and distance
        else {
            buoyObject.setRotationFromEuler(new THREE.Euler(0, 0, buoy.position.bearing));
            buoyObject.translateX(buoy.position.distance);
            var position = buoyObject.getWorldPosition();
            buoy.position.x = position.x;
            buoy.position.y = position.y;
        }

        // save new position to history
        var saveBuoy = buoy.clone();
        buoyHistory.push(saveBuoy);

        // create a ghost buoy at the last position
        if (buoyHistory.length > 1) {
            var ghostBuoy = buoyHistory[buoyHistory.length - 2];
            this.createGhostBuoy(ghostBuoy);
        }

        if (typeof callback === "function") {
            callback(saveBuoy.clone());
        }
        return saveBuoy.clone();
    };

    /**
     * Creates the water surface.
     * @private
     */
    this.createWater = function() {
        var waterGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
        var waterMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
        var water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.castShadow = false;
        scene.add(water);
    };

    /**
     * Loads and creates the ROV representation.
     * @private
     */
    this.createROV = function() {
        var loader = new THREE.OBJLoader();
        if (!useOrientationMode) {
            loader.load("plugin/navigation-map/css/dummyrov.obj", function (object) {
                object.children[0].material = new THREE.MeshPhongMaterial({color: 0xff0000});
                object.castShadow = false;
                rovMesh = object.children[0];
                rovObject = object;
            });
        }
        else {
            loader.load("plugin/navigation-map/css/openrov.obj", function (object) {
                object.children[0].material = new THREE.MeshPhongMaterial({color: 0xff0000});
                object.castShadow = false;
                rovMesh = object.children[0];
                rovObject = object;
            });
        }
    };

    /**
     * Creates a ghost ROV pose on the map.
     * @param {Pose} pose - The pose at which the ghost shall be created.
     */
    this.createGhostROV = function(pose) {
        var ghostMaterial = new THREE.MeshPhongMaterial({color: 0xffff00, transparent: true, opacity: 0.2});
        var ghost = new THREE.Mesh(rovMesh.geometry.clone(), ghostMaterial);
        ghost.castShadow = false;
        ghost.matrixAutoUpdate = false;
        ghost.setRotationFromEuler(new THREE.Euler(pose.roll, pose.pitch, pose.yaw));
        ghost.updateMatrix();
        ghost.matrix.setPosition(new THREE.Vector3(pose.x, pose.y, pose.z));
        scene.add(ghost);
    };

    /**
     * Creates a connecting line between two poses.
     * @param {Pose} startPose - Pose where the line starts.
     * @param {Pose} targetPose - Pose where the line ends.
     * @param {THREE.Color} color - Color of the line.
     * @private
     */
    this.drawConnection = function(startPose, targetPose, color) {
        var lineMaterial = new THREE.LineBasicMaterial({color: color.getHex()});
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(new THREE.Vector3(startPose.x, startPose.y, startPose.z));
        lineGeometry.vertices.push(new THREE.Vector3(targetPose.x, targetPose.y, targetPose.z));
        var line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
    };

    /**
     * Creates a buoy representation on the map.
     * @param {Buoy} buoy - Buoy position where the representation shall be added.
     */
    this.createBuoy = function(buoy){
        var buoyMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00, transparent: true, opacity: 0.5});
        var buoyGeometry = new THREE.CircleBufferGeometry(buoy.coordinates.accuracy, 16);
        buoyObject = new THREE.Mesh(buoyGeometry, buoyMaterial);
        buoyObject.castShadow = false;
        buoyObject.matrixAutoUpdate = false;
        scene.add(buoyObject);
    };

    /**
     * Creates a ghost buoy representation on the map.
     * @param {Buoy} buoy - Buoy position where the ghost representation shall be added.
     */
    this.createGhostBuoy = function(buoy){
        var buoyMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00, transparent: true, opacity: 0.2});
        var buoyGeometry = new THREE.CircleBufferGeometry(buoy.coordinates.accuracy, 16);
        buoyObject = new THREE.Mesh(buoyGeometry, buoyMaterial);
        buoyObject.castShadow = false;
        buoyObject.matrixAutoUpdate = false;
        scene.add(buoyObject);
    };

    /**
     * Lets the camera zoom into the map.
     */
    this.zoomIn = function() {
        cameraDistance -= 0.1;
    };

    /**
     * Lets the camera zoom out of the map.
     */
    this.zoomOut = function() {
        cameraDistance += 0.1;
    };
}
