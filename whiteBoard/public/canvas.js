var socket = io();
// This object holds the implementation of each drawing tool.
var tools = {};
var firsttime = true
var textarea;
var colorPicked = $("#colour-picker").val();
var lineWidthPicked = $("#line-Width").val();
//SelectedFontFamily
var SelectedFontFamily = "Arial";
var SelectedFontSize = "20";

// Keep everything in anonymous function, called on window load.
if (window.addEventListener) {
    window.addEventListener('load', function() {
        var canvas;
        var context;
        var canvaso
        var contexto;
        // The active tool instance.
        var tool;
        var tool_default = 'pencil';

        function init() {
            // Find the canvas element.
            canvaso = document.getElementById('imageView');
            // Get the 2D canvas context.
            contexto = canvaso.getContext('2d');
            // Add the temporary canvas.
            var container = canvaso.parentNode;
            canvas = document.createElement('canvas');
            canvas.id = 'imageTemp';
            canvas.width = canvaso.width;
            canvas.height = canvaso.height;
            container.appendChild(canvas);

            context = canvas.getContext('2d');

            var tool_select = document.getElementById('pencil-button');

            //Choose line Color
            $("#colour-picker").change(function() {
                colorPicked = $("#colour-picker").val();
            });
            //Choose line Width
            $("#line-Width").change(function() {
                lineWidthPicked = $("#line-Width").val();
            });
            $("#clear-all").click(function() {
                context.clearRect(0, 0, canvas.width, canvas.height);
                contexto.clearRect(0, 0, canvaso.width, canvaso.height);
                clearAll_update(true)
            });
            // Activate the default tool.
            if (tools[tool_default]) {
                tool = new tools[tool_default]();
                tool_select.value = tool_default;
            }

            function pic_tool_click(pick) {
                if (tools[pick.value]) {
                    tool = new tools[pick.value]();
                }
            }
            var list = ["#pencil-button","#rect-button","#circle-button","#ellipse-button","#line-button","#text-button"];

            //Giving funcctionality to every button(tools)
            for(var i=0;i<list.length;i++){
                $(list[i]).click(function() {
                    pic_tool_click(this)
                });
            }

            // $("#pencil-button").click(function() {
            //     pic_tool_click(this)
            // });
            // $("#rect-button").click(function() {
            //     pic_tool_click(this)
            // });
            // $("#circle-button").click(function() {
            //     pic_tool_click(this)
            // });
            // $("#ellipse-button").click(function() {
            //     pic_tool_click(this)
            // });
            // $("#line-button").click(function() {
            //     pic_tool_click(this)
            // });
            // $("#text-button").click(function() {
            //     pic_tool_click(this)
            // });

            // Attach the mousedown, mousemove and mouseup event listeners.
            canvas.addEventListener('mousedown', mouse_position, false);
            canvas.addEventListener('mousemove', mouse_position, false);
            canvas.addEventListener('mouseup', mouse_position, false);
        }

        // This function just determines the mouse position relative to the canvas element.
        function mouse_position(ev) {
            var CanvPos = canvas.getBoundingClientRect(); //To get Canvas Boundaries
            if (ev.clientX || ev.clientX == 0) {
                ev._x = ev.clientX - CanvPos.left;
                ev._y = ev.clientY - CanvPos.top;
            }
            // Call the event handler of the tool.
            var func = tool[ev.type];
            if (func) {
                func(ev);
            }
        }

        // This function draws the #imageTemp canvas on top of #imageView, after which 
        // #imageTemp is cleared. This function is called each time when the user 
        // completes a drawing operation.
        socket.on('copyCanvas', onCanvasTransfer);

        function onCanvasTransfer(data) {
            img_update();
        }

        function img_update(emit) {
            contexto.drawImage(canvas, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
            if (emit) {
                socket.emit('copyCanvas', {
                    transferCanvas: true
                });
            }
        }

        
        // The drawing pencil.
        socket.on('drawing', onDrawingEvent);

        function onDrawingEvent(data) {
            var w = canvaso.width;
            var h = canvaso.height;
            drawPencil(data.x0 * w,
                data.y0 * h,
                data.x1 * w,
                data.y1 * h,
                data.color,
                data.lineThickness);
        }

        function drawPencil(x0, y0, x1, y1, color, lineThickness, emit) {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = "#" + color;
            context.lineWidth = lineThickness;
            context.stroke();
            context.closePath();

            if (emit) {
                var w = canvaso.width;
                var h = canvaso.height;
                socket.emit('drawing', {
                    x0: x0 / w,
                    y0: y0 / h,
                    x1: x1 / w,
                    y1: y1 / h,
                    color: colorPicked,
                    lineThickness: lineWidthPicked
                });
            }

        }
        //Pencil tool
        tools.pencil = function() {
            var tool = this;
            this.started = false;
            textarea.style.display = "none";
            textarea.style.value = "";
            // This is called when you start holding down the mouse button.
            this.mousedown = function(ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };
            // This is called when you release the mouse button.
            this.mouseup = function(ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update(true);
                }
            };
            // This function is called every time you move the mouse. Obviously, it only 
            // draws if the tool.started state is set to true (when you are holding down 
            // the mouse button).
            this.mousemove = function(ev) {
                if (tool.started) {
                    drawPencil(tool.x0, tool.y0, ev._x, ev._y, colorPicked, lineWidthPicked, true);
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;
                }
            };

        };



        //Rectangle
        socket.on('rectangle', onDrawRect);

        function onDrawRect(data) {
            var w = canvaso.width;
            var h = canvaso.height;
            drawRect(data.min_x * w,
                data.min_y * h,
                data.abs_x * w,
                data.abs_y * h,
                data.color,
                data.lineThickness);
        }

        function drawRect(min_x, min_y, abs_x, abs_y, color, lineThickness, emit) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.strokeStyle = "#" + color;
            context.lineWidth = lineThickness;
            context.strokeRect(min_x, min_y, abs_x, abs_y);

            if (emit) {
                var w = canvaso.width;
                var h = canvaso.height;
                socket.emit('rectangle', {
                    min_x: min_x / w,
                    min_y: min_y / h,
                    abs_x: abs_x / w,
                    abs_y: abs_y / h,
                    color: colorPicked,
                    lineThickness: lineWidthPicked
                });
            }
        }
        // The rectangle tool.
        tools.rect = function() {
            var tool = this;
            this.started = false;
            textarea.style.display = "none";
            textarea.style.value = "";

            //above the tool function

            this.mousedown = function(ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function(ev) {
                if (tool.started) {
                    var pos_x = Math.min(ev._x, tool.x0),
                        pos_y = Math.min(ev._y, tool.y0),
                        pos_w = Math.abs(ev._x - tool.x0),
                        pos_h = Math.abs(ev._y - tool.y0);
                    context.clearRect(0, 0, canvas.width, canvas.height); //in drawRect
                    if (pos_w && pos_h) {
                        drawRect(pos_x, pos_y, pos_w, pos_h, colorPicked, lineWidthPicked, true);
                    }
                }
            };

            this.mouseup = function(ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update(true);
                }
            };
        };


        //Lines
        socket.on('linedraw', onDrawLines);

        function onDrawLines(data) {
            var w = canvaso.width;
            var h = canvaso.height;
            drawLines(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineThickness);
        }

        function drawLines(x0, y0, x1, y1, color, lineThickness, emit) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = "#" + color;
            context.lineWidth = lineThickness;
            context.stroke();
            context.closePath();

            if (emit) {
                var w = canvaso.width;
                var h = canvaso.height;
                socket.emit('linedraw', {
                    x0: x0 / w,
                    y0: y0 / h,
                    x1: x1 / w,
                    y1: y1 / h,
                    color: colorPicked,
                    lineThickness: lineWidthPicked
                });
            }


        }
        // The line tool.
        tools.line = function() {
            var tool = this;
            this.started = false;
            textarea.style.display = "none";
            textarea.style.value = "";

            this.mousedown = function(ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function(ev) {
                if (tool.started) {
                    drawLines(tool.x0, tool.y0, ev._x, ev._y, colorPicked, lineWidthPicked, true);
                }
            };

            this.mouseup = function(ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update(true);
                }
            };

        };



        //Circle 
        socket.on('circledraw', onDrawCircle);

        function onDrawCircle(data) {
            var w = canvaso.width;
            var h = canvaso.height;
            drawCircle(data.x1 * w,
                data.y1 * h,
                data.x2 * w,
                data.y2 * h,
                data.color,
                data.lineThickness);
        }

        function drawCircle(x1, y1, x2, y2, color, lineThickness, emit) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            var x = (x2 + x1) / 2;
            var y = (y2 + y1) / 2;

            var radius = Math.max(
                Math.abs(x2 - x1),
                Math.abs(y2 - y1)
            ) / 2;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2, false);
            context.closePath();
            context.strokeStyle = "#" + color;
            context.lineWidth = lineThickness;
            context.stroke();

            if (emit) {
                var w = canvaso.width;
                var h = canvaso.height;
                socket.emit('circledraw', {
                    x1: x1 / w,
                    y1: y1 / h,
                    x2: x2 / w,
                    y2: y2 / h,
                    color: colorPicked,
                    lineThickness: lineWidthPicked
                });
            }
        }
        // The Circle tool.
        tools.circle = function() {
            var tool = this;
            this.started = false;
            textarea.style.display = "none";
            textarea.style.value = "";

            this.mousedown = function(ev) {
                tool.started = true;
                var rect = canvas.getBoundingClientRect();
                tool.x1 = ev.clientX - rect.left;
                tool.y1 = ev.clientY - rect.top;
            };

            this.mousemove = function(ev) {
                if (tool.started) {
                    var rect = canvas.getBoundingClientRect();
                    tool.x2 = ev.clientX - rect.left;
                    tool.y2 = ev.clientY - rect.top;

                    context.clearRect(0, 0, canvas.width, canvas.height);
                    drawCircle(tool.x1, tool.y1, tool.x2, tool.y2, colorPicked, lineWidthPicked, true);
                }
            };

            this.mouseup = function(ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update(true);
                }
            };

        };



        //Ellipse 
        socket.on('ellipsedraw', onDrawEllipse);

        function onDrawEllipse(data) {
            drawEllipse(data.x, data.y, data.w, data.h, data.color, data.lineThickness);
        }

        function drawEllipse(x, y, w, h, color, lineThickness, emit) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            var ox, oy, xe, ye, xm, ym;
            var kappa = .5522848;
            ox = (w / 2) * kappa, // control point offset horizontal
                oy = (h / 2) * kappa, // control point offset vertical
                xe = x + w, // x-end
                ye = y + h, // y-end
                xm = x + w / 2, // x-middle
                ym = y + h / 2; // y-middle

            context.beginPath();
            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            context.closePath();
            context.strokeStyle = "#" + color;
            context.lineWidth = lineThickness;
            context.stroke();

            if (emit) {
                socket.emit('ellipsedraw', {
                    x: x,
                    y: y,
                    w: w,
                    h: h,
                    color: colorPicked,
                    lineThickness: lineWidthPicked
                });
            }
        }
        // The Ellipse tool.
        tools.ellipse = function() {
            var tool = this;
            this.started = false;
            textarea.style.display = "none";
            textarea.style.value = "";

            this.mousedown = function(ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function(ev) {
                if (tool.started) {
                    var x = Math.min(ev._x, tool.x0);
                    var y = Math.min(ev._y, tool.y0);
                    var w = Math.abs(ev._x - tool.x0);
                    var h = Math.abs(ev._y - tool.y0);

                    context.clearRect(0, 0, canvas.width, canvas.height);
                    drawEllipse(x, y, w, h, colorPicked, lineWidthPicked, true);
                }
            };

            this.mouseup = function(ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update(true);
                }
            };

        };

        //Text Tool start
        textarea = document.createElement('textarea');
        textarea.id = 'text_tool';
        textarea.focus();
        container.appendChild(textarea);
        // Text tool's text container for calculating lines/chars
        var tmp_txt_ctn = document.createElement('div');
        tmp_txt_ctn.style.display = 'none';
        container.appendChild(tmp_txt_ctn);


        //Text
        socket.on('textdraw', onTextDraw);

        function onTextDraw(data) {
            DrawText(data.fsize, data.ffamily, data.colorVal, data.textPosLeft, data.textPosTop, data.processed_linesArray);
        }

        function DrawText(fsize, ffamily, colorVal, textPosLeft, textPosTop, processed_lines, emit) {
            context.font = fsize + ' ' + ffamily;
            context.textBaseline = 'top';
            context.fillStyle = "#" + colorVal;

            for (var n = 0; n < processed_lines.length; n++) {
                var processed_line = processed_lines[n];
                context.fillText(
                    processed_line,
                    parseInt(textPosLeft),
                    parseInt(textPosTop) + n * parseInt(fsize)
                );
            }

            img_update(); //Already emitting no need true param
            if (emit) {
                socket.emit('textdraw', {
                    fsize: fsize,
                    ffamily: ffamily,
                    colorVal: colorVal,
                    textPosLeft: textPosLeft,
                    textPosTop: textPosTop,
                    processed_linesArray: processed_lines
                });
            }


        }
        //Text tool
        tools.text = function() {
            var tool = this;
            this.started = false;
            textarea.style.display = "none";
            textarea.style.value = "";

            this.mousedown = function(ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;

            };

            this.mousemove = function(ev) {
                if (tool.started) {
                    var x = Math.min(ev._x, tool.x0);
                    var y = Math.min(ev._y, tool.y0);
                    var width = Math.abs(ev._x - tool.x0);
                    var height = Math.abs(ev._y - tool.y0);

                    textarea.style.left = x + 'px';
                    textarea.style.top = y + 'px';
                    textarea.style.width = width + 'px';
                    textarea.style.height = height + 'px';

                    textarea.style.display = 'block';
                    textarea.style.color = "#" + colorPicked;
                    textarea.style.font = SelectedFontSize + 'px' + ' ' + SelectedFontFamily;
                }
            };

            this.mouseup = function(ev) {
                if (tool.started) {
                    //start      
                    var lines = textarea.value.split('\n');
                    var processed_lines = [];
                    for (var i = 0; i < lines.length; i++) {
                        var chars = lines[i].length;
                        for (var j = 0; j < chars; j++) {
                            var text_node = document.createTextNode(lines[i][j]);
                            tmp_txt_ctn.appendChild(text_node);
                            // Since tmp_txt_ctn is not taking any space
                            // in layout due to display: none, we gotta
                            // make it take some space, while keeping it
                            // hidden/invisible and then get dimensions
                            tmp_txt_ctn.style.position = 'absolute';
                            tmp_txt_ctn.style.visibility = 'hidden';
                            tmp_txt_ctn.style.display = 'block';

                            var width = tmp_txt_ctn.offsetWidth;
                            var height = tmp_txt_ctn.offsetHeight;

                            tmp_txt_ctn.style.position = '';
                            tmp_txt_ctn.style.visibility = '';
                            tmp_txt_ctn.style.display = 'none';

                            // Logix
                            //console.log(width, parseInt(textarea.style.width));
                            if (width > parseInt(textarea.style.width)) {
                                break;
                            }
                        }

                        processed_lines.push(tmp_txt_ctn.textContent);
                        tmp_txt_ctn.innerHTML = '';
                    }
                    var fs = SelectedFontSize + "px";
                    var ff = SelectedFontFamily;

                    DrawText(fs, ff, colorPicked, textarea.style.left, textarea.style.top, processed_lines, true)
                    console.log("lines saved")
                    textarea.style.display = 'none';
                    textarea.value = '';
                    //end
                    tool.mousemove(ev);
                    tool.started = false;
                }
            };
        };



        //ClearAll
        socket.on('Clearboard', onClearAll);

        function onClearAll(data) {
            clearAll_update();
        }

        function clearAll_update(trans) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            contexto.clearRect(0, 0, canvaso.width, canvaso.height);
            if (trans) {
                socket.emit('Clearboard', {
                    CleardrawingBoard: true
                });
            }
        }


        //Old Drawing
        socket.emit("message", "hello")
        socket.on("message", first)

        function first(data) {
            if (firsttime) {
                firsttime = false;
                var li = data;
                console.log(data);
                for (var i = 0; i < li.length; i++) {
                    if (li[i][0] == "pencil") {
                        onDrawingEvent(li[i][1]);
                    } else if (li[i][0] == 'rect') {
                        onDrawRect(li[i][1]);
                    } else if (li[i][0] == 'ell') {
                        onDrawEllipse(li[i][1]);
                    } else if (li[i][0] == 'line') {
                        onDrawLines(li[i][1]);
                    } else if (li[i][0] == 'circle') {
                        onDrawCircle(li[i][1]);
                    } else if (li[i][0] == 'text') {
                        onTextDraw(li[i][1]);
                    } else if (li[i][0] == 'cc') {
                        onCanvasTransfer(li[i][1]);
                    }
                }
            }
        }
        init();
    }, false);
}