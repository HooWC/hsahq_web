const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // 强制所有静态资源路径使用相对路径
  config.output.publicPath = './';
  
  // 修复 PWA 资源的路径（如 apple-touch-startup-image）
  if (config.plugins) {
    config.plugins.forEach(plugin => {
      if (plugin.constructor.name === 'WebpackPwaManifest') {
        plugin.options.publicPath = './';
      }
      
      // 确保 HtmlWebpackPlugin 添加正确的 viewport 设置
      if (plugin.constructor.name === 'HtmlWebpackPlugin') {
        if (!plugin.options.meta) {
          plugin.options.meta = {};
        }
        plugin.options.meta.viewport = 'width=device-width, initial-scale=1, maximum-scale=5.0, user-scalable=yes';
      }
    });
  }
  
  return config;
};