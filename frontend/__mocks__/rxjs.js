// Mock pour RxJS
module.exports = {
  Observable: class {
    constructor(subscriber) {
      this.subscriber = subscriber;
    }
    
    subscribe(observer) {
      if (typeof observer === 'function') {
        observer = { next: observer };
      }
      
      const subscription = {
        unsubscribe: jest.fn()
      };
      
      if (this.subscriber) {
        this.subscriber({
          next: observer.next || jest.fn(),
          error: observer.error || jest.fn(),
          complete: observer.complete || jest.fn()
        });
      }
      
      return subscription;
    }
    
    pipe(...operators) {
      // Appliquer les opérateurs (mock simplifié)
      return this;
    }
  },
  
  of: function(value) {
    return {
      subscribe: function(callback) {
        if (typeof callback === 'function') {
          callback(value);
        }
        return { unsubscribe: function() {} };
      },
      pipe: function(...operators) {
        return this;
      }
    };
  },
  
  throwError: function(error) {
    return {
      subscribe: function(success, errorCallback) {
        if (typeof errorCallback === 'function') {
          errorCallback(error);
        }
        return { unsubscribe: function() {} };
      },
      pipe: function(...operators) {
        return this;
      }
    };
  },
  
  // Opérateurs RxJS
  take: function(count) {
    return function(source) {
      return {
        subscribe: function(observer) {
          return source.subscribe(observer);
        },
        pipe: function(...operators) {
          return this;
        }
      };
    };
  },
  
  map: function(mapFunction) {
    return function(source) {
      return {
        subscribe: function(observer) {
          return source.subscribe(observer);
        },
        pipe: function(...operators) {
          return this;
        }
      };
    };
  },
  
  filter: function(predicate) {
    return function(source) {
      return {
        subscribe: function(observer) {
          return source.subscribe(observer);
        },
        pipe: function(...operators) {
          return this;
        }
      };
    };
  },
  
  tap: function(tapFunction) {
    return function(source) {
      return {
        subscribe: function(observer) {
          return source.subscribe(observer);
        },
        pipe: function(...operators) {
          return this;
        }
      };
    };
  },
  
  catchError: function(handler) {
    return function(source) {
      return {
        subscribe: function(observer) {
          return source.subscribe(observer);
        },
        pipe: function(...operators) {
          return this;
        }
      };
    };
  },
  
  switchMap: function(mapFunction) {
    return function(source) {
      return {
        subscribe: function(observer) {
          return source.subscribe(observer);
        },
        pipe: function(...operators) {
          return this;
        }
      };
    };
  },
  
  // Classes pour les Subjects
  Subject: class {
    constructor() {
      this.observers = [];
    }
    
    next(value) {
      this.observers.forEach(obs => obs.next && obs.next(value));
    }
    
    error(err) {
      this.observers.forEach(obs => obs.error && obs.error(err));
    }
    
    complete() {
      this.observers.forEach(obs => obs.complete && obs.complete());
    }
    
    subscribe(observer) {
      if (typeof observer === 'function') {
        observer = { next: observer };
      }
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
    
    pipe(...operators) {
      return this;
    }
    
    asObservable() {
      return this;
    }
  },
  
  BehaviorSubject: class {
    constructor(initialValue) {
      this.value = initialValue;
      this.observers = [];
    }
    
    next(value) {
      this.value = value;
      this.observers.forEach(obs => obs.next && obs.next(value));
    }
    
    getValue() {
      return this.value;
    }
    
    subscribe(observer) {
      if (typeof observer === 'function') {
        observer = { next: observer };
      }
      this.observers.push(observer);
      // Émettre immédiatement la valeur actuelle
      if (observer.next) {
        observer.next(this.value);
      }
      return {
        unsubscribe: () => {
          const index = this.observers.indexOf(observer);
          if (index > -1) {
            this.observers.splice(index, 1);
          }
        }
      };
    }
    
    pipe(...operators) {
      return this;
    }
    
    asObservable() {
      return this;
    }
  }
}; 