// For now just using Meshbody UV layout. 
// Setting up the canvas and its context
const upperCanvas = document.getElementById('upperCanvas')
const lowerCanvas = document.getElementById('lowerCanvas')
const upperCtx = upperCanvas.getContext('2d');
const lowerCtx = lowerCanvas.getContext('2d');

// Configure Grid size
let GRID_SIZE = 16; 
let zoomLevel = 1.0;

// Panning and moving around
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panOffsetX = 0;
let panOffsetY = 0;

// Store Selected cells
let upperSelected = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
let lowerSelected = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));

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
        upperCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset any existing transforms
        upperCtx.clearRect(0, 0, upperCanvas.width, upperCanvas.height);
        upperCtx.scale(zoomLevel, zoomLevel); // Apply the zoom
        upperCtx.translate(panOffsetX, panOffsetY); // apply pan
        upperCtx.drawImage(upperImage, 0, 0, upperCanvas.width, upperCanvas.height);
        drawGrid(upperCtx, upperCanvas, upperSelected);
    
        lowerCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset any existing transforms
        lowerCtx.clearRect(0, 0, lowerCanvas.width, lowerCanvas.height);
        lowerCtx.scale(zoomLevel, zoomLevel); // Apply the zoom
        lowerCtx.translate(panOffsetX, panOffsetY); // apply pan
        lowerCtx.drawImage(lowerImage, 0, 0, lowerCanvas.width, lowerCanvas.height);
        drawGrid(lowerCtx, lowerCanvas, lowerSelected);
    }
    // Handle the clicks
    function handleGridClick(event, canvas, selectedCells) {
        const rect = canvas.getBoundingClientRect();
        let x = (event.clientX - rect.left) / zoomLevel - panOffsetX;
        let y = (event.clientY - rect.top) / zoomLevel - panOffsetY;
    
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

    // Add Ctrl+Drag to pan
    [upperCanvas, lowerCanvas].forEach(canvas => {
        canvas.addEventListener('mousedown', (e) => {
            if (e.altKey && e.button === 2) { // alt + right mouse button
                isPanning = true;
                panStartX = e.clientX;
                panStartY = e.clientY;
                e.preventDefault(); // prevents context menu appearing.
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isPanning) {

                if(!e.altKey) {
                    isPanning = false;
                    return;
                }
                
                const dx = (e.clientX - panStartX) / zoomLevel;
                const dy = (e.clientY - panStartY) / zoomLevel;
                panOffsetX += dx;
                panOffsetY += dy;
                panStartX = e.clientX;
                panStartY = e.clientY;
                redrawAll();
            }
        });

        canvas.addEventListener('mouseup', () => {
            if (e.button === 2) {
                isPanning = false;
            }
        });

        canvas.addEventListener('mouseleave', () => {
            isPanning = false;
        });

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    });


    // Generating the alpha
    const generateButton = document.getElementById('generateButton');

    generateButton.addEventListener('click', () => {
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 1024;
        outputCanvas.height = 1024;
        const outputCtx = outputCanvas.getContext('2d');

        // Fill whole canvas with white (this means 100% visibility)
        outputCtx.fillStyle = 'white';
        outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

        // draw the black squares for the selected cells
        drawAlphaMask(outputCtx, outputCanvas.width, outputCanvas.height);

        // Create a PNG from the canvas and download it 
        const link = document.createElement('a');
        //link.download = 'alpha-mask.png';
        const filenameInput = document.getElementById('fileNameInput');
        let filename = filenameInput.value.trim();

        // default fallback if left it empty
        if (!filename) {
            filename = 'alpha-mask';
        }

        // ensure it ends with .png ( always want png for its alpha channel)
        if (!filename.toLowerCase().endsWith('.png')) {
            filename += '.png';
        }
        link.download = filename;

        link.href = outputCanvas.toDataURL();
        link.click();
    });

    function drawAlphaMask(ctx, canvasWidth, canvasHeight) {
        const halfHeight = canvasHeight / 2;
        const cellWidth = canvasWidth  / GRID_SIZE;   // 1024 / 16 = 64px
        const cellHeight = canvasHeight / GRID_SIZE;  // 1024 / 16 = 64px
      
        // Clear upper body cells (top half)
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (upperSelected[row][col]) {
              ctx.clearRect(
                col * cellWidth,
                row * cellHeight,
                cellWidth,
                cellHeight
              );
            }
          }
        }
      
        // Clear lower body cells (bottom half)
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (lowerSelected[row][col]) {
              ctx.clearRect(
                col * cellWidth,
                halfHeight + row * cellHeight,
                cellWidth,
                cellHeight
              );
            }
          }
        }
      }

    const gridSizeSelect = document.getElementById('gridSizeSelect');

    // Handle Grid Size changes
    gridSizeSelect.addEventListener('change', () => {
        const newSize = parseInt(gridSizeSelect.value, 10);
        const oldSize = GRID_SIZE;
    
        // Save the old selections
        const oldUpperSelected = upperSelected;
        const oldLowerSelected = lowerSelected;
    
        // Update the global GRID_SIZE
        GRID_SIZE = newSize;
    
        // Create new empty selections
        upperSelected = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
        lowerSelected = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    
        // Map the old selections to the new grid
        for (let row = 0; row < oldSize; row++) {
            for (let col = 0; col < oldSize; col++) {
                if (oldUpperSelected[row][col]) {
                    // Calculate the range of smaller cells this big cell covers
                    const startRow = Math.floor(row * (GRID_SIZE / oldSize));
                    const endRow = Math.floor((row + 1) * (GRID_SIZE / oldSize));
                    const startCol = Math.floor(col * (GRID_SIZE / oldSize));
                    const endCol = Math.floor((col + 1) * (GRID_SIZE / oldSize));
    
                    for (let r = startRow; r < endRow; r++) {
                        for (let c = startCol; c < endCol; c++) {
                            if (r < GRID_SIZE && c < GRID_SIZE) {
                                upperSelected[r][c] = true;
                            }
                        }
                    }
                }
    
                if (oldLowerSelected[row][col]) {
                    const startRow = Math.floor(row * (GRID_SIZE / oldSize));
                    const endRow = Math.floor((row + 1) * (GRID_SIZE / oldSize));
                    const startCol = Math.floor(col * (GRID_SIZE / oldSize));
                    const endCol = Math.floor((col + 1) * (GRID_SIZE / oldSize));
    
                    for (let r = startRow; r < endRow; r++) {
                        for (let c = startCol; c < endCol; c++) {
                            if (r < GRID_SIZE && c < GRID_SIZE) {
                                lowerSelected[r][c] = true;
                            }
                        }
                    }
                }
            }
        }
    
        // Redraw everything
        redrawAll();
    });
    
    const zoomInButton = document.getElementById('zoomInButton');
    const zoomOutButton = document.getElementById('zoomOutButton');

    zoomInButton.addEventListener('click', () => {
        zoomLevel *= 1.25; // zoom in 25%
        redrawAll();
    });

    zoomOutButton.addEventListener('click', () => {
        zoomLevel /= 1.25; // zoom out 25%
        redrawAll();
    });