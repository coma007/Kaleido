/* global Mermaid:false */

const semver = require('semver')
const hasOwn = require('object.hasown')
const cst = require('./constants');
const parse = require('./parse');

if (!Object.hasOwn) {
	hasOwn.shim();
}

/**
 * @param {object} info : info object
 *  - data
 *  - format
 *  - width
 *  - height
 *  - scale
 *  - config
 * @param {string} mermaidConfig: mermaid initialization config object
 */
function render (info, mermaidConfig) {

  parsed = parse(info, mermaidConfig);
  if (parsed.code !== 0) {
    // Bad request return promise with error info
    return new Promise((resolve) => {resolve(parsed)})
  }

  // Initialize mermaid object
  mermaidConfigObject = JSON.parse(mermaidConfig)
  // TODO for v<10 initialize with mermaid.init(mermaidConfigObject)
  mermaid.initialize( mermaidConfigObject )

  // Set diagram config
  mermaid.mermaidAPI.setConfig(parsed.config);
  
  let errorCode = 0
  let result = null
  let errorMsg = null
  let pdfBgColor = null
  
  const done = () => {
    if (errorCode !== 0 && !errorMsg) {
      errorMsg = cst.statusMsg[errorCode]
    }

    return {
      code: errorCode,
      message: errorMsg,
      pdfBgColor,
      format: parsed.format,
      result,
      width: parsed.width,
      height: parsed.height,
      scale: parsed.scale,
    }
  }

  let promise

  // TODO create different rendering call for v<10 and v>=10 of mermaidjs ?

  promise = mermaid.render("graph", parsed.data)

  let exportPromise = promise.then((imgData) => {
      result = imgData.svg
      return done()
    })

  return exportPromise
      .catch((err) => {
        errorCode = 525
        errorMsg = err.message
        result = null;
        return done()
      })
}

module.exports = render
