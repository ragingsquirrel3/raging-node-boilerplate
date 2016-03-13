// TEMP dont test build
// // test that the browser build works
// const sys = require('sys');
// const exec = require('child_process').exec;
// const fs = require('fs');

// const BUILD_COMMAND = 'webpack --progress --colors'; // npm build
// const TEST_BUILD_DIR = __dirname + '/../build/';
// const JS_BUILD_PATH = TEST_BUILD_DIR;
// const JS_BUILD_FILE_NAME = 'bundle.js';
// const JS_FILE_PATH = JS_BUILD_PATH + JS_BUILD_FILE_NAME;

// const assert = require('assert');
// describe('build script', function () {
//   // see if already built
//   var jsBuildContents = fs.readdirSync(JS_BUILD_PATH);
//   console.log(jsBuildContents)
//   var isJsBuilt = (jsBuildContents.indexOf(JS_BUILD_FILE_NAME) > -1);
//   // delete if already present
//   if (isJsBuilt) fs.unlinkSync(JS_FILE_PATH);

//   it('should produce build/js/bundle.js', function (done) {
//     exec(BUILD_COMMAND, function (error, stdout, stderr) {
//       var jsBuildContents = fs.readdirSync(JS_BUILD_PATH);
//       var isJsBuilt = (jsBuildContents.indexOf(JS_BUILD_FILE_NAME) > -1);
//       assert.equal(isJsBuilt, true);
//       if (error !== null) {
//         console.log('build error: ' + error);
//         assert.fail('successul build', 'error');
//       }
//       done();
//     });

//     // run webpack --progress --colors
//     // check to see that file exists
    
//   });
// });
