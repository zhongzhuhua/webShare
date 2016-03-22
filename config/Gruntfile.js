module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // 压缩本地
    uglify: {
      options: {
        mangle: {
          except: ['define', 'require', 'module', 'exports']
        },
        compress: false,
        stripBanners: true
      },
      build: {
        files: [{
          expand: true,
          cwd: 'assets/js/proj/',
          src: ['**/*.js'],
          dest: 'assets/js/proj-min/',
          extDot: '',
          ext: '.js'
        },{
          expand: true,
          cwd: 'assets/js/models/',
          src: ['**/*.js'],
          dest: 'assets/js/lib/models/',
          extDot: '',
          ext: '.js'
        }]
      }
    },

    // 合并 css
    concat: {
      css: {
        src: ['assets/css/global.css', 'assets/css/layout.css','assets/css/plus.css'],
        dest: 'assets/css/all.css'
      }
    },

    // 压缩 css
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      css: {
        src: 'assets/css/all.css',
        dest: 'assets/css/all.min.css'
      }
    },

    // 打包
    copy: {
      main: {
        files: [{
          expand: true,
          src: ['html/**'],
          dest: 'pack/backend'
        },{
          expand: true,
          src: ['assets/js/proj-min/**'],
          dest: 'pack/backend'
        },{
          expand: true,
          src: ['data/**'],
          dest: 'pack/backend'
        },{
          expand: true,
          src: ['imageAudit/shard-readme.html'],
          dest: 'pack/backend'
        },{
          expand: true,
          src: ['assets/css/**','assets/js/lib/**'],
          dest: 'pack/frontend'
        }]
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['uglify','concat', 'cssmin', 'copy']);
};
