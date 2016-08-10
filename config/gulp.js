var gulp = require('gulp');
// 压缩 css 文件
var minifyCss = require('gulp-minify-css');
// 合并文件，类似母板页
var contentIncluder = require('gulp-content-includer');
// 压缩 html 文件
var htmlmin = require('gulp-htmlmin');
// 图片压缩
var imagemin = require('gulp-imagemin');
// png 压缩
var pngquant = require('imagemin-pngquant');
// 缓存，避免全部压缩，只压缩有改动过的文件
var cache = require('gulp-cache');

// css 压缩
gulp.task('css', function() {
    gulp.src('./assets/css/*.css')
        .pipe(cache(minifyCss()))
        .pipe(gulp.dest('./dist/assets/css/'))
});

// HTML处理
gulp.task('html', function() {
    gulp.src('./html/**/*.html')
        // 实现 include
        .pipe(contentIncluder({
            includerReg: /<!\-\-include\s+"([^"]+)"\-\->/g
        }))
        // 压缩 html
        .pipe(cache(htmlmin({
            //清除HTML注释
            removeComments: true,
            //压缩HTML
            collapseWhitespace: true
        })))
        // 移动位置
        .pipe(gulp.dest('./dist/html'));
});

// 图片压缩处理
gulp.task('images', function() {
    gulp.src('./assets/images/*.+(jpeg|jpg|png)')
        .pipe(cache(imagemin({
            progressive: true,
            use: [pngquant({
                quality: '70'
            })]
        })))
        .pipe(gulp.dest('./dist/assets/images/'));
});

// 数据复制
gulp.task('data', function() {
    gulp.src('./data/**/*.json')
        .pipe(gulp.dest('./dist/data/'));
    gulp.src('./wx/**/*.json')
        .pipe(gulp.dest('./dist/wx/'));
});


// 压缩 js
gulp.task('js:stg', function() {
    return gulp.src(paths.js)
        .pipe(uglify({
            mangle: { except: ['require', 'exports', 'module', '$'] }
        }))
        .pipe(gulp.dest(pathsStg.js));
});

//定义默认任务
gulp.task('default', ['css', 'html', 'images', 'data']);

// 监控任务
gulp.task('watch', function() {
    gulp.watch('./html/**/*.html', ['html']);
    gulp.watch('./modules/*.html', ['html']);
    gulp.watch('./assets/css/*.css', ['css']);
    gulp.watch('./assets/images/*.*', ['images']);
    gulp.watch('./data/**/*.json', ['data']);
    gulp.watch('./wx/**/*.json', ['data']);
});





// ===== 其他配置
// 插件
var gulp = require('gulp');
// 应用服务器
var connect = require('gulp-connect');
// 合并文件
var concat = require('gulp-concat');
// 压缩 css 文件
var minifyCss = require('gulp-minify-css');
// 压缩 js
var uglify = require('gulp-uglify');
// 重命名
var rename = require('gulp-rename');
// 压缩 html 文件
var htmlmin = require('gulp-htmlmin');
// 图片压缩
var imagemin = require('gulp-imagemin');

// 开发文件配置
var pathRoot = 'www/v1.0.0';
var paths = {
    root: pathRoot,
    image: pathRoot + '/img/**/*.*',
    html: pathRoot + '/pages/**/*.html',
    configStg: pathRoot + '/config/config.stg.js',
    css: pathRoot + '/css/dev/**/*.css',
    js: pathRoot + '/js/*.js',
    lib: pathRoot + '/js/lib/**/*',
    commonCss: pathRoot + '/css/prd/'
};

// stg 打包结果配置
var pathRootStg = '_stg/v1.0.0';
var pathsStg = {
    config: pathRootStg,
    image: pathRootStg + '/img',
    html: pathRootStg + '/pages',
    js: pathRootStg + '/js',
    lib: pathRootStg + '/js/lib',
    commonCss: pathRootStg + '/css/prd'
};

// 使用 connect 启动一个Web服务器
gulp.task('connect', function() {
    connect.server({
        root: paths.root,
        livereload: true
    });
});

// 合并 css
gulp.task('concat:css', function() {
    return gulp.src(paths.css)
        .pipe(concat('common.css'))
        .pipe(gulp.dest(paths.commonCss));
});

// ======= stg =======

// 合并css
gulp.task('concat:css:stg', function() {
    return gulp.src(paths.css)
        .pipe(concat('common.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest(pathsStg.commonCss));
});

// 压缩 js
gulp.task('js:stg', function() {
    return gulp.src(paths.js)
        .pipe(uglify({
            mangle: { except: ['require', 'exports', 'module', '$'] }
        }))
        .pipe(gulp.dest(pathsStg.js));
});

// 配置文件
gulp.task('js:config:stg', function() {
    return gulp.src(paths.configStg)
        .pipe(uglify())
        .pipe(rename(function(path) {
            path.basename = 'config.js';
            path.extname = '';
            path.dirname = 'config';
        }))
        .pipe(gulp.dest(pathsStg.config));
});

// 拷贝 js
gulp.task('lib:stg', function() {
    return gulp.src(paths.lib)
        .pipe(gulp.dest(pathsStg.lib));
});

// 压缩 html
gulp.task('html:stg', function() {
    return gulp.src(paths.html)
        .pipe(htmlmin({
            //清除HTML注释
            removeComments: true,
            //压缩HTML
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(pathsStg.html));
});

// 图片压缩
// 图片压缩处理
gulp.task('image:stg', function() {
    return gulp.src(paths.image)
        .pipe(imagemin({
            optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            // interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            // multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest(pathsStg.image));
});


gulp.task('dev', ['concat:css', 'connect']);
gulp.task('stg', ['html:stg', 'image:stg', 'concat:css:stg', 'js:config:stg', 'lib:stg', 'js:stg']);
