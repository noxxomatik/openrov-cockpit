(function (window, $, undefined) {
    'use strict';

    var navigationTest;

    navigationTest = function navigationTest(cockpit) {
        console.log("Loading navigation-test plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;

        // for plugin management:
        this.name = 'navigation-test';   // for the settings
        this.viewName = 'navigation-test plugin'; // for the UI
        this.canBeDisabled = true; //allow enable/disable
        this.enable = function () {
            alert('navigation-test enabled');
        };
        this.disable = function () {
            alert('navigation-test disabled');
        };

        var self = this;

        // react on new navigation data
        this.cockpit.on('plugin.navigationData.data', function (navdata) {
            if ($("#navigation-data").length < 1) {
                $("#mainContent").prepend(
                    "<div id='navigation-data' class='alert alert-info' role='alert' "
                    + "style='display: inline-block; position: absolute; z-index: 10; font-size: x-small'>"
                    + "</div>"
                );
            }
            $("#navigation-data").html(
                "Heading " + navdata.heading + "<br/>"
                + "Depth " + navdata.deapth + "<br/>"
                + "Pitch " + navdata.pitch + "<br/>"
                + "Roll " + navdata.roll + "<br/>"
                + "Yaw " + navdata.yaw + "<br/>"
                + "Thrust " + navdata.thrust + "<br/>"
                + "AccX " + navdata.acclx + "<br/>"
                + "AccY " + navdata.accly + "<br/>"
                + "AccZ " + navdata.acclz + "<br/>"
                + "MagX " + navdata.magx + "<br/>"
                + "MagY " + navdata.magy + "<br/>"
                + "MagZ " + navdata.magz + "<br/>"
                + "GyroX " + navdata.gyrox + "<br/>"
                + "GyroY " + navdata.gyroy + "<br/>"
                + "GyroZ " + navdata.gyroz + "<br/>"
                + "LAcclX " + navdata.lacclx + "<br/>"
                + "LAcclY " + navdata.laccly + "<br/>"
                + "LAcclZ " + navdata.lacclz + "<br/>"
                + "GravX " + navdata.gravx + "<br/>"
                + "GravY " + navdata.gravy + "<br/>"
                + "GravZ " + navdata.gravz + "<br/>"
            );
        });
    };

    //This will be called by the input manager automatically
    navigationTest.prototype.listen = function listen() {

    };

    window.Cockpit.plugins.push(navigationTest);

}(window, jQuery));
