// const { override, addWebpackPlugin } = require('customize-cra');
// const WebpackObfuscator = require('webpack-obfuscator');

// module.exports = override(
//   (config) => {
//     if (process.env.NODE_ENV === 'production') {
//       // Add the obfuscator plugin only in production
//       config.plugins.push(
//         new WebpackObfuscator(
//           {
//             rotateStringArray: true,
//             stringArray: true,
//             stringArrayThreshold: 0.75
//           },
//           ['excluded_bundle.js'] // Optionally specify files to exclude from obfuscation
//         )
//       );
//     }
//     return config;
//   }
// );
