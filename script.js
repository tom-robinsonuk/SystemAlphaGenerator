console.log('Script loaded once');
// For now just using Meshbody UV layout. 
const upperCanvas = document.getElementById('upperCanvas')
const lowerCanvas = document.getElementById('lowerCanvas')
const upperCtx = upperCanvas.getContext('2d');
const lowerCtx = lowerCanvas.getContext('2d');

// Load the Upper body UV Map
const upperImage = new Image();
upperImage.src = '/assets/Meshbody_F_upper_uv.png';
upperImage.onload = () => {
    upperCtx.drawImage(upperImage, 0, 0, upperCanvas.clientWidth, upperCanvas.height);
};

// Load the Lower body UV Map
const lowerImage = new Image();
lowerImage.src = '/assets/Meshbody_F_lower_uv.png';
lowerImage.onload = () => {
    lowerCtx.drawImage(lowerImage, 0, 0, lowerCanvas.clientWidth, lowerCanvas.height);
};

