// Mock pour @angular/common/http
module.exports = {
  HttpClient: function() {
    return {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };
  }
}; 