'use strict';

module.exports = function($allonsy, $server) {
  if (process.env.API && process.env.API == 'false') {
    return;
  }

  var path = require('path'),
      apiFiles = $allonsy.findInFeaturesSync('controllers/*-api.js'),
      apiFilters = [];

  $server.apiFilter = function(func) {
    if (apiFilters.indexOf(func) > -1) {
      return;
    }

    apiFilters.push(func);
  };

  $server.removeApiFilter = function(func) {
    var index = apiFilters.indexOf(func);

    if (index < 0) {
      return;
    }

    apiFilters.splice(index, 1);
  };

  apiFiles.forEach(function(file) {
    var configs = require(path.resolve(file));

    if (!configs) {
      return;
    }

    if (!Array.isArray(configs)) {
      configs = [configs];
    }

    var ApiEvent = function() {

      this.validMessage = function($message, conditions) {
        if (!$message || typeof $message != 'object') {
          return false;
        }

        conditions = conditions || {};

        var keys = Object.keys(conditions),
            goodMessage = true;

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];

          conditions[key] = conditions[key] || [];
          if (!Array.isArray(conditions[key])) {
            conditions[key] = [conditions[key]];
          }

          for (var j = 0; j < conditions[key].length; j++) {
            if (conditions[key][j] == 'filled') {
              if (!$message[key] && (typeof $message[key] != 'number' || $message[key] !== 0)) {
                goodMessage = false;

                break;
              }
            }
            else if (typeof $message[key] != conditions[key][j]) {
              goodMessage = false;

              break;
            }
          }

          if (!goodMessage) {
            break;
          }
        }

        return goodMessage;
      };
    };

    configs.forEach(function(config) {
      if (!config) {
        return;
      }

      if (!config.method) {
        config.method = ['get'];
      }
      if (typeof config.method != 'object') {
        config.method = [config.method];
      }

      config.method.forEach(function(method) {
        method = (method || 'get').toLowerCase();

        $server[method]('/api/' + config.url, function(req, res, next) {
          for (var i = 0; i < apiFilters.length; i++) {
            if (!apiFilters[i](req, res, config)) {
              return;
            }
          }

          DependencyInjection.injector.controller.invoke(new ApiEvent(), config.controller, {
            controller: {
              $method: function() {
                return method;
              },

              $req: function() {
                return req;
              },

              $res: function() {
                return res;
              },

              $next: function() {
                return next;
              },

              $done: function() {
                return function() { };
              }
            }
          });
        });
      });
    });
  });

  $server.all('/api/*', function(req, res) {
    res
      .status(404)
      .json({
        error: 'Not found'
      });
  });
};
