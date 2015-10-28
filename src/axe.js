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
        }
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

        request.send(data);
    };

    Axe.slash = function (url, data, header, callback) {
        var request = new XMLHttpRequest();
        request.open('PUT', url, true);
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

        request.send(data);
    };

    window.Axe = Axe;

})();
