// For now just using Meshbody UV layout. 
// Setting up the canvas and its context
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let activeUV = 'upper'; // Set the active UV to begin

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
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(x, y, cellWidth, cellHeight);
            }

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
    }
}

// Redraw
function redrawAll() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(panOffsetX, panOffsetY);

    if (activeUV === 'upper') {
        ctx.drawImage(upperImage, 0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas, upperSelected);
    } else if (activeUV === 'lower') {
        ctx.drawImage(lowerImage, 0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas, lowerSelected);
    }
}

// handle the uv switch when dropdown changes
const uvSelector = document.getElementById('uvSelector');
uvSelector.addEventListener('change', () => {
    activeUV = uvSelector.value;
    redrawAll();
});

// Handle the clicks
function handleGridClick(event) {
    const rect = canvas.getBoundingClientRect();
    let x = (event.clientX - rect.left) / zoomLevel - panOffsetX;
    let y = (event.clientY - rect.top) / zoomLevel - panOffsetY;

    const cellWidth = canvas.width / GRID_SIZE;
    const cellHeight = canvas.height / GRID_SIZE;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        const selectedCells = (activeUV === 'upper') ? upperSelected : lowerSelected;
        selectedCells[row][col] = !selectedCells[row][col];
        redrawAll();
    }
}

// selecting + drag
let isSelecting = false; 
let selectingMode = true; 

const panToolTip = document.getElementById('panTooltip');

let startRow = null, startCol = null;

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !e.altKey) {
        isSelecting = true;
        const [row, col, selectedCells] = getGridCell(canvas, e);

        if (row !== null && col !== null) {
            startRow = row;
            startCol = col;
            selectingMode = !selectedCells[row][col];
            selectedCells[row][col] = selectingMode;
            redrawAll();
        }
    }

    if (e.altKey && e.button === 2) {
        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        e.preventDefault();
        panToolTip.style.opacity = 1;
        updateToolTipPosition(e.clientX, e.clientY);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isSelecting) {
        const [currentRow, currentCol, selectedCells] = getGridCell(canvas, e);

        if (currentRow !== null && currentCol !== null) {
            const rowMin = Math.min(startRow, currentRow);
            const rowMax = Math.max(startRow, currentRow);
            const colMin = Math.min(startCol, currentCol);
            const colMax = Math.max(startCol, currentCol);

            for (let r = rowMin; r <= rowMax; r++) {
                for (let c = colMin; c <= colMax; c++) {
                    selectedCells[r][c] = selectingMode;
                }
            }
            redrawAll();
        }
    }

    if (isPanning) {
        if (!e.altKey) {
            isPanning = false;
            panToolTip.style.opacity = 0;
            return;
        }

        const dx = (e.clientX - panStartX) / zoomLevel;
        const dy = (e.clientY - panStartY) / zoomLevel;
        panOffsetX += dx;
        panOffsetY += dy;
        panStartX = e.clientX;
        panStartY = e.clientY;
        redrawAll();

        updateToolTipPosition(e.clientX, e.clientY);
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

document.addEventListener('mouseup', (e) => { 
    if (e.button === 0 && isSelecting) {
        isSelecting = false;
        startRow = null;
        startCol = null;
    }
    if (e.button === 2 && isPanning) {
        isPanning = false;
        panToolTip.style.opacity = 0;
    }
});

function getGridCell(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoomLevel - panOffsetX;
    const y = (event.clientY - rect.top) / zoomLevel - panOffsetY;

    const cellWidth = canvas.width / GRID_SIZE;
    const cellHeight = canvas.height / GRID_SIZE;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        const selectedCells = (activeUV === 'upper') ? upperSelected : lowerSelected;
        return [row, col, selectedCells];
    }
    return [null, null, null];
}

function updateToolTipPosition(x, y) {
    panToolTip.style.left = `${x + 12}px`;
    panToolTip.style.top = `${y + 12}px`;
}

const generateButton = document.getElementById('generateButton');

generateButton.addEventListener('click', () => {
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = 1024;
    outputCanvas.height = 1024;
    const outputCtx = outputCanvas.getContext('2d');

    outputCtx.fillStyle = 'white';
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    drawAlphaMask(outputCtx, outputCanvas.width, outputCanvas.height);

    const link = document.createElement('a');
    const filenameInput = document.getElementById('fileNameInput');
    let filename = filenameInput.value.trim();

    if (!filename) {
        filename = 'alpha-mask';
    }

    if (!filename.toLowerCase().endsWith('.png')) {
        filename += '.png';
    }
    link.download = filename;

    link.href = outputCanvas.toDataURL();
    link.click();
});

const clearAllButton = document.getElementById('clearAllButton');

clearAllButton.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all selections?")) {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                upperSelected[row][col] = false;
                lowerSelected[row][col] = false;
            }
        }
        redrawAll();
    }
});

function drawAlphaMask(ctx, canvasWidth, canvasHeight) {
    const cellWidth = canvasWidth  / GRID_SIZE;
    const cellHeight = canvasHeight / GRID_SIZE;

    if (activeUV === 'upper') {
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
    } else if (activeUV === 'lower') {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (lowerSelected[row][col]) {
                    ctx.clearRect(
                        col * cellWidth,
                        row * cellHeight,
                        cellWidth,
                        cellHeight
                    );
                }
            }
        }
    }
}

const gridSizeSelect = document.getElementById('gridSizeSelect');

gridSizeSelect.addEventListener('change', () => {
    const newSize = parseInt(gridSizeSelect.value, 10);
    const oldSize = GRID_SIZE;

    const oldUpperSelected = upperSelected;
    const oldLowerSelected = lowerSelected;

    GRID_SIZE = newSize;

    upperSelected = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    lowerSelected = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));

    for (let row = 0; row < oldSize; row++) {
        for (let col = 0; col < oldSize; col++) {
            if (oldUpperSelected[row][col]) {
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

    redrawAll();
});

const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');

zoomInButton.addEventListener('click', () => {
    zoomLevel *= 1.25;
    redrawAll();
});

zoomOutButton.addEventListener('click', () => {
    zoomLevel /= 1.25;
    redrawAll();
});
