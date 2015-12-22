/*! Project Arclight v1.1 | (c) 2015 University of Wisconsin |  MIT License | projectarclight.org */

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-postcss');

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        watch: {
          watch_html: {
            files: [
              'src/arclight.html'             
            ],
            tasks: ['htmlmin']
          },
          watch_css: {
            files: [
              'src/less/*.less'
            ],
            tasks: ['less']
          },
          watch_js: {
             files: [
               'src/js_src/*.js'               
             ],
             tasks: ['uglify']
           },
          watch_copy: {
            files: [ 'src/copy/**' ],
            tasks: [ 'copy' ]
          }
        },

        less: {
            main: { 
               files: {
                  "statics/arclight.css": "src/less/arclight.less"
                },
                options: {
                  plugins: [
                    new (require('less-plugin-autoprefix'))({browsers: ["> 5%"]}),
                    new (require('less-plugin-clean-css'))({advanced: true})
                  ]

                }
            }
        },

        jshint: {
          options: {
            jshintrc: '.jshintrc'
          },
          all: ['Gruntfile.js', '**/*.js']
        },

        uglify: {
            main: {
              options: {
                preserveComments: require('uglify-save-license')
              },
              files: {
                'statics/arclight.min.js': [    'src/js_src/html.js', 
                                                'src/js_src/journal_filter.js', 
                                                'src/js_src/main.js',
                                                'src/js_src/make_chart.js',
                                                'src/js_src/misc.js',
                                                'src/js_src/run.js'
                                           ],
                //TODO also highcharts modules?

              }

            }
        },

        htmlmin: {                                     
            main: {                             
              options: {                                 
                    removeComments: true,
                collapseWhitespace: true
              },
              files: {                                                    
                      'statics/arclight.html' : 'src/arclight.html',
              }
            }
        },

        copy: {
            main: {
              files: [
                  { expand: true, cwd: 'src/copy/', src: ['**'], dest: 'statics/', },
              ]
            }
        }

      });

      // Load the Grunt plugins.
      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.loadNpmTasks('grunt-contrib-jshint');
      grunt.loadNpmTasks('grunt-contrib-less');
      grunt.loadNpmTasks('grunt-contrib-uglify');
      grunt.loadNpmTasks('grunt-contrib-htmlmin');
      grunt.loadNpmTasks('grunt-contrib-copy');

      grunt.registerTask('default', 'watch');
      grunt.registerTask('build', [ 'htmlmin', 'less', 'uglify', 'copy' ]);
};