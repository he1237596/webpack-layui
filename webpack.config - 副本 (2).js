let Path = require("path");
let webpack = require("webpack");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const getHtmlConfig = function(name){
  return new htmlWebpackPlugin({
      template:'./src/views/'+name+'.html',
      filename:'views/'+name+'.html',
      inject: true,
      hash:true,
      chunks:['base',name],
      chunksSortMode: "manual"
     })
}
const config = {
//entry: Path.resolve(__dirname,"./src/js/index.js"),

  entry: {
	"module": Path.resolve(__dirname,"./src/js/module.js"),
		"common": Path.resolve(__dirname,"./src/js/base/base.js"),
  	"login": Path.resolve(__dirname,"./src/js/login/login.js"),
  	"index": Path.resolve(__dirname,"./src/js/index/index.js"),
  	"test": Path.resolve(__dirname,"./src/js/test/test.js")
  	
  },

  output:{
  	path: Path.resolve(__dirname,"./dist"),
    // publicPath:"./dist",
//	filename:"index.js"
  	filename:"js/[name].js"
  },
  externals:{
        'jquery':'window.jQuery'//全局引入jq
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
            publicPath:"/"
          }
        }]
      }
   	]
   },
       devServer: {
        contentBase: Path.resolve(__dirname,"./dist"),
        host:"localhost",
        hot: true,
        inline: true,
        port:"8080"
    },
   plugins:[
     // new CleanWebpackPlugin(['dist']),
     new webpack.HotModuleReplacementPlugin(),//3热更新

   //独立通用模块
   	 new webpack.optimize.CommonsChunkPlugin({//抽取公共js.在入口中除了自身外被其他所有文件都有引入的文件会被抽取出来
   	 	name:"common",
   	 	filename:"js/common.js"
   	 }),
   	 //css单独打包
     new ExtractTextPlugin('css/[name].css'),
     //html模板处理
     new htmlWebpackPlugin({
      publicPath:"/dist",
     	template:'./src/views/index.html',
     	filename:'./views/index.html',
     	inject: true,
     	hash:true,
     	chunks:['common','index'],
     	chunksSortMode: "manual"
     }),
      getHtmlConfig('login') 
   ]
};

module.exports = config;