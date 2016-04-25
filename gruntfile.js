module.exports = function(grunt) {

  grunt.initConfig({
    aws: grunt.file.readJSON("credentials.json"),
    s3: {
      options: {
        accessKeyId: "<%= aws.accessKeyId %>",
        secretAccessKey: "<%= aws.secretAccessKey %>",
        bucket: "<%= aws.bucket %>",
        region: 'us-west-1'
      },
      build: {
        cwd: 'build/dev',
        src: '**'
      }
    }
  });

  grunt.loadNpmTasks('grunt-aws');
  grunt.registerTask('deploy', ['s3']);

};