let Path = require("path");
let webpack = require("webpack");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
//判断是否生产模式
const isProduction = process.env.NODE_ENV === "production";
const getHtmlConfig = function(name,title){
  return new htmlWebpackPlugin({
      template:'./src/views/'+name+'.html',
      filename:'views/'+name+'.html',
      inject: true,
      hash:true,
      title:title,
      chunks:['common',name],
      chunksSortMode: "manual"
     })
}
const config = {
//entry: Path.resolve(__dirname,"./src/js/index.js"),

  entry: {
	"module": Path.resolve(__dirname,"./src/pages/module.js"),
		// "common": [Path.resolve(__dirname,"./src/js/base/base.js"),'webpack-dev-server/client?http://localhost:8088/'],
    "common": [Path.resolve(__dirname,"./src/pages/base/base.js"),Path.resolve(__dirname,"./src/pages/common/index.js"),],
  	"login": Path.resolve(__dirname,"./src/pages/login/login.js"),
  	"index": Path.resolve(__dirname,"./src/pages/index/index.js"),
  	// "test": Path.resolve(__dirname,"./src/js/test/test.js")
  	
  },

  output:{
  	path: Path.resolve(__dirname,"dist"),
    // path: "dist",
    // publicPath:"./dist",
//	filename:"index.js"
  	filename:"pages/[name].js"
  },
  externals:{
        'jquery':'window.jQuery',//全局引入jq
        'layui':'layui',//全局引入jq

   },
   module:{
   	rules:[
   	// {test:/\.css$/,use:["style-loader","css-loader"]}
      {
        test:/\.css$/,
        use:ExtractTextPlugin.extract({
                  fallback:"style-loader",
                  use:"css-loader"
              })
      },
      {
        test:/\.(gif|png|jpg|woff|svg|eot|ttf)\??.*$/,
        // use:['url-loader?limit=100&name=resource/[name].[ext]','file-loader']
        use:[{
          loader:'url-loader',
          options:{
            limit: 100,
            // name:"resource/[name]-[hash:5].[ext]"
            name:"resource/[name]-[hash:5].[ext]",

            publicPath: "../"
          }
        }]
      }
   	]
   },
       devServer: {
        // contentBase: Path.resolve(__dirname,"./dist"),
        contentBase:"./dist",

        host:"localhost",
        // hot: true,
        inline: true,
        port:"8088"
    },
    resolve:{
      alias:{
        base:__dirname + "./src/base",
        modules:__dirname + "./node_modules",

        // layui: __dirname + "./src/lib/layui/layui.all.js"
      }
    },
   plugins:[
     // new CleanWebpackPlugin(['dist']),
     // new webpack.HotModuleReplacementPlugin(),//3热更新

   //独立通用模块
   	 new webpack.optimize.CommonsChunkPlugin({//抽取公共js.在入口中除了自身外被其他所有文件都有引入的文件会被抽取出来
   	 	name:"common",
   	 	filename:"pages/common.js"
   	 }),

    new CopyWebpackPlugin([ //支持输入一个数组
        {
            from: Path.resolve(__dirname, '/src/lib'), //将src/assets下的文件
            to: './lib' // 复制到publiv
        },{
          from:Path.resolve(__dirname,__dirname + "/node_modules/reset-css/reset.css"),
            to: './css'
        }
    ]),
   	 //css单独打包
     new ExtractTextPlugin('css/[name].css'),
     //html模板处理
     new htmlWebpackPlugin({
      // publicPath:"/dist",
     	template:'./src/views/index.html',
     	filename:'./views/index.html',
     	inject: true,
     	hash:true,
      title:"首页",
     	chunks:['common','index'],
     	chunksSortMode: "manual"
     }),
      getHtmlConfig('login',"登录") 
   ]
};

module.exports = config;
//生产模式
if (isProduction) {
    module.exports.devtool = "source-map";
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        //uglifyJs压缩
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true
        })
    ]);
}