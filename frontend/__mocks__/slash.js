// Mock pour slash
module.exports = function slash(path) {
  return path.replace(/\\/g, '/');
}; 