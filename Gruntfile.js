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
    return {
      include:grunt.option( "include" ).toString().split(',')
    };
  }

  grunt.registerTask('cache', function(){

     var done = this.async();

     gtfsMaker.cache()
      .catch(function(err){
          console.log(err);
      }).then(done);

  });


};
