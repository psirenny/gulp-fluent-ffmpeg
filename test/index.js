var concat = require('concat-stream');
var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
var path = require('path');
var plugin = require('..');
var streamEqual = require('stream-equal');
var test = require('tape');
var through2 = require('through2');
var Vinyl = require('vinyl');

test('plugin', function (t) {
  t.plan(1);
  t.equal(typeof plugin, 'function');
});

test('params', function (t) {
  t.plan(1);
  t.throws(plugin);
});

test('buffer', function (t) {
  t.plan(2);

  var srcFile = new Vinyl({
    base: 'test/fixtures',
    contents: fs.readFileSync('test/fixture.ogg'),
    cwd: 'test/',
    path: 'test/fixture.ogg'
  });

  var stream = plugin('mp3', function (cmd) {
    return cmd.audioBitrate(192);
  });

  stream.on('data', function (destFile) {
    var output = concat(function (expectedContents) {
      t.equal(destFile.path, 'test/fixture.mp3');
      t.deepEqual(destFile.contents, expectedContents);
    });

    ffmpeg()
      .input(path.join(__dirname, 'fixture.ogg'))
      .output(output)
      .format('mp3')
      .audioBitrate(192)
      .run();
  });

  stream.write(srcFile);
  stream.end();
});

test('stream', function (t) {
  t.plan(3);

  var srcFile = new Vinyl({
    base: 'test/fixtures',
    contents: fs.createReadStream('test/fixture.ogg'),
    cwd: 'test/',
    path: 'test/fixture.ogg'
  });

  var stream = plugin('mp3', function (cmd) {
    return cmd.audioBitrate(192);
  });

  stream.on('data', function (destFile) {
    var input = destFile.contents;
    var output = through2();

    ffmpeg()
      .input(path.join(__dirname, 'fixture.ogg'))
      .output(output)
      .format('mp3')
      .audioBitrate(192)
      .run();

    streamEqual(input, output, function (err, equal) {
      t.equal(destFile.path, 'test/fixture.mp3');
      t.error(err);
      t.ok(equal);
    });
  });

  stream.write(srcFile);
  stream.end();
});
