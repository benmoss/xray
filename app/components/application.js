require('babel/polyfill');
var Cursor = require('pui-cursor');
var googleAnalyticsMixin = require('../mixins/google_analytics_mixin');
var Layout = require('../../server/components/layout');
var Page = require('./page');
var React = require('react/addons');

var types = React.PropTypes;

var Application = React.createClass({
  mixins: [googleAnalyticsMixin],

  propTypes: {
    config: types.object.isRequired
  },

  childContextTypes: {
    colors: types.array.isRequired
  },

  getChildContext: function() {
    return {colors: this.props.config.colors};
  },

  getInitialState() {
    return {
      receptor: {
        cells: [],
        desiredLrps: [],
        actualLrps: [],
        actualLrpsByProcessGuid: {},
        actualLrpsByCellId: {},
        desiredLrpsByProcessGuid: {}
      },
      scaling: 'memory_mb',
      selection: {
        hoverDesiredLrp: null,
        selectedDesiredLrp: null,
        hoverActualLrp: null,
        filteredLrps: {}
      },
      sidebar: {
        filter: '',
        sidebarCollapsed: false,
        hoverActualLrp: null
      },
      receptorUrl: this.props.config.receptorUrl
    };
  },

  foo() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:4000/foo/v1/cells', true);
    xhr.withCredentials = 'true';
    xhr.setRequestHeader ("Accept", "application/json");
    xhr.onload = function() {
      console.log(xhr.responseText);
    };
    xhr.send();
  },

  componentDidMount() {
    var request = require('superagent');

    request.post('http://localhost:4000/authenticate')
      .withCredentials()
      .end(function(error, res) {
        this.foo();
      }.bind(this));
  },

  componentDidUpdate() {
    var {receptor, selection, sidebar} = this.state;
    Object.assign(xray, {receptor, selection, sidebar});
  },

  render() {
    var {receptorUrl, receptor, sidebar, selection, scaling} = this.state;
    var $receptor = new Cursor(receptor, receptor => this.setState({receptor}));
    var $sidebar = new Cursor(sidebar, sidebar => this.setState({sidebar}));
    var $selection = new Cursor(selection, selection => this.setState({selection}));
    var $scaling = new Cursor(scaling, scaling => this.setState({scaling}));
    return (
      <div className="xray">
        <Page {...{$receptor, $sidebar, $selection, $scaling, receptorUrl}} ref="page"/>
      </div>
    );
  }
});

Layout.init(Application);

module.exports = Application;
