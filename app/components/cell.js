var FastMixin = require('../mixins/fast_mixin');
var Container = require('./container');
var sortBy = require('lodash.sortby');
var React = require('react/addons');
var {findDesiredLrp} = require('../helpers/desired_lrp_helper');
var {lpad} = require('../helpers/string_helper');
var {mergeClassNames} = require('../helpers/application_helper');

var types = React.PropTypes;

var Cell = React.createClass({
  mixins: [FastMixin],

  propTypes: {
    actualLrps: types.array,
    cell: types.object.isRequired,
    $receptor: types.object.isRequired
  },

  contextTypes: {
    scaling: types.string.isRequired
  },

  render() {
    var {cell, $receptor} = this.props;
    var desiredLrps = $receptor.get('desiredLrps');
    var {actualLrps, style} = this.props;
    var {scaling} = this.context;
    var denominator = scaling === 'containers' ? 50 : cell.capacity[scaling];
    var containers = actualLrps && sortBy(actualLrps, lrp => lrp.process_guid + lpad(lrp.index, '0', 5)).map(function(actualLrp) {
        //TODO: desiredLrps could be a hash for O(1) lookup instead of a find
        var desiredLrp = desiredLrps && desiredLrps.find(desiredLrp => desiredLrp.process_guid === actualLrp.process_guid);
        var isSelected = false;
        var $hoverDesiredLrp = $receptor.refine('hoverDesiredLrp');
        var $selectedDesiredLrp = $receptor.refine('selectedDesiredLrp');
        if(desiredLrp) {
          var hasHover = $hoverDesiredLrp.get() && findDesiredLrp([desiredLrp], $hoverDesiredLrp.get());
          var hasSelection = $selectedDesiredLrp.get() && findDesiredLrp([desiredLrp], $selectedDesiredLrp.get());
          isSelected = !!(desiredLrp && hasHover || hasSelection);
        }

        return (<Container {...{actualLrp, denominator, desiredLrp, $hoverDesiredLrp, $selectedDesiredLrp, isSelected}} key={actualLrp.modification_tag.epoch}/>);
      });

    return (
      <li className={mergeClassNames('cell', this.props.className)} style={style}>
        {containers}
      </li>
    );
  }
});

module.exports = Cell;