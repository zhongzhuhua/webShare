var path = require('path');
var swig = require('swig');
var webpack = require('webpack');
var del = require('del');
var utils = require('./utils');
var entryMap = utils.getEntryMap();
var pageList = require('./server/routes/pagelist.json');
var minify = require('html-minifier').minify;

// 复制插件，把 client/libs 下所有插件原封不动搬到 libs 下
var TransferWebpackPlugin = require('transfer-webpack-plugin');
var pluginsCopy = new TransferWebpackPlugin([
  { from: './client/libs', to: './libs' }
], path.resolve(__dirname));

// 独立打包文件
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extractCSS = new ExtractTextPlugin('./css/[name].[chunkhash:8].css');

var plugins = [
  pluginsCopy,
  new webpack.optimize.CommonsChunkPlugin('js/common.[chunkhash:8].js'),
  extractCSS
];
// 如果不是 view 则启用脚本压缩
var uglifyPlugin = null;
if (process.env.NODE_ENV !== 'view') {

  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      }
    })
  );

}



// 项目配置
var configs = {
  path: './public/',
  resolve: 'client/js',
  extensions: ['', '.js', '.json', '.scss', '.css']
};

// 打包所需配置
var webpackConfigs = {

  // 插件
  plugins: plugins,

  // 脚本入口文件配置
  entry: entryMap,

  // 打包后，脚本文件输出配置， path 配置所有输出的根目录
  output: {
    filename: 'js/[name].[chunkhash:8].js', //html(或者模板)页面将引入的是这个js，这里的name就是上面entry中的K值
    path: configs.path
  },

  // 其他方案入口，webpack 从该配置进入查找所有文件
  resolve: {
    // 入口根文件夹
    root: path.resolve(process.cwd(), configs.resolve),
    // 默认文件后缀
    extensions: configs.extensions,
    // 别名配置
    alias: {
      gm: 'vendors/global'
    }
  },

  // 全局插件
  externals: {
    jquery: 'jQuery'
  },

  module: {
    //加载器配置
    loaders: [{
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.scss$/,
      include: /client/,
      exclude: /(node_modules|bower_components)/,
      loader: extractCSS.extract(['css?minimize', 'sass?sourceMap'])
    }]
  },
};


// 文件 hash 值
var hashJson = {};
var rootPath = path.resolve('public');

// 删除源打包文件
del.sync(configs.path);
console.log('webpack remove public...');

// 执行回调
webpack(webpackConfigs, function() {

  // 遍历脚本 hash
  var list = utils.getAllFiles('public/js', /\.js$/);
  list.forEach(function(item, index) {
    var name = item.replace(rootPath + '/js/', '');
    var key = name.substring(0, name.lastIndexOf('.js') - 9) + '.js';
    if (key != '') {
      hashJson[key] = name;
    }
  });

  // 便利样式 hash
  list = utils.getAllFiles('public/css', /\.css$/);
  list.forEach(function(item, index) {
    var name = item.replace(rootPath + '/css/', '');
    var key = name.substring(0, name.lastIndexOf('.css') - 9) + '.css';
    if (key != '') {
      hashJson[key] = name;
    }
  });

  console.log('webpack hash success...');

  // swig to html
  pageList.forEach(function(item, index) {

    // 遍历并且替换文件
    var filePath = path.resolve('server/views', item.render + '.html');
    if (item && item.data) {
      var slug = item.data.slug;
      var clazz = item.data.clazz;

      slug = slug != null && slug != '' ? slug + '.js' : '';
      clazz = clazz != null && clazz != '' ? clazz + '.css' : '';

      item.data.slug = hashJson[slug] != null ? hashJson[slug].replace(/.js$/, '') : hashJson[slug];
      item.data.clazz = hashJson[clazz] != null ? hashJson[clazz].replace(/.css$/, '') : hashJson[clazz];

      // common.js 文件 hash
      item.data.commonjs = hashJson['common.js'];
    }

    // 生成文件
    var content = swig.renderFile(filePath, item.data);

    // 浏览状态不压缩 html 源m
    if (process.env.NODE_ENV !== 'view') {
      content = minify(content, {
        // 去掉注释
        removeComments: true,
        // 去掉空格
        collapseWhitespace: true,
        // 保留 ' "
        quoteCharacter: true
      });
    }
    utils.createFile('public/' + item.render + '.html', content, {});

  });

  console.log('build html success...');

});
