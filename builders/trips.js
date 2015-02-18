var _ = require('lodash');

module.exports = function(data, options){
  options = options || {};

  var trips = [];
  var include = options.include || [];

  var timetables = data[0];

  timetables.forEach(function(row){
    if ( !_.contains( include, row.line_number ) ){
      return; // skip this line
    }
    trips.push({
      route_id: row.master_id, 
      service_id: row.service,
      trip_id: row.line_number + '_' + row.osm_id + '_' + row.service,
      trip_headsign: row.to,
      shape_id:row.osm_id
    });
  });

  return trips;
});
