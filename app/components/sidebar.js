var DesiredLrpDetail = require('./desired_lrp_detail');
var DesiredLrpList = require('./desired_lrp_list');
var PureRenderMixin = require('../mixins/pure_render_mixin');
var React = require('react/addons');

var types = React.PropTypes;

var Sidebar = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    $receptor: types.object.isRequired,
    $selection: types.object.isRequired,
    $sidebar: types.object.isRequired
  },

  render() {
    var {$selection} = this.props;
    var hasDetails = !!$selection.get('selectedDesiredLrp');
    return (
      <div className="sidebar">
        {!hasDetails && <DesiredLrpList {...this.props}/>}
        {hasDetails && <DesiredLrpDetail {...this.props}/>}
      </div>
    );
  }
});

module.exports = Sidebar;