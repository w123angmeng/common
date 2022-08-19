const {
    defineConfig
} = require("@vue/cli-service");

const path = require('path')
const resolve = (p) => path.resolve(__dirname, p)
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const {VueLoaderPlugin}  = require('vue-loader/dist/index')
const {VueLoaderPlugin} = require('vue-loader')
// 引入模块联邦
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
// const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// const { name } = require('./package');
// module.exports = defineConfig({
    // module.exports = {
    //     publicPath: "/",
    //     transpileDependencies: true,
    //     // external: {
    //     //     vue: 'Vue',
    //     //     'vue-router': 'VueRouter',
    //     //     vuex: 'Vuex',
    //     //     axios: 'axios',
            
    //     //   },
    //     devServer: {
    //         hot: true,
    //         port: 8089,
    //         host: "localhost",
    //       headers: {
    //         'Access-Control-Allow-Origin': '*',
    //       },
    //     //   proxy: {
    //     //     '/outpNurse': {
    //     //         target: 'http://localhost:8081',
    //     //     }
    //     //   }
    //     },
    //     configureWebpack: {
    //       output: {
    //         library: `${name}-[name]`,
    //         libraryTarget: 'umd', // 把微应用打包成 umd 库格式
    //         // jsonpFunction: `webpackJsonp_${name}`,
    //         chunkLoadingGlobal: `webpackJsonp_${name}`,
    //       },
    //     }
    //   };
module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
    ? '/his/'
    : "http://localhost:8083",
    lintOnSave: false,
    transpileDependencies: true,
    productionSourceMap: true,
    devServer: {
        hot: true,
        port: 8083,
        host: "localhost",
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
        // overlay: {
        //     warnings: false,
        //     errors: false
        // },
    },
    
    configureWebpack: {
        mode: 'development', // production development
        entry: {
            main: './src/main.js'
        },
        // cache: {
        //     type: "memory" // filessystem memory
        // },
        resolve: {
            extensions: [".vue", ".js", "json"],
            alias: {
                vue$: "vue/dist/vue.esm.js",
                "@": resolve("src"),
                crypto: false,
                stream: false,
                assert: false,
                http: false
            }
        },
        output: {
            path: resolve('./dist'),
            filename: "[name].js",
            chunkFilename: "[name].js",
            clean:true
            // publicPath: 'auto'
        },
        // output: {
        //     library: `${name}-[name]`,
        //     libraryTarget: 'umd', // 把微应用打包成 umd 库格式
        //     // jsonpFunction: `webpackJsonp_${name}`,
        //     chunkLoadingGlobal: `webpackJsonp_${name}`,
        // },
        // devtool: 'inline-source-map',
        devtool: false,
        optimization: {
            splitChunks: false
        },
        plugins: [
            // new VueLoaderPlugin(),
            // new CleanWebpackPlugin(),
            new ModuleFederationPlugin({
                name: 'lib_remote',
                filename: 'remoteEntry.js',
                exposes: {
                    './CommonDialog': './src/components/CommonDialog.vue'
                },
                shared: ['vue']
                // shared: {
                //     vue: {
                //         eager: true,
                //         singleton: true,
                //     }
                // }
            }),
            new HtmlWebpackPlugin({
                template: './public/index.html',
                templateParameters: {
                    BASE_URL: `./`
                },
                filename: 'entry1.html', // 此处新增
                inject: 'body', // true | 'head' | 'body' | false  ,注入所有的资源到特定的 template 或者 templateContent 中，如果设置为 true 或者 body，所有的 javascript 资源将被放置到 body 元素的底部，'head' 将放置到 head 元素中
                // url: BASE_URL,  //需要这里传参
                // chunksSortMode:'manual',
                // chunks: ['index', "entry1"]
                // chunks: ['lib_remote','main'],
                // chunksSortMode: "manual"
                chunks: ['lib_remote','qiankunmain', 'outpNurse','main'],
                chunksSortMode: "manual"
            }),
        ],
        module: {
            // rules: [
            //     {
            //         test: /\.js$/,
            //         exclude: /node_modules/,
            //         use: [{
            //             loader: "babel-loader",
            //             options: {
            //                 presets: [
            //                     '@babel/preset-env'
            //                 ]
            //             }
            //         }]
            //     },
            //     // {
            //     //     test: /\.vue$/,
            //     //     use: ['vue-loader']
            //     // }
            // ]
        },
    }
}