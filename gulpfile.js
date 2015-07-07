//
// Gulp Tasks
// ----------
//
/*eslint no-undef: 0*/

var gulp = require('gulp')
var plugins = require('gulp-load-plugins')()
var _ = require('lodash')
var fs = require('fs')
var yaml = require('js-yaml')


Object.defineProperty(global, 'config', {
  get: _.throttle(function config() {
    return yaml.safeLoad(
      fs.readFileSync('./config.yaml', { encoding: 'utf8' })
    )
  }, 100)
})


function makeAppcache() {
  var isotime = new Date().toISOString()
  var manifest = config.appcache.manifest.replace("$ISOTIME", isotime)
  fs.writeFileSync(config.appcache.target, manifest)
  console.log("\n\t🎁  \tAppcache rebuilt. \n ")
}


gulp.task('karma', function (done) {
  var karmaServer = require('karma').server
  karmaServer.start(config.karma, done)
})


gulp.task('eslint', function () {
  return gulp.src('**/*.js')
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())

})


gulp.task('make:appcache', _.throttle(makeAppcache, 100))


gulp.task('make:libs', function () {
  gulp.src(config['libs.js'].src)
    .pipe(plugins.concat(config['libs.js'].filename))
    // .pipe(plugins.replace("# sourceMappingURL=jquery.min.map", ""))
    // .pipe(plugins.replace("# sourceMappingURL=knockout.validation.min.js.map", ""))
    .pipe(gulp.dest(config['libs.js'].dest))
})


gulp.task('make:app', function () {
  return gulp.src(config['app.js'].src)
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.babel(config['app.js']['babel-config']))
      .on('error', function (err) {
        plugins.util.log(err.message)
        console.log("---", err.stack)
        this.emit('end')
      })
      .pipe(plugins.concat(config['app.js'].name))
      .pipe(plugins.sourcemaps.write())
      .pipe(gulp.dest(config['app.js'].dest))
})


gulp.task('make:css', function () {
  var LessPluginAutoPrefix = require('less-plugin-autoprefix')
  var autoprefix = new LessPluginAutoPrefix()
  var options = {
    paths: ["less", "bower_components"],
    plugins: [autoprefix]
  }
  return gulp.src(config.less.src)
    .pipe(plugins.less(options).on('error', plugins.util.log))
    .on('error', function(err) {
      plugins.util.log(err.message.red)
      this.emit('end')
    })
    .pipe(gulp.dest(config.less.dest))
})


gulp.task("make:templates", function () {
  return gulp.src(config.templates.src)
    // file.history is ~ ["/full/path/to/templates/file.html"]
    // file.cwd is ~ "/full/path/to"
    .pipe(plugins.header("<!--     ${file.history[0].substr(file.cwd.length)}    -->\n"))
    .pipe(plugins.concat(config.templates.filename))
    .pipe(gulp.dest(config.templates.dest))
})

gulp.task("make:opine", function () {

})


var REMAKE_TASKS = [
  'make:templates', 'make:css', 'make:app', 'make:libs'
]
gulp.task('watch', REMAKE_TASKS, function () {
  gulp.watch(config.templates.src, ['make:templates'])
  gulp.watch(['build/*'], ['make:appcache'])
  gulp.watch('less/**/*.less', ['make:css'])
  gulp.watch('src/**/*.js', ['make:app'])
  gulp.watch('config.yaml', REMAKE_TASKS)
})


gulp.task('reload', function () {
  plugins.connect.reload()
})


gulp.task('server', ['watch'], function () {
  plugins.connect.server({
    livereload: true,
    port: 8900,
    root: './'
  })
  gulp.watch('build/ko.appcache', ['reload'])
})



gulp.on('err', function(e) {
  console.log("Gulp Error:", e.err.stack)
})
