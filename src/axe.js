/**
 * Simple AJAX request for resolve the jQuery dependencies
 *
 * http://youmightnotneedjquery.com/ 
 */
(function () {

    var Axe;

    Axe = function () {};

    Axe.configuration = {
        setRequestToken: function (_token) {
            this._token = _token;
        },
        getRequestToken: function () {
            return this._token;
        },
        hasRequestToken: function () {
            return typeof this._token === 'undefined' ? false : true;
        },
        setRequestContentType: function (_contentType) {
            this._contentType = _contentType;
        },
        getRequestContentType: function () {
            return this._contentType;
        },
        hasRequestContentType: function () {
            return typeof this._contentType === 'undefined' ? false:true;
        }
    };

    Axe.encodeObject = function (object) {
        var encodedString = '';
        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {
                if (encodedString.length > 0) {
                    encodedString += '&';
                }
                encodedString += encodeURI(prop + '=' + object[prop]);
            }
        }
        return encodedString;
    };

    Axe.grab = function (url, callback) {
        var request = new XMLHttpRequest();

        request.open('GET',url,true);

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                return callback(request.responseText);
            } else {
                return callback('error');
            }
        };

        request.onerror = function () {
            return callback('connection_error');
        };

        request.send();
    };

    Axe.cut = function (url, data, header, callback) {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        if (header !== null && header.length > 0) {
            for (var key in header) {
                request.setRequestHeader(key, header[key]);
            }
        }

        if (Axe.configuration.hasRequestToken()) {
            request.setRequestHeader('X-CSRF-TOKEN', Axe.configuration.getRequestToken());
        }

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                return callback(request.responseText);
            } else {
                return callback('error');
            }
        };

        request.onerror = function () {
            return callback('connection_error');
        };

        request.send(Axe.encodeObject(data));
    };

    Axe.slash = function (url, data, header, callback) {
        var request = new XMLHttpRequest();
        request.open('PUT', url);
        request.setRequestHeader('Content-Type', Axe.configuration.hasRequestContentType() ? Axe.configuration.getRequestContentType() : 'application/x-www-form-urlencoded');

        if (header !== null && header.length > 0) {
            for (var key in header) {
                request.setRequestHeader(key, header[key]);
            }
        }

        if (Axe.configuration.hasRequestToken()) {
            request.setRequestHeader('X-CSRF-TOKEN', Axe.configuration.getRequestToken());
        }

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                return callback(JSON.parse(request.responseText));
            } else {
                return callback('error');
            }
        };

        request.onerror = function () {
            return callback('connection_error');
        };

        request.send(JSON.stringify(data));        
    };

    window.Axe = Axe;

})();
