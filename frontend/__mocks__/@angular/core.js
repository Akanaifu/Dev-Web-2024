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
  },
  
  // Decorators Angular manquants
  Inject: function(token) {
    return function(target, propertyKey, parameterIndex) {
      return target;
    };
  },
  
  ViewChild: function(selector, options) {
    return function(target, propertyKey) {
      return target;
    };
  },
  
  ViewChildren: function(selector, options) {
    return function(target, propertyKey) {
      return target;
    };
  },
  
  ContentChild: function(selector, options) {
    return function(target, propertyKey) {
      return target;
    };
  },
  
  HostListener: function(event, args) {
    return function(target, propertyKey, descriptor) {
      return descriptor;
    };
  },
  
  Input: function(bindingPropertyName) {
    return function(target, propertyKey) {
      return target;
    };
  },
  
  Output: function(bindingPropertyName) {
    return function(target, propertyKey) {
      return target;
    };
  },
  
  // Tokens et constantes Angular
  PLATFORM_ID: 'mock-platform-id',
  
  EventEmitter: class {
    constructor() {
      this.observers = [];
    }
    
    emit(value) {
      this.observers.forEach(observer => observer(value));
    }
    
    subscribe(observer) {
      this.observers.push(observer);
      return {
        unsubscribe: () => {
          const index = this.observers.indexOf(observer);
          if (index > -1) {
            this.observers.splice(index, 1);
          }
        }
      };
    }
  },
  
  // Classes utilitaires
  ElementRef: class {
    constructor(nativeElement) {
      this.nativeElement = nativeElement || document.createElement('div');
    }
  }
}; 