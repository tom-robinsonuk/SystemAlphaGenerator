// For now just using Meshbody UV layout. 
// Setting up the canvas and its context
const upperCanvas = document.getElementById('upperCanvas')
const lowerCanvas = document.getElementById('lowerCanvas')
const upperCtx = upperCanvas.getContext('2d');
const lowerCtx = lowerCanvas.getContext('2d');

// Configure Grid size
const GRID_SIZE = 16; 

// Store Selected cells
const upperSelected = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
const lowerSelected = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));

// Load the Upper body UV Map
const upperImage = new Image();
upperImage.src = '/assets/Meshbody_F_upper_uv.png';
upperImage.onload = () => {
    redrawAll();
};

// Load the Lower body UV Map
const lowerImage = new Image();
lowerImage.src = '/assets/Meshbody_F_lower_uv.png';
lowerImage.onload = () => {
    redrawAll();
};


// Draw the grid on the canvas
function drawGrid(ctx, canvas, selectedCells) {
    const cellWidth = canvas.width / GRID_SIZE;
    const cellHeight = canvas.height / GRID_SIZE;

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const x = col * cellWidth;
            const y = row * cellHeight;

            if (selectedCells[row][col]) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Light grey overlay for selected
                ctx.fillRect(x, y, cellWidth, cellHeight);
            }

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Optional: add cell borders
            ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
    }
}

    // Redraw
    function redrawAll() {
        upperCtx.clearRect(0, 0, upperCanvas.width, upperCanvas.height);
        upperCtx.drawImage(upperImage, 0, 0, upperCanvas.width, upperCanvas.height);
        drawGrid(upperCtx, upperCanvas, upperSelected);
    
        lowerCtx.clearRect(0, 0, lowerCanvas.width, lowerCanvas.height);
        lowerCtx.drawImage(lowerImage, 0, 0, lowerCanvas.width, lowerCanvas.height);
        drawGrid(lowerCtx, lowerCanvas, lowerSelected);
    }
    // Handle the clicks
    function handleGridClick(event, canvas, selectedCells) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        const cellWidth = canvas.width / GRID_SIZE;
        const cellHeight = canvas.height / GRID_SIZE;
    
        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);
    
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
            selectedCells[row][col] = !selectedCells[row][col];
            redrawAll();
        }
    }

    // Add the click handlers 
    upperCanvas.addEventListener('click', (e) => {
        handleGridClick(e, upperCanvas, upperSelected);
    });

    lowerCanvas.addEventListener('click', (e) => {
        handleGridClick(e, lowerCanvas, lowerSelected);
    });