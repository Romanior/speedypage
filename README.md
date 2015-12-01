# Speedypage
Collect performance and ajax metrics, send to the server by 'beacon'.

```
>>> metric
>>> Object { ajaxMetrics: {Array}, metrics: {Object} }
```
Sends metrits object with parameters on complete page load.
metrics

// time to connect
timeToConnect

// time to first byte
timeToFirstByte

// time to complete content download
timeToCompleteContentDownload

// time to dom became interactive
timeToDomInteractive 

// time to load DOM
timeToLoad

// time to first paint
timeToFirstPaint


Sends ajaxMetrics on each request.
ajaxMetrics
```
{
  requestCount
  timeStamp
  url
  timing
}
```
			  
Where timing has properties:			  
// time to receive a response
timeToReceive
              
// time to process a response
timeToProcess

// time to response is ready
timeToResponseReady
             


# TODO's and considerations.

## Handling slow or unavailable connection

Metric should support queue of ajax metrics, should not send information one by one,
first of all it is inefficient, second with slow or lost connection, it would be hard to submit correct data.

Need to check if the server is available by attaching events to beacon, when try to resubmit when the last (un-submitted)
portion of the queue to the server when connection is back.

## Other features to consider

* Add IE9 url support for ajax metrics
* Check if the DNS lookup takes time and notify about it as well.
* Choose the correct start point for relative timings, consider parameters, can be navigationStart for example.
* Investigate why Chrome set sometimes firstPaintTime to 0.
* Load Metric script in non-blocking way, by attaching <script> tag to head.
* Add more metrics for ajax, time to connect, for example.
* add tests
