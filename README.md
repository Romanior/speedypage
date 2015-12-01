# Speedypage
Collect performance and ajax metrics, send to the server by 'beacon', e.g.
```
http://0.0.0.0:8000/images/beacon.gif?timeToConnect=1&timeToFirstByte=3&timeToCompleteContentDownload=5&timeToDomInteractive=184&timeToLoad=437&timeToFirstPaint=448
```

```
>>> metric
>>> Object { ajaxMetrics: {Array}, metrics: {Object} }
```
Sends `metrics` object with parameters on complete page load.
```
metrics: {
	timeToConnect // time to connect
	timeToFirstByte // time to first byte
	timeToCompleteContentDownload // time to complete content download
	timeToDomInteractive // time to dom became interactive
	timeToLoad // time to load DOM
	timeToFirstPaint // time to first paint
}
```


Sends ajaxMetrics on each request.

```
http://0.0.0.0:8000/images/beacon.gif?requestCount=0&timeStamp=1448963244316&url=http%3A%2F%2F0.0.0.0%3A8000%2Fresponse.json&timing%5BtimeToReceive%5D=5.860000000000582&timing%5BtimeToProcess%5D=5.899999999994179&timing%5BtimeToResponseReady%5D=6.634999999994761
```

Where each request has object with performance information.
```
{
	requestCount
  	timeStamp
  	url
  	timing
}
```
			  
Where timing has properties:

```
timing: {
	timeToReceive 		// time to receive a response
	timeToProcess 		// time to process a response
	timeToResponseReady	// time to response is ready
}

```


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
