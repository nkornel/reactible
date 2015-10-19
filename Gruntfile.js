// Gruntfile.js

module.exports = function (grunt) {
    'use strict';

    grunt.util.linefeed = '\n';

    // ===============
    // CONFIGURE GRUNT
    // ===============
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Configuration

        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },

            build: ['Gruntfile.js', 'src/customevent.js']
        },

        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/js/<%= pkg.name %>.js': 'src/editablefield.js'
                }
            }
        },

        uglify: {
            options: {
                banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
            },
            build: {
                files: {
                    'dist/js/<%= pkg.name %>.min.js':['src/customevent.js','dist/js/<%= pkg.name %>.js','node_modules/react/dist/react.js','node_modules/react-dom/dist/react-dom.js']
                }
            }
        },

        'string-replace': {
            npm: {
                files: [{
                    src: 'package.json',
                    dest: 'package.json'
                }],
                options: {
                    replacements: [{
                        pattern: /\"version\":\s\"[0-9\.a-z].*",/gi,
                        replacement: '"version": "' + grunt.option('newver') + '",'
                    }]
                }
            },
            bower: {
                files: [{
                    src: 'bower.json',
                    dest: 'bower.json'
                }],
                options: {
                    replacements: [{
                        pattern: /\"version\":\s\"[0-9\.a-z].*",/gi,
                        replacement: '"version": "' + grunt.option('newver') + '",'
                    }]
                }
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-babel');

    // Default task
    grunt.registerTask('default', ['jshint','babel','uglify']);
    
    // Version numbering task.
    // grunt bump-version --newver=X.Y.Z
    grunt.registerTask('bump-version', 'string-replace');
};
