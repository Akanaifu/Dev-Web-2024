// Mock pour RxJS
module.exports = {
  of: function(value) {
    return {
      subscribe: function(callback) {
        if (typeof callback === 'function') {
          callback(value);
        }
        return { unsubscribe: function() {} };
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
      }
    };
  }
}; 