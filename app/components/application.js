require('6to5/polyfill');
var BaseApi = require('../api/base_api');
var Layout = require('../../server/components/layout');
var Modal = require('./modal');
var React = require('react/addons');
var ReceptorApi = require('../api/receptor_api');
var ReceptorUrlModal = require('./receptor_url_modal');
var Zones = require('./zones');
var {setCorrectingInterval} = require('correcting-interval');
var {diff} = require('../helpers/array_helper');

var types = React.PropTypes;
var update = React.addons.update;

var Application = React.createClass({
  propTypes: {
    config: types.object.isRequired
  },

  childContextTypes: {
    cells: types.array,
    desiredLrps: types.array
  },

  getChildContext: function() {
    var {receptor} = this.state;
    return {desiredLrps: receptor.desiredLrps}
  },

  getInitialState() {
    return {receptor: {cells: null, desiredLrps: null}};
  },

  statics: {
    POLL_INTERVAL: 2000
  },

  componentDidMount() {
    var {config} = this.props;

    if (config.receptorUrl) {
      BaseApi.baseUrl = config.receptorUrl;
      this.pollReceptor();
      return;
    }
    var {modal} = this.refs;
    modal.open(<ReceptorUrlModal onSubmit={this.updateReceptorUrl}/>);
  },

  updateReceptor() {
    return ReceptorApi.fetch().then(function({cells, desiredLrps}) {
        var {added, removed, changed} = diff(this.state.receptor.cells, cells, 'cell_id', function(current, next) {
          return current.actual_lrps.map(a => a.since).join('') === next.actual_lrps.map(a => a.since).join('');
        });
        console.log({added, removed, changed});

        //this.setState({receptor: update(this.state.receptor, {$merge: {cells, desiredLrps}})});

    }.bind(this),
        reason => console.error('DesiredLrps Promise failed because', reason)
    ).catch(() => console.log('boo!', arguments));
  },

  pollReceptor() {
    this.updateReceptor();
    setCorrectingInterval(this.updateReceptor, Application.POLL_INTERVAL);
  },

  updateReceptorUrl({receptorUrl}) {
    BaseApi.baseUrl = receptorUrl;
    this.pollReceptor();
  },

  render() {
    var {cells} = this.state.receptor;
    return (
      <div className="xray">
        <Zones {...{cells}}/>
        <Modal ref="modal"/>
      </div>
    );
  }
});

Layout.init(Application);

module.exports = Application;