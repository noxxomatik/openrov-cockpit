function mobileControls(name, deps)
{
  console.log('Mobile controls plugin loaded.');

  this.plugin =
  {
    name: "mobile-controls",
    type: "controls"
  };
}

module.exports = function(name,deps)
{
  return new mobileControls(name,deps);
};
