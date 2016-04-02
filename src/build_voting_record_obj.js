'use strict';
var govTrack = require('govtrack-node');

// list current members of Congress
govTrack.findPerson({ }, function(err, res) {
  if (!err) {
    console.log(res)
  }
});
