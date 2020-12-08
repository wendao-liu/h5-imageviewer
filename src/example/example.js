import React from 'react'
import ReactDOM from 'react-dom'
import ExampleNode from './ExampleNode';
import ReconnectingWebSocket from './websocket';

var socket = null;

function createWS() {
  if (ReconnectingWebSocket) {
    socket = new ReconnectingWebSocket("ws://30.43.124.200:5250/websocket");
    socket.onmessage = function (event) {
      console.log(event.data, 'event.data');

    };
    socket.onopen = function (event) {
      console.log('打开WebSocket服务正常，浏览器支持WebSocket!');
    };
    socket.onclose = function (event) {
      console.log('WebSocket 关闭!');
    };
  } else {
    alert("抱歉，您的浏览器不支持WebSocket协议!");
  }
  return socket
}

function send() {
  let message = 0x89
  if (!window.WebSocket) {
    return;
  }
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(message);
  } else {
    console.log("WebSocket连接没有建立成功!");
  }
}

createWS()

send();


ReactDOM.render(
  <ExampleNode />,
  document.getElementById('root')
)
