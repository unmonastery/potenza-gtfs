var config = require('./package.json').config;
// upload settings specific to Potenza
var settings = require('./potenza.json');


var gtfsMaker = require('gtfs-maker');
var loadData = gtfsMaker.load;
var saveDataAsCsv = gtfsMaker.saveAsCsv;


module.exports = function(grunt){

  // utility function to parse command line options
  function fetchOptions(){
    return {
      include:grunt.option( "include" ).toString().split(',')
    };
  }

  grunt.registerTask('cache', function(){

     var done = this.async();

     gtfsMaker.cache(settings)
      .catch(function(err){
          console.log(err);
      }).then(done);

  });


};
