'use strict';

module.exports = {
  bootstrap: function($allonsy, $options, $done) {
    if ((process.env.API && process.env.API == 'false') || (!$options.owner || $options.owner != 'start')) {
      return $done();
    }

    $allonsy.watcher('Allons-y Express', 'controllers/*-api.js');

    $done();
  }
};

