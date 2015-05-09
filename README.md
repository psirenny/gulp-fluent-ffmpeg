gulp fluent ffmpeg
==================

A [fluent ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) plugin for gulp.
Refer to fluent ffmpeg's docs for api commands.

[![Build Status](https://travis-ci.org/psirenny/gulp-fluent-ffmpeg.png?branch=master)](https://travis-ci.org/psirenny/gulp-fluent-ffmpeg)

Important
---------

Make sure to specify a file format when transcoding, instead of calling the `format()` method. This is necessary because of the way gulp handles streaming files.

Installation
------------

    npm install gulp-fluent-ffmpeg --save

Example
-------

    var ffmpeg = require('gulp-fluent-ffmpeg');

    gulp.task('audio', function () {
      // transcode mp3 files to ogg
      return gulp.src('src/audio/*.mp3')
        .pipe(ffmpeg('ogg', function (cmd) {
          return cmd
            .audioBitrate('128k')
            .audioChannels(2)
            .audioCodec('libmp3lame')
        }))
        .pipe(gulp.dest('dest/audio'))
    });
