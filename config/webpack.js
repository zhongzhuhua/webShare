var path = require('path');
var webpack = require('webpack');
var utils = require('./utils');

// entry 
var entryMap = utils.getEntryMap();
for (var key in entryMap) {
  entryMap[key].push('webpack-hot-middleware/client?reload=true');
};

// 第三方插件配置，需要配置 resolve.alias 使用，这个配置是为了 script src="" 不报错
entryMap['libs/jquery'] = ['./client/libs/jquery'];

module.exports = {
  // 插件
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin('js/common.js')
  ],

  // 脚本入口文件配置
  entry: entryMap,

  // 打包后，脚本文件输出配置
  output: {
    filename: '[name].js', //html(或者模板)页面将引入的是这个js，这里的name就是上面entry中的K值
    path: '/public/'
  },

  // 其他方案入口，webpack 从该配置进入查找所有文件
  resolve: {
    // 入口根文件夹
    root: path.resolve(process.cwd(), 'client/'),
    // 默认文件后缀
    extensions: ['', '.js', '.json', '.scss'],
    // 配置别名
    alias: {
      gm: 'js/vendors/global',
      jquery: 'libs/jquery'
    }
  },

  module: {
    //加载器配置
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.scss$/, loader: 'style!css!sass?sourceMap' }
    ]
  },
};
