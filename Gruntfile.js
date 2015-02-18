var config = require('./package.json').config;


var GtfsMaker = require('gtfs-maker');

var gtfsMaker = new GtfsMaker({
  settings:require('./potenza.json'),
  data:{
    timetables:{
      isDirectory:true,
      format:'csv',
      ext:'.csv',
      dir:'./extracted/timetables/',
      transform:function(item){
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

  grunt.registerTask('cache', function(){

     var done = this.async();

     gtfsMaker.cache()
      .catch(function(err){
          console.log(err);
      }).then(done);

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

};
