var config = require('./package.json').config;
var settings = require('./potenza.json');

var request = require('superagent');
var Promise = require('es6-promise').Promise;
var fs = require('fs');
var _ = require('lodash');

var GtfsMaker = require('gtfs-maker');

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
        item.master_id = lookup( item.line_number );
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

  grunt.registerTask('validate', function(){
    var done = this.async();
    gtfsMaker.validateGtfs( './gtfs' )
      .catch(function(err){
        console.log(err);
      }).then(done);
  });

};
