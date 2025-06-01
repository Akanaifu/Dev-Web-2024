// Mock pour rxjs/operators
module.exports = {
  map: function() {
    return function(observable) {
      return observable;
    };
  },
  catchError: function() {
    return function(observable) {
      return observable;
    };
  }
}; 