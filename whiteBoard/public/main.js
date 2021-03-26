// 'use strict';

// var socket = io();
// var canvas = document.getElementsByClassName('whiteboard')[0];
// var colors = document.getElementsByClassName('color');
// var context = canvas.getContext('2d');
// var current = {
//     color: 'black'
// };
// var drawing = false;

// canvas.addEventListener('mousedown', onMouseDown, false);
// canvas.addEventListener('mouseup', onMouseUp, false);
// canvas.addEventListener('mouseout', onMouseUp, false);
// canvas.addEventListener('mousemove', onMouseMove, false);

// for (var i = 0; i < colors.length; i++) {
//     colors[i].addEventListener('click', onColorUpdate, false);
// }

// socket.on('drawing', onDrawingEvent);

// function drawLine(x0, y0, x1, y1, color, emit) {
//     context.beginPath();
//     context.moveTo(x0, y0);
//     context.lineTo(x1, y1);
//     context.strokeStyle = color;
//     context.lineWidth = 2;
//     context.stroke();
//     context.closePath();
//     if (emit) {
//         socket.emit('drawing', {
//             x0: x0,
//             y0: y0,
//             x1: x1,
//             y1: y1,
//             color: color
//         });
//     }
// }

// function onMouseDown(e) {
//     drawing = true;
//     current.x = e.clientX;
//     current.y = e.clientY;
// }

// function onMouseUp(e) {
//     if (drawing) {
//         drawing = false;
//         drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
//     }
// }

// function onMouseMove(e) {
//     if (drawing) {
//         drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
//         current.x = e.clientX;
//         current.y = e.clientY;
//     }
// }

// function onColorUpdate(e) {
//     current.color = e.target.className.split(' ')[1];
// }
// /*
// // limit the number of events per second
// function throttle(callback, delay) {
//     var previousCall = new Date().getTime();
//     return function() {
//         var time = new Date().getTime();

//         if ((time - previousCall) >= delay) {
//             previousCall = time;
//             callback.apply(null, arguments);
//         }
//     };
// }*/

// function onDrawingEvent(data) {
//     var w = canvas.width;
//     var h = canvas.height;
//     drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
// }