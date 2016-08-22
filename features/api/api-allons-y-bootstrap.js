'use strict';

module.exports = {
  bootstrap: function($allonsy, $options, $done) {
    if ((!process.env.API || process.env.API == 'true') && $options.owner == 'start') {
      $allonsy.watcher('Allons-y Express', 'controllers/*-api.js');
    }

    $done();
  }
};

