var DesiredLrp = require('./desired_lrp');
var PureRenderMixin = require('../mixins/pure_render_mixin');
var React = require('react/addons');
var SidebarHeader = require('./sidebar_header');
var {filterDesiredLrps} = require('../helpers/lrp_helper');

var types = React.PropTypes;

var DesiredLrpList = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    $receptor: types.object.isRequired,
    $selection: types.object.isRequired,
    $sidebar: types.object.isRequired
  },

  renderDesiredLrps(desiredLrps) {
    var {$receptor, $selection} = this.props;
    var {actualLrps} = $receptor.get();
    actualLrps = actualLrps || [];

    if(!desiredLrps.length) {
      return <div className="mam">No filtered processes found.</div>;
    }

    return desiredLrps.map(function(desiredLrp) {
      var key = desiredLrp.process_guid;
      var className = 'clickable';
      var filtered = actualLrps.filter(({process_guid}) => process_guid === desiredLrp.process_guid);
      var props = {className, desiredLrp, actualLrps: filtered, key, $selection};
      return <DesiredLrp {...props}/>;
    }, this);
  },

  render() {
    var {$receptor, $selection, $sidebar} = this.props;
    var {desiredLrps} = $receptor.get();
    var {filter} = $sidebar.get();
    desiredLrps = desiredLrps || [];
    if (filter) {
      desiredLrps = filterDesiredLrps(desiredLrps, filter);
    }

    return (
      <div className="desired-lrp-list">
        <SidebarHeader {...{$receptor, $selection, $sidebar}}/>
        <section className="desired-lrps">
          {this.renderDesiredLrps(desiredLrps)}
        </section>
      </div>
    );
  }
});

module.exports = DesiredLrpList;