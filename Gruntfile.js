var config = require('./package.json').config;
var settings = require('./potenza.json');

var request = require('superagent');
var Promise = require('es6-promise').Promise;
var fs = require('fs');
var _ = require('lodash');

var GtfsMaker = require('gtfs-maker');

function isNumber(text){
  return /^\d+$/.test(text);
}

var gtfsMaker = new GtfsMaker({
  settings:settings,
  data:{
    timetables:{
      format:'csv',
      ext:'.csv',
      dir:'./cache/',
      transform: function(item){
        function lookup(lineNumber){
          return _.result(_.find( settings.lines, function(line){
            return line.number == lineNumber;
          }), 'osmId');
        }
        var key, value;
        var times = [];

        item.offset = item.sheet;
        delete item.sheet;
        item.master_id = lookup( item.line_number );

        for ( key in item ){
          value = item[key];
          if ( isNumber(key) ){
            if ( !_.isEmpty(value) )
              times.push( value );
            delete item[key];
          }
        }
        item.startTimes = times;
        return item;
      }
    },
    offsets:{
      isDirectory:true,
      format:'csv',
      ext:'.csv',
      dir:'./extracted/offsets/',
      transform: function(item){
        function lookup(lineNumber){
          return _.result(_.find( settings.lines, function(line){
            return line.number == lineNumber;
          }), 'osmId');
        }
        var matches = /(.*)R*\.csv/.exec(item.name);
        if ( !matches ){
          throw new Error('Offset file not in correct format.');
        }
        var name = matches[1];
        var isReturn = name[ name.length-1 ] == 'R';
        var lineNumber = name.replace('R','');
        item.master_id = lookup( lineNumber );
        item.line_number = lineNumber;
        item.isReturn = isReturn;
        item.name = name;
        item.stoptimes = item.content;
        delete item.content;
        return item;
      }
    }
  }
});


module.exports = function(grunt){

  // utility function to parse command line options
  function fetchOptions(){
    var include = grunt.option( "include" );
    if (!include)
      throw new Error('You must include at least a line.');
    return {
      include:include.toString().split(',')
    };
  }

  // TODO refactor: duplicate code in matera-gtfs
  grunt.registerTask('cache', function(){
     var done = this.async();

     function fetchCSV(){
       return new Promise(function(resolve, reject){
         request.get( settings.timetables )
             .end(function(err, res){
               if(err){
                 reject(err);
               } else {
                 resolve(res.text);
               }
             });
         });
       }

       function saveData(data){
         fs.writeFileSync('./cache/timetables.csv', data);
       }

       gtfsMaker.cache()
         .then(function(){
           fetchCSV().then(saveData)
              .catch(function(err){
                console.log(err);
              }).then(done);
         });

  });

  grunt.registerTask('stops', function(){
    var done = this.async();
    var stops = gtfsMaker.builders.stops( gtfsMaker.loadData(['stops']) );
    gtfsMaker.saveDataAsCsv( stops, './gtfs/stops.txt' )
      .catch(function(err){
        console.log(err);
      }).then(done);
  });

  grunt.registerTask('routes', function(){
    var done = this.async();
    var routes = gtfsMaker.builders.routes( gtfsMaker.loadData(['masters']) );
    gtfsMaker.saveDataAsCsv( routes, './gtfs/routes.txt' )
      .catch(function(err){
        console.log(err);
      }).then(done);
  });

  grunt.registerTask('shapes', function(){
    var done = this.async();
    var shapes = gtfsMaker.builders.shapes( gtfsMaker.loadData(['routes', 'ways', 'nodes']) );
    gtfsMaker.saveDataAsCsv( shapes, './gtfs/shapes.txt' )
      .catch(function(err){
        console.log(err);
      }).then(done);
  });

  grunt.registerTask('trips', function(){
    var done = this.async();
    var tripBuilder = require('./builders/trips');
    var trips = tripBuilder( gtfsMaker.loadData(['timetables']), fetchOptions() );
    gtfsMaker.saveDataAsCsv( trips, './gtfs/trips.txt' )
      .catch(function(err){
        console.log(err);
      }).then(done);
  });

  grunt.registerTask('calendar', function(){
    var done = this.async();
    var calendarBuilder = require('./builders/calendar');
    var calendar = calendarBuilder( gtfsMaker.loadData(['timetables']), fetchOptions() );
    gtfsMaker.saveDataAsCsv( calendar, './gtfs/calendar.txt' )
      .catch(function(err){
        console.log(err);
      }).then(done);
  });

  grunt.registerTask('validate', function(){
    var done = this.async();
    gtfsMaker.validateGtfs( './gtfs' )
      .catch(function(err){
        console.log(err);
      }).then(done);
  });

  grunt.registerTask('stop_times', function(){
    var done = this.async();
    var stopTimesBuilder = require('./builders/stopTimes');
    var stopTimes = stopTimesBuilder( gtfsMaker.loadData(['timetables', 'offsets']), fetchOptions() );
    gtfsMaker.saveDataAsCsv( stopTimes, './gtfs/stop_times.txt' )
      .catch(function(err){
        console.log(err);
      }).then(done);
  });

};
