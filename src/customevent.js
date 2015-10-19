/**
 * This the new Customevent's polyfill for IE9-IE10-IE11 compatibility.
 *
 * https://github.com/d4tocchini/customevent-polyfill/blob/master/CustomEvent.js 
 */
(function() {
        
    var CustomEvent;

    CustomEvent = function(event, params) {
      var evt;
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;

})();
