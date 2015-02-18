var _ = require('lodash');
var moment = require('moment');

module.exports = function(data, options){
  options = options || {};

  var stopTimes = [];
  var include = options.include || [];

  var timetables = data[0];
  var offsets = data[1];

  timetables.forEach(function(row){

    if ( !_.contains( include, row.line_number ) ){
      return; // skip this line
    }

    var tripId = row.line_number + '_' + row.osm_id + '_' + row.service;
    var offset = _.find(offsets, function(offset){
      return offset.name == row.offset;
    });


    row.startTimes.forEach(function(startTime){
      offset.stoptimes.forEach( function(stoptime, index){
        var time = moment(startTime, "HH:mm").add(stoptime.offset, 'minutes');
        stopTimes.push({
          trip_id: tripId,
          arrival_time:time.format('HH:mm:ss'),
          departure_time:time.format('HH:mm:ss'),
          // TODO replace stop_number with OSM ID for this stop
          stop_id:stoptime.stop_number,
          stop_sequence:index
        });
      });
    });


  });

  return stopTimes;
};
