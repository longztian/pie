require('babel-register')({
  plugins: [
    'transform-es2015-modules-commonjs',
    'transform-object-rest-spread',
  ],
})

require('./server.js')
