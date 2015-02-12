var React = require('react/addons');
var {pickColor} = require('../helpers/application_helper');
var DesiredLrp = require('./desired_lrp');
var cx = React.addons.classSet;

var types = React.PropTypes;

var Sidebar = React.createClass({
  propTypes: {
    $receptor: types.object.isRequired
  },

  contextTypes: {
    colors: types.array.isRequired
  },

  render() {
    var {$receptor} = this.props;
    var desiredLrps = ($receptor.get('desiredLrps') || []).map(function(desiredLrp, i) {
      var key = desiredLrp.process_guid;
      var containerColor = pickColor(this.context.colors, key);
      var odd = i % 2;
      var className = cx({'bg-dark-1': odd, 'bg-dark-2': !odd});
      var props = {className, containerColor, desiredLrp, key};
      return <DesiredLrp {...props}/>;
    }, this);

    return <div>{desiredLrps}</div>
  }
});

module.exports = Sidebar;