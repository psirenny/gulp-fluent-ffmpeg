var concat = require('concat-stream');
var ffmpeg = require('fluent-ffmpeg');
var gutil = require('gulp-util');
var path = require('path');
var through2 = require('through2');

module.exports = function (format, handler) {
  if (typeof format === 'function') {
    handler = format;
    format = null;
  }

  if (format && !handler) {
    handler = function (cmd) { return cmd; }
  }

  if (!format && !handler) {
    var msg = 'must include a file format, an ffmpeg handler or both';
    throw new gutil.PluginError('gulp-fluent-ffmpeg', msg);
  }

  return through2.obj(function (file, enc, callback) {
    var self = this;

    // finishes with file and passes it to the next plugin
    function next() {
      self.push(file);
      callback();
    }

    // runs a modified ffmpeg command on an input/output
    function run(input, output) {
      var cmd = handler(ffmpeg());
      if (format) cmd.format(format);
      cmd.input(input);
      cmd.output(output);
      cmd.on('error', self.emit.bind(this, 'error'));
      cmd.run();
    }

    if (file.isNull()) {
      return next();
    }

    // ensure the vinyl file extension is updated
    // when the audio is transcoded to another format "e.x. mp3 -> ogg"
    if (format) {
      var filename = path.basename(file.path, path.extname(file.path));
      file.path = path.join(file.path, '..', filename + '.' + format);
    }

    // we need to pipe the old file contents into ffmpeg,
    // buffer the output from ffmpeg, and then set the
    // new file contents to the buffered output
    if (file.isBuffer()) {
      var input = through2();
      var output = concat(function (buf) {
        file.contents = buf;
        next();
      });

      run(input, output);
      input.push(file.contents);
      input.push(null);
      return;
    }

    // we need to pipe the old file contents into ffmpeg
    // and then set the new file contents to ffmpeg's output
    if (file.isStream()) {
      var input = file.contents;
      var output = file.contents = through2();
      run(input, output);
      return next();
    }
  });
};
