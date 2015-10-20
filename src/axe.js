/**
 * Simple AJAX request for resolve the jQuery dependencies
 *
 * http://youmightnotneedjquery.com/ 
 */
(function () {

    var Axe;

    Axe = function () {};

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
    }

    Axe.cut = function (url, data, header, callback) {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        if (header != null && header.length > 0) {
            for (var key in header) {
                request.setRequestHeader(key, header[key]);
            }
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
    }

    Axe.slash = function (url, data, header, callback) {
        var request = new XMLHttpRequest();
        request.open('PUT', url, true);
        //request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

        if (header != null && header.length > 0) {
            for (var key in header) {
                request.setRequestHeader(key, header[key]);
            }
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
    }

    window.Axe = Axe;

})();
