const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img"),
    ctx = canvas.getContext("2d"),             // getContext() method returns a drawing context on the canvas
   undoButton = document.querySelector(".undo-button"),
   drawingHistory = [];
// global variables with default value


let prevMouseX, prevMouseY, snapshot,
    isDrawing = false;
selectedTool = "brush",
    brushWidth = 5,
    drawingIndex = -1,
    selectedColor = "#000";
  
const setCanvasBackground = () => {
    // setting whole canvas background to white, so the downloaded img background will be white
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;     // setting fillStyle back to the selectedColor, it'll be the brush color
}

window.addEventListener("load", () => {
    // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawRect = (e) => {
    // if fillcolor isn't checked draw a rect with border else draw rect with background
    if (!fillColor.checked) {
        // creating circle according to the mouse pointer
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);    // strokeRect(x-coordinate, y-coordinate, width, height) 
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

const drawCircle = (e) => {
    ctx.beginPath();     // creating new path to draw circle
    // getting radius for circle according to the mouse pointer
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);    // creating circle according to the mouse pointer >> ctx.arc(x-coordinate, y-coordinate, radius, start angle, end angle)
    fillColor.checked ? ctx.fill() : ctx.stroke();     // if fillcolor is checked fill circle else draw border circle
}

const drawTriangle = (e) => {
    ctx.beginPath();     // creating new path to draw triangle 
    ctx.moveTo(prevMouseX, prevMouseY);     // moving triangle to the mouse pointer
    ctx.lineTo(e.offsetX, e.offsetY);    // creating first line according to the mouse pointer
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);   // creating bottom line of triangle
    ctx.closePath();    // closing path of a triangle so the third line draw automatically
    fillColor.checked ? ctx.fill() : ctx.stroke();     // if fillcolor is checked fill triangle else draw border
}

function startDraw(e) {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    saveCanvasState(); // Save the current canvas state before starting a new drawing action
}
const drawing = (e) => {
    if (!isDrawing) return;    //if isDrawing is false return from here
    ctx.putImageData(snapshot, 0, 0);    // adding copied canvas data on to this canvas

    if (selectedTool === "brush" || selectedTool === "eraser") {
        // if selected tool is eraser then set strokeStyle to white
        // to paint white color on to the existing canvas content else set the stroke color to selected color
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);    // lineTo(x-coordinate, y-coordinate) >> creates a new line
        // offsetX/Y returns X & Y coordinate of mouse pointer
        ctx.stroke();      // drawing/filling line with color
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else {
        drawTriangle(e);
    }

}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {     //adding click event to all tool option
        //removing active class from the previous option and adding on current clicked option
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        console.log(selectedTool);
    });
});

sizeSlider.addEventListener("change", (e) => brushWidth = sizeSlider.value);   // passing slider value as brushWidth

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {     // adding click event to all color button
        //removing selected class from the previous option and adding on current clicked option
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        // passing selected btn background color as selectedColor value
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", (e) => {
    // passing picked color value from color picker to last color btn background
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);   // clearing whole canvas
    setCanvasBackground();
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a");    // creating <a> element
    link.download = `${Date.now()}.jpg`;      // passing current data as link download value
    link.href = canvas.toDataURL();          // passing canvasData as link href value
    link.click();        // clicking link to download image
});
function saveCanvasState() {
    // Increment the drawing index
    drawingIndex++;
    // Remove any states beyond the current index (redo states)
    drawingHistory.length = drawingIndex;
    // Save the current canvas state
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawingHistory.push(currentState);
}

function undo() {
    if (drawingIndex > 0) {
        // Decrement the drawing index
        drawingIndex--;
        // Get the previous drawing state from history
        const prevState = drawingHistory[drawingIndex];
        // Restore the canvas to the previous state
        ctx.putImageData(prevState, 0, 0);
    }
}
undoButton.addEventListener("click", undo);
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);
