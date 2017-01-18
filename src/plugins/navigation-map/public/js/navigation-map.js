(function (window, $, undefined) {
    'use strict';

    var navigationMap;

    navigationMap = function navigationMap(cockpit) {
        console.log("Loading navigation-map plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;

        // for plugin management:
        this.name = 'navigation-map';   // for the settings
        this.viewName = 'navigation-map plugin'; // for the UI
        this.canBeDisabled = true; //allow enable/disable
        this.enable = function () {
            alert('navigation-map enabled');
        };
        this.disable = function () {
            alert('navigation-map disabled');
        };

        // load external scripts dynamically
        $.getScript("latlon-ellipsoidal.js", function(){console.log("latlon-ellipsoidal.js loaded");});
        $.getScript("latlon-vincenty.js", function(){console.log("latlon-vincenty.js loaded");});
        $.getScript("OBJLoader.js", function(){console.log("OBJLoader.js loaded");});
        $.getScript("three.js", function(){console.log("three.js loaded");});
        $.getScript("vector3d.js", function(){console.log("vector3d.js loaded");});
        $.getScript("navigation-map-calculation.js", function(){console.log("navigation-map-calculation.js loaded");});
        $.getScript("navigation-map-visualization.js", function(){console.log("navigation-map-visualization.js loaded");});

        // prepare the renderer
        $("#mainContent").prepend("<div id='navigation-map-renderer'>" +
            "<label class='menu-item'>lat:<input id='lat' value='51.037669'/></label>" +
            "<label class='menu-item'>lon:<input id='lon' value='13.735245'/></label>" +
            "<button class='menu-item' id='start-tracking'>Start tracking</button>" +
            "</div>");

        // on click start tracking: initialize the navigation map lib
        var trackingStarted = false;
        var navMapVis;
        var navMapCalc;
        var startLat;
        var startLon;
        $("#start-tracking").click(function(){
            startLat = $("#lat").val();
            startLon = $("#lon").val();
            $("#navigation-map-renderer").empty();
            // create the visualization
            navMapVis = new NavMapVis();
            // create the calculation with a selected GPS/INS integration method
            navMapCalc = new NavMapCalc(new NoFilter());
            // init the visualization
            navMapVis.init("#navigation-map-renderer");
            navMapVis.animate();

            navMapVis.addBuoyPosition(navMapCalc.calculateNextBuoyPosition(startLat, startLon, 1));
        });

        var self = this;

        // react on new navigation data
        this.cockpit.on('plugin.navigationData.data', function (navdata) {
            if (trackingStarted) {
                // add the new navdata to the map
                var pose = navMapVis.addROVPose(navMapCalc.calculateNextPose(navdata));
                // calculate the next GPS coordinates
                navMapCalc.integrationMethod.calculateNextBuoyCoordinates(pose);
            }
        });
    };

    //This will be called by the input manager automatically
    navigationMap.prototype.listen = function listen() {

    };

    window.Cockpit.plugins.push(navigationMap);

}(window, jQuery));
