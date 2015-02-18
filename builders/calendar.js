var _ = require('lodash');

module.exports = function(data, options){
  options = options || {};

  var calendar = [];
  var services = {};
  var include = options.include || [];
  var key, value;

  var timetables = data[0];

  timetables.forEach(function(row){

    if ( !_.contains( include, row.line_number ) ){
      return; // skip this line
    }

    services[ row.service ] = true;

  });

  for ( key in services ){
    value = services[key];
    if ( value ){
      calendar.push({
          'service_id':key,
          'monday': '',
          'tuesday': '',
          'wednesday': '',
          'thursday': '',
          'friday': '',
          'saturday': '',
          'sunday':'',
          'start_date':'',
          'end_date':''
      });
    }
  }

  return calendar;
};
