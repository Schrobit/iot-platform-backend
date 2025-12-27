const svgCaptcha = require('svg-captcha')

function generateCaptcha() {
  return svgCaptcha.create({
    size: 4,
    noise: 2,
    ignoreChars: '0oO1ilI', // 避免易混淆字符
    color: true,
    background: '#f2f2f2'
  })
}

module.exports = { generateCaptcha }
