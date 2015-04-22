var StreamSource = require('../lib/stream_source');
var sortedIndex = require('lodash.sortedindex');
var {actualLrpIndex, decorateDesiredLrp} = require('../helpers/lrp_helper');

var privates = new WeakMap();

/*eslint-disable no-unused-vars*/
function createResource(cursorName, resourceKey, options = {}) {
  return function({[resourceKey]: resource}) {
    var {$receptor} = this.props;
    var oldResource = $receptor.get(cursorName).find(({modification_tag: {epoch}}) => epoch === resource.modification_tag.epoch);
    if (oldResource) return;

    if(options.decorate) {
      options.decorate(resource);
    }
    $receptor.apply(function(receptor) {
      (options.indexBy || []).forEach(function(config) {
        var indexBy = receptor[config.name];
        var indexKey = resource[config.key];
        if (config.array) {
          indexBy[indexKey] = indexBy[indexKey] || [];
          indexBy[indexKey].push(resource);
        } else {
          indexBy[indexKey] = resource;
        }
      });

      if (options.sortBy) {
        var index = sortedIndex(receptor[cursorName], resource, options.sortBy);
        receptor[cursorName].splice(index, 0, resource);
      } else {
        receptor[cursorName].push(resource);
      }

      return receptor;
    });
  };
}

function removeResource(cursorName, resourceKey, options = {}) {
  return function({[resourceKey]: resource}) {
    var {$receptor} = this.props;
    var oldResource = $receptor.get(cursorName).find(({modification_tag: {epoch}}) => epoch === resource.modification_tag.epoch);
    if (!oldResource) return;
    $receptor.apply(function(receptor) {
      (options.indexBy || []).forEach(function(config) {
        var indexBy = $receptor.get(config.name);
        var indexKey = resource[config.key];
        if (config.array) {
          var position;
          if (indexBy[indexKey] && (position = indexBy[indexKey].indexOf(oldResource)) !== -1) {
            indexBy[indexKey].splice(position, 1);
          } else {
            var oldKey = oldResource[config.key];
            if (indexBy[oldKey]) {
              position = indexBy[oldKey].indexOf(oldResource);
              position !== -1 && indexBy[oldKey].splice(position, 1);
            }
          }
        } else {
          delete indexBy[indexKey];
        }
      });

      var index = receptor[cursorName].indexOf(oldResource);
      index !== -1 && receptor[cursorName].splice(index, 1);
      return receptor;
    });
  };
}

function changeResource(cursorName, resourceKey, options = {}) {
  return function({[resourceKey]: resource}) {
    var {$receptor} = this.props;
    var oldResource = $receptor.get(cursorName).find(({modification_tag: {epoch}}) => epoch === resource.modification_tag.epoch);

    if(options.decorate) {
      options.decorate(resource);
    }
    $receptor.apply(function(receptor) {
      if (!oldResource) {
        receptor[cursorName].push(resource);
      } else {
        var index = receptor[cursorName].indexOf(oldResource);
        receptor[cursorName][index] = resource;
      }

      (options.indexBy || []).forEach(function(config) {
        var indexBy = receptor[config.name];
        var indexKey = resource[config.key];
        if (config.array) {
          if (oldResource) {
            var position;
            if (indexBy[indexKey] && (position = indexBy[indexKey].indexOf(oldResource)) !== -1) {
              indexBy[indexKey].splice(position, 1, resource);
            } else {
              var oldKey = oldResource[config.key];
              if (indexBy[oldKey]) {
                position = indexBy[oldKey].indexOf(oldResource);
                position !== -1 && indexBy[oldKey].splice(position, 1);
              }
              (indexBy[indexKey] || (indexBy[indexKey] = [])).push(resource);
            }
          } else {
            (indexBy[indexKey] || (indexBy[indexKey] = [])).push(resource);
          }
        } else {
          indexBy[indexKey] = resource;
        }
      });

      return receptor;
    });
  };
}
/*eslint-enable no-unused-vars*/

var ReceptorStreamMixin = {
  componentWillUnmount() {
    this.destroySSE();
  },

  createSSE(receptorUrl) {
    //var sse = new StreamSource(`${receptorUrl}/v1/events`, {withCredentials: true});
    //privates.set(this, {sse});
  },

  destroySSE() {
    var {sse} = privates.get(this) || {};
    if (sse) sse.off();
  },

  streamActualLrps() {
    var {sse} = privates.get(this) || {};
    if (!sse) return;

    var options = {
      indexBy: [
        {key: 'process_guid', name: 'actualLrpsByProcessGuid', array: true},
        {key: 'cell_id', name: 'actualLrpsByCellId', array: true}
      ]
    };

    sse
      .on('actual_lrp_created', createResource('actualLrps', 'actual_lrp', Object.assign({sortBy: actualLrpIndex}, options)).bind(this))
      .on('actual_lrp_changed', changeResource('actualLrps', 'actual_lrp_after', options).bind(this))
      .on('actual_lrp_removed', removeResource('actualLrps', 'actual_lrp', options).bind(this));
  },

  streamDesiredLrps() {
    var {sse} = privates.get(this) || {};
    if (!sse) return;

    var options = {
      indexBy: [{
        key: 'process_guid',
        name: 'desiredLrpsByProcessGuid'
      }],
      decorate: decorateDesiredLrp.bind(this)
    };
    sse
      .on('desired_lrp_created', createResource('desiredLrps', 'desired_lrp', options).bind(this))
      .on('desired_lrp_changed', changeResource('desiredLrps', 'desired_lrp_after', options).bind(this))
      .on('desired_lrp_removed', removeResource('desiredLrps', 'desired_lrp', options).bind(this));
  },

  streamSSE(receptorUrl) {
    this.destroySSE();
    this.createSSE(receptorUrl);
    this.streamActualLrps();
    this.streamDesiredLrps();
  }
};

module.exports = ReceptorStreamMixin;