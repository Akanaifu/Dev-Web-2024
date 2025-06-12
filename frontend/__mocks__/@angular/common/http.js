// Mock pour @angular/common/http
module.exports = {
  HttpClient: class {
    get = jest.fn().mockReturnValue({
      subscribe: jest.fn()
    });
    
    post = jest.fn().mockReturnValue({
      subscribe: jest.fn()
    });
    
    put = jest.fn().mockReturnValue({
      subscribe: jest.fn()
    });
    
    delete = jest.fn().mockReturnValue({
      subscribe: jest.fn()
    });
  },
  
  HttpHeaders: class {
    constructor(headers) {
      this.headers = headers || {};
    }
    
    set(key, value) {
      this.headers[key] = value;
      return this;
    }
    
    get(key) {
      return this.headers[key];
    }
  },
  
  HttpParams: class {
    constructor() {
      this.params = {};
    }
    
    set(key, value) {
      this.params[key] = value;
      return this;
    }
    
    get(key) {
      return this.params[key];
    }
  }
}; 