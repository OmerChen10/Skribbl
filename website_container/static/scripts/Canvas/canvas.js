
var canvas, ctx, canvasPos;
window.addEventListener('load', initializeGame);

function initializeGame() {
    // This function is used to initialize the game canvas.
    var gameElements = document.querySelector('.game');
    gameElements.style.display = 'flex';

    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    canvasPos = canvas.getBoundingClientRect();

    console.log('GAME INITIALIZED');
    draw(); // Start game
}

function draw() {
    console.log('DRAWING ENABLED'); 

    isDrawing = false;

    const drawing = (e) => {
        if (!isDrawing) return;

        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }

    const startDrawing = (e) => {
        ctx.beginPath();
        isDrawing = true;
    }

    const stopDrawing = (e) => {
        ctx.closePath();
        isDrawing = false;
    }

    // Support for mobile devices

    const touchStartDrawing = (e) => {
        ctx.beginPath();
        isDrawing = true;
    }

    const touchStopDrawing = (e) => {
        ctx.closePath();
        isDrawing = false;
    }

    const touchDrawing = (e) => {
        if (!isDrawing) return;

        // Calculate the position of the touch relative to the canvas
        offsetX = e.touches[0].clientX - canvasPos.left;
        offsetY = e.touches[0].clientY - canvasPos.top;

        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    }

    // Event listeners for mouse events
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mousemove", drawing);

    // Event listeners for touch events
    canvas.addEventListener("touchstart", touchStartDrawing);
    canvas.addEventListener("touchend", touchStopDrawing);
    canvas.addEventListener("touchmove", touchDrawing);
};