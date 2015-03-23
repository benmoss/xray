var BaseApi = require('./base_api');

var DesiredLrpsApi = {
  fetch() {
    return BaseApi.get('desired_lrps').then(function(desiredLrps) {
      return {desiredLrps: desiredLrps.sort((a, b) => a.process_guid < b.process_guid ? -1 : 1)};
    });
  },

  scale(desiredLrp, instances) {
    return BaseApi.update(`desired_lrps/${desiredLrp.process_guid}`, {instances});
  },

  destroy(desiredLrp) {
    return BaseApi.destroy(`desired_lrps/${desiredLrp.process_guid}`);
  }
};

module.exports = DesiredLrpsApi;