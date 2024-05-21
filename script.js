const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const asciiContainer = document.getElementById('ascii');

const image = new Image();
image.src = 'path_to_your_image.png'; // Replace with the path to your image
image.onload = () => {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const asciiArt = convertToAscii(imageData);
    asciiContainer.textContent = asciiArt;
};

function convertToAscii(imageData) {
    const { width, height, data } = imageData;
    const asciiCharacters = ' .:-=+*#%@';
    let ascii = '';

    for (let y = 0; y < height; y += 6) { // Adjust this value to control the height of ASCII characters
        for (let x = 0; x < width; x += 3) { // Adjust this value to control the width of ASCII characters
            const offset = (y * width + x) * 4;
            const r = data[offset];
            const g = data[offset + 1];
            const b = data[offset + 2];
            const avg = (r + g + b) / 3;
            const charIndex = Math.floor((avg / 255) * (asciiCharacters.length - 1));
            ascii += asciiCharacters[charIndex];
        }
        ascii += '\n';
    }
    return ascii;
}
