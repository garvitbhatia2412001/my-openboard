let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");

let download = document.querySelector(".download");

let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = []; // Data
let track = 0; // Represent which action from tracker array

let mousedown = false;

// API -> To Draw Graphics
let tool = canvas.getContext("2d");

/* 
OverView -> Canvas

tool.strokeStyle = "blue"; // Color of Element
tool.lineWidth = "5"; // Graphic Width
tool.beginPath(); // New Graphic (path) (line)
tool.moveTo(10, 10); // Start Point
tool.lineTo(100, 150) // End Point
tool.stroke(); // Fill Graphic (color)

tool.lineTo(200, 250); // Continue with existing path
tool.stroke(); 
*/

tool.strokeStyle = penColor; // Color of Element
tool.lineWidth = penWidth; // Graphic Width

// mouse down -> start new path, mousemove -> fill graphics
canvas.addEventListener("mousedown", (e)=>{
    mousedown = true;
    // beginPath({
    //     x: e.clientX,
    //     y: e.clientY
    // });

    let data = {
        x: e.clientX,
        y: e.clientY
    }
    // Send Data to Server
    socket.emit("beginPath", data);
})

canvas.addEventListener("mousemove", (e)=>{
    if (mousedown){

        let data = {
            x: e.clientX,
            y: e.clientY,
            color: eraserFlag?eraserColor:penColor,
            width: eraserFlag?eraserWidth:penWidth
        }

        socket.emit("drawStroke", data);

        // drawStroke({
        //     x: e.clientX,
        //     y: e.clientY,
        //     color: eraserFlag?eraserColor:penColor,
        //     width: eraserFlag?eraserWidth:penWidth
        // });
    }
})

canvas.addEventListener("mouseup", (e)=>{
    mousedown = false;

    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length - 1;
})

undo.addEventListener("click", (e)=>{
    if (track > 0){
        track--;
    }
    // action
    let data = {
        trackValue: track,
        undoRedoTracker
    }

    socket.emit("redoUndo", data);

    //undoRedoCanvas(trackObj);
})

redo.addEventListener("click", (e)=>{
    if (track < undoRedoTracker.length - 1){
        track++;
    }
    // action
    let data = {
        trackValue: track,
        undoRedoTracker
    }

    socket.emit("redoUndo", data);

    //undoRedoCanvas(trackObj);
})

function undoRedoCanvas(trackObj){
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[track];
    let img = new Image(); // new Image Reference Elem
    img.src = url;
    img.onload = (e)=>{
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

pencilColor.forEach((colorElem)=>{
    colorElem.addEventListener("click", (e)=>{
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
});

pencilWidthElem.addEventListener("change", (e)=> {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})

eraser.addEventListener("click", (e)=>{
    if (eraserFlag){
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    }else{
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

eraserWidthElem.addEventListener("change", (e)=>{
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})

download.addEventListener("click", (e)=>{

    let url = canvas.toDataURL();

    let a  = document.createElement("a");
    a.href = url;
    a.download = "board.png";
    a.click();

})

function beginPath(strokeObj){
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y);
}
function drawStroke(strokeObj){
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

socket.on("beginPath", (data)=>{
    // data -> Data from server
    beginPath(data);
})

socket.on("drawStroke", (data)=>{
    // data -> Data from server
    drawStroke(data);
})

socket.on("redoUndo", (data)=>{
    // data -> Data from server
    undoRedoCanvas(data);
})