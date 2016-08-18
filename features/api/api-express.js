'use strict';

module.exports = ['$allonsy', '$server', function($allonsy, $server) {

  var path = require('path'),
      apiFiles = $allonsy.findInFeaturesSync('controllers/*-api.js');

  apiFiles.forEach(function(file) {
    var configs = require(path.resolve(file));

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
      if (!config.method) {
        config.method = ['get'];
      }
      if (typeof config.method != 'object') {
        config.method = [config.method];
      }

      config.method.forEach(function(method) {
        method = (method || 'get').toLowerCase();

        $server[method]('/api/' + config.url, function(req, res, next) {
          // if (config.isMember && (!req.user || !req.user.id)) {
          //   return res.sendStatus(403);
          // }

          // if (config.permissions && config.permissions.length) {
          //   if (!req.user || !req.user.id || !req.user.hasPermissions(config.permissions)) {
          //     return res.sendStatus(403);
          //   }
          // }

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
                return function() {

                };
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
}];
