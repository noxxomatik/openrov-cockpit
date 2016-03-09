(function(window) 
{
  'use strict';
  
  var plugins = namespace('plugins');
  
  console.log('Loading mobile controls plugin in the browser.');
  
  plugins.mobileControls = function(cockpit)
  {
    var self = this;
    self.cockpit = cockpit;
  };

  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  plugins.mobileControls.prototype.listen = function listen() 
  {
    // var self = this;

    // self.cockpit.rov.withHistory.on('plugin.mobileControls.state', function(state) {
    //   self.cockpit.emit('plugin.mobileControls.state',state);
    // });

    // self.cockpit.on('plugin.mobileControls.set',function(value){
    //     cockpit.rov.emit('plugin.mobileControls.set',value);
    // });

  };

  window.Cockpit.plugins.push( plugins.mobileControls );

})(window);
