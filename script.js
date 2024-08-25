const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const centerX = canvasWidth / 2;
const centerY = canvasHeight / 2;
const scale = 40; // Scale to convert canvas coordinates to graph coordinates
const imageUpload = document.getElementById('imageUpload');

let lines = [];
let isDrawing = false;
let startX, startY;
let image = new Image();
let currentColor = '#000000'; // Default line color

let ids = 0;

var elt = document.getElementById('calculator');
var calculator = Desmos.GraphingCalculator(elt, {expressionsCollapsed: true}, {settingsMenu: false});

const customColorPicker = document.getElementById('customColorPicker');
customColorPicker.addEventListener('input', (event) => {
    currentColor = event.target.value;
});

canvas.addEventListener('mousedown', (e) => {
    startX = (e.offsetX - centerX) / scale;
    startY = (centerY - e.offsetY) / scale;
	
	
	var error = 10
	startX = Math.round(startX * error) / error;
	startY = Math.round(startY * error) / error;
    isDrawing = true;
});

canvas.addEventListener('mouseup', (e) => {
    if (isDrawing) {
        var endX = (e.offsetX - centerX) / scale;
        var endY = (centerY - e.offsetY) / scale;
		
		var error = 10
		console.log(1,endX, endY);
		
		endX = Math.round(endX * error) / error;
	
		endY = Math.round(endY * error) / error;
		
		console.log(2,endX, endY);
		if (startX == endX && startY == endY){
			return;
		}
        lines.push({ startX, startY, endX, endY, color: currentColor }); // Store the line color with the line data
        isDrawing = false;
        drawAllLines(); // Redraw all lines
		showEquations();
		ids++;
    }
	isDrawing = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const endX = (e.offsetX - centerX) / scale;
        const endY = (centerY - e.offsetY) / scale;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawImage();
        drawAllLines(); // Redraw all lines
        drawLine(startX, startY, endX, endY, currentColor); // Draw the current line with the selected color
    }
});

document.getElementById('undo').addEventListener('click', () => {
    if (lines.length > 0) {
        lines.pop(); // Remove the last line from the array
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawImage(); // Redraw the image if present
        drawAllLines(); // Redraw the remaining lines

        if (ids > 0) {
            calculator.removeExpression({ id: --ids }); // Remove the last expression from Desmos
            showEquations(); // Update the equations in Desmos
        }

    }
});

document.getElementById('clear').addEventListener('click', () => {
    lines = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImage();
    calculator.setBlank();
});

document.getElementById('download').addEventListener('click', () => {
	var state = calculator.getState();
	
	const jsonString = JSON.stringify(state);
	
	const blob = new Blob([jsonString], { type: "application/json" });
	
	const link = document.createElement('a');
	link.download = 'DrawState.json';
	link.href = window.URL.createObjectURL(blob);
	document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
});

function showEquations() {
    calculator.setBlank(); // Clear all existing expressions in the calculator first
    lines.forEach((line, index) => {
        const { startX, startY, endX, endY, color } = line;
        let equation = '';

        if (endX === startX) {
            const y1 = Math.min(startY, endY);
            const y2 = Math.max(startY, endY);
            equation = `x = ${startX.toFixed(4)} \\left\\{${y1.toFixed(4)} <= y <= ${y2.toFixed(4)}\\right\\}`;
            calculator.setExpression({ id: index, latex: equation, color: color });
        } else {
            const m = (endY - startY) / (endX - startX);
            const b = startY - m * startX;
            const x1 = Math.min(startX, endX);
            const x2 = Math.max(startX, endX);
            equation = `y = ${m.toFixed(4)}x + ${b.toFixed(4)} \\left\\{${x1.toFixed(4)} <= x <= ${x2.toFixed(4)}\\right\\}`;
            calculator.setExpression({ id: index, latex: equation, color: color });
        }
    });

    ids = lines.length; // Update ids to match the number of current lines
}

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            image.src = event.target.result;
            image.onload = function() {
                drawImage();
            }
        }
        reader.readAsDataURL(file);
    }
});

function drawImage() {
    const imgAspectRatio = image.width / image.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight;
    if (imgAspectRatio > canvasAspectRatio) {
        drawWidth = canvasWidth;
        drawHeight = drawWidth / imgAspectRatio;
    } else {
        drawHeight = canvasHeight;
        drawWidth = drawHeight * imgAspectRatio;
    }

    const offsetX = (canvasWidth - drawWidth) / 2;
    const offsetY = (canvasHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    ctx.globalAlpha = 1.0;
}


function drawLine(x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.moveTo(x1 * scale + centerX, centerY - y1 * scale);
    ctx.lineTo(x2 * scale + centerX, centerY - y2 * scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function drawAllLines() {
    lines.forEach(line => {
        drawLine(line.startX, line.startY, line.endX, line.endY, line.color); // Use the stored color for each line
    });
}

// Color buttons event listeners
document.querySelectorAll('.color-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        currentColor = e.target.getAttribute('data-color');
    });
});