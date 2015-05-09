var fs = require('fs');
var plugin = require('..');
var streamEqual = require('stream-equal');
var test = require('tape');
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
    contents: fs.readFileSync('test/fixtures/input.ogg'),
    cwd: 'test/',
    path: 'test/fixtures/input.ogg'
  });

  var stream = plugin('mp3', function (cmd) {
    return cmd.audioBitrate(192);
  });

  stream.on('data', function (destFile) {
    var expectedContents = fs.readFileSync('test/fixtures/output.mp3');
    t.equal(destFile.path, 'test/fixtures/input.mp3');
    t.deepEqual(destFile.contents, expectedContents);
  });

  stream.write(srcFile);
  stream.end();
});

test('stream', function (t) {
  t.plan(3);

  var srcFile = new Vinyl({
    base: 'test/fixtures',
    contents: fs.createReadStream('test/fixtures/input.ogg'),
    cwd: 'test/',
    path: 'test/fixtures/input.ogg'
  });

  var stream = plugin('mp3', function (cmd) {
    return cmd.audioBitrate(192);
  });

  stream.on('data', function (destFile) {
    t.equal(destFile.path, 'test/fixtures/input.mp3');
    var expectedFile = fs.createReadStream('test/fixtures/output.mp3');
    streamEqual(destFile, expectedFile, function (err, equal) {
      t.error(err);
      t.ok(equal);
    });
  });

  stream.write(srcFile);
  stream.end();
});
