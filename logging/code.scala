  def monitoring = WebSocket.using[String] { request =>
    // Ignore any input
    val in = Iteratee.ignore[String]

    // Create combined (interleaved) Enumerator from Streams
    val out =
      Streams.getRequestsPerSecond >-
      Streams.getCPU >-
      Streams.getHeap

    // Return input / output for websocket
    (in, out)
  }

  val getHeap = Enumerator.fromCallback{ () =>
    Promise.timeout(
      Some((Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / (1024*1024) + ":memory"),
      100, TimeUnit.MILLISECONDS)
  }

        var WS = window['MozWebSocket'] ? MozWebSocket : WebSocket
        var socket = new WS(socketUrl)
        socket.onmessage = function (event) {
            var d = event.data.split(":");
            app.lastCall = (new Date()).getTime();
            if (d.length == 2) {
                app[d[1]].update(d[0]);
            }
        };

