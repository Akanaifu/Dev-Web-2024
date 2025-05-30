// Mock pour @angular/core
module.exports = {
  Injectable: function(config) {
    return function(target) {
      return target;
    };
  },
  inject: function(token) {
    // Mock du HttpClient avec des méthodes qui retournent des Observables
    return {
      get: jest.fn().mockReturnValue({
        subscribe: jest.fn()
      }),
      post: jest.fn().mockReturnValue({
        subscribe: jest.fn()
      }),
      put: jest.fn().mockReturnValue({
        subscribe: jest.fn()
      }),
      delete: jest.fn().mockReturnValue({
        subscribe: jest.fn()
      })
    };
  },
  Component: function(config) {
    return function(target) {
      return target;
    };
  },
  NgModule: function(config) {
    return function(target) {
      return target;
    };
  }
}; 