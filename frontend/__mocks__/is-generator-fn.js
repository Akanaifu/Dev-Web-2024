// Mock pour is-generator-fn
module.exports = function isGeneratorFunction(value) {
  return typeof value === 'function' && 
         value.constructor && 
         value.constructor.name === 'GeneratorFunction';
}; 