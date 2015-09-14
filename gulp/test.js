/* eslint no-undef:0, semi: 0, no-console:0 */
//
// Tasks related to single-run tests
//
var argv = process.argv;

var figlet = require('figlet')
var extend = require('extend')
var karma = require('karma')


module.exports = function(gulp, plugins, config) {
    var libs = config.test_alt_libs;

    function test(browsers, extra_config) {
        var options = extend(config.karma, extra_config)

        options.files = options.files.concat(config.sources, config.spec_files)

        Object.keys(libs).forEach(function (lib) {
            if (argv.indexOf("--" + lib) >= 0) {
                options.files.unshift(libs[lib])
            }
        })

        options.browsers = browsers
        if (process.argv.indexOf("--once") >= 0) {
            options.singleRun = true;
        }

        new karma.Server(options, process.exit)
            .on('browser_complete', function(browser, results) {
                console.log(browser.name.cyan, results)
            })
            .start()
    }

    gulp.task("test:chrome", "Run tests in Chrome (--once to run once)", function() {
        test(['Chrome'])
    })

    gulp.task("test:phantomjs", "Run tests in PhantomJS (--once to run once)", function() {
        test(['PhantomJS'])
    })

    gulp.task("test:sauce", "Run tests in SauceLabs", function() {
        var groups = config.sauceLauncherGroups
        var launchers

        for (var groupName in groups) {
            if (process.argv.indexOf('--' + groupName) !== -1) {
                launchers = groups[groupName]
                console.log("")
                console.log(figlet.textSync(groupName))
            }
        }

        if (!launchers) {
            console.error("Specify a SauceLabs group:\n",
                Object.keys(groups).map(function(g) { return '--' + g })
            )
            return
        }

        var browsers = Object.keys(launchers)
        // Add the 'SauceLabs' base so we don't need it littering
        // the config file.
        Object.keys(launchers).forEach(function (key) {
            launchers[key].base = "SauceLabs"
        })

        test(browsers, {
            singleRun: true,
            sauceLabs: {
                testName: "Knockout unit tests"
            },
            reporters: ['saucelabs'],
            customLaunchers: launchers
        })
    })
}
