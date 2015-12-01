/**
 * Collecting performance and ajax metrics
 *
 * TODO: add consideration of DNS lookups (probably it is more correct start point)
 * or navigationStart? I'm a bit confused about correct starting point.
 * Chrome considers start time as a navigationStart it its loadedTimes
 *
 * >>> metric
 * >>> Object { ajaxMetrics: Array[0], metrics: Object }
 *
 */

(function (global) {
  "use strict";

  var config = {
    serverBeacon: '/images/beacon.gif',
    isTrackAjax: true
  };

  /**
   * Metric constructor
   * var metric = new Metric(global.performance, config);
   * @param performance
   * @param config {Object}
   * @returns {Object}
   * @constructor
   */
  var Metric = function (performance, config) {
    var timing,
        requestCount = 0,
        metrics = {},
        ajaxMetrics = [];

    this.config = config;
    this.ajaxMetrics = ajaxMetrics;

    if (performance && performance.timing) {
      this.performance = performance;
      timing = performance.timing;
    } else {
      return global.console.error('performance API is not supported');
    }

    metrics = this._setupMetrics(metrics, timing);

    if (this.config.isTrackAjax) {
      this._attachAjaxMetrics(requestCount);
    }

    return{
      ajaxMetrics: ajaxMetrics,
      metrics: metrics
    };
  };

  Metric.prototype = {
    /**
     * Serialize Object into query-params string
     * Uses to send information to server
     * @param obj
     * @param prefix
     * @returns {string}
     */
    serializeData: function (obj, prefix) {
      var str = [];
      for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
          var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
          str.push(typeof v === "object" ?
            this.serializeData(v, k) :
          encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
      }
      return str.join("&");
    },

    /**
     * Setup initial performance metrics
     * @param metrics {Object}
     * @param timing
     * @returns {*}
     * @private
     */
    _setupMetrics: function (metrics, timing) {
      var firstPaint = 0,
          start,
          _this = this;

      start = timing.connectStart;

      // time to connect
      metrics.timeToConnect = timing.connectEnd - start;

      // time to first byte
      metrics.timeToFirstByte = timing.responseStart - start;

      // time to complete content download
      metrics.timeToCompleteContentDownload = timing.responseEnd - start;

      var domMetrics = function () {
        // time to dom interactive
        metrics.timeToDomInteractive = timing.domInteractive - start;
        metrics.timeToLoad = timing.loadEventEnd - start;

        // Adapted from https://github.com/addyosmani/timing.js/blob/master/timing.js
        // Chrome
        if (global.chrome && global.chrome.loadTimes) {
          // Convert to ms
          // FIXME: sometimes Chrome sets firstPaintTime to 0
          firstPaint = global.chrome.loadTimes().firstPaintTime * 1000;
          metrics.timeToFirstPaint = Math.round(firstPaint - start);
        }
        // IE
        else if (typeof timing.msFirstPaint === 'number') {
          firstPaint = timing.msFirstPaint;
          metrics.timeToFirstPaint = firstPaint - start;
        }
        // Firefox
        else if (timing.navigationStart && global.mozAnimationStartTime) {
          // based on specification of animation frame, its start time should give
          // the time when first paint occurs
          firstPaint = global.mozAnimationStartTime;
          metrics.timeToFirstPaint = firstPaint - start;
        }

        // try to send initial metrics
        _this._sendData(metrics);
      };

      global.addEventListener('load', function () {
        setTimeout(domMetrics, 100);
      });

      return metrics;
    },

    /**
     * Attach ajax metrics to all ajax request on the page
     * tracks:
     *  TODO time to connect,
     *  time to receive a request
     *  time to process
     *  time to response is ready,
     *
     *  All timings are relative to the start of request
     *
     * @param requestCount
     * @private
     */
    _attachAjaxMetrics: function (requestCount) {
      var openOriginal = XMLHttpRequest.prototype.send,
          timeStart,
          _this = this,
          perf = this.performance;

      // TODO add time to connect from XMLHttpRequest.open

      XMLHttpRequest.prototype.send = function (event) {
        var data = {},
            timing = {};
        timeStart = perf.now();

        this.addEventListener('readystatechange', function (event) {
          switch (this.readyState) {
            case 2:
              // time to receive a response
              timing.timeToReceive = perf.now() - timeStart;
              break;

            case 3:
              // time to process response
              timing.timeToProcess = perf.now() - timeStart;
              break;

            case 4:
              // time to response is ready
              timing.timeToResponseReady = perf.now() - timeStart;
              // gather up all data and send to the server via beacon

              data = {
                requestCount: requestCount++,
                timeStamp: event.timeStamp,
                url: this.responseURL, // IE9 does not support it, should be handled in 'open'
                timing: timing
              };
              _this._sendData(data);
              _this._collect(data);
          }
        });
        openOriginal.apply(this, arguments);
      };
    },

    /**
     * Send data to the server with beacon, serialize object to query params
     * @param data
     * @private
     */
    _sendData: function (data) {
      var i = new Image();
      i.src = this.config.serverBeacon + '?' + this.serializeData(data);
    },

    /**
     * Collect data, just pushing into array
     * TODO implement queuing to handle edge cases with connection
     * @param data
     * @private
     */
    _collect: function(data){
      this.ajaxMetrics.push(data);
    }
  };

  global.metric = global.metric || new Metric(global.performance, config);
}(window));
