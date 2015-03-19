var ActualLrp = require('./actual_lrp');
var PureRenderMixin = require('../mixins/pure_render_mixin');
var React = require('react/addons');

var types = React.PropTypes;

var ActualLrpList = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    actualLrps: types.array.isRequired,
    $hoverActualLrp: types.object.isRequired
  },

  renderActualLrps() {
    var {$hoverActualLrp} = this.props;
    return this.props.actualLrps.map(function(actualLrp) {
      return (<ActualLrp {...{actualLrp, $hoverActualLrp, key: actualLrp.index}}/>);
    });
  },

  render() {
    return (
      <div className="actual-lrps">
        <table className="table">
          <tbody>{this.renderActualLrps()}</tbody>
        </table>
      </div>
    );
  }
});

module.exports = ActualLrpList;