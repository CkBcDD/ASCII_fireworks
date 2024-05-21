const fireworksContainer = document.getElementById('fireworks');

const fireworksPatterns = [
    [
        "     .     ",
        "    /:\\    ",
        "   /.:.\\   ",
        "  /.:.:.\\  ",
        "  \\::.:/  ",
        "   \\:::./   ",
        "    `-'    "
    ],
    [
        "     .     ",
        "   \\ | /   ",
        "-  ' | '  -",
        "   / | \\   ",
        "     '     "
    ],
    [
        "     *     ",
        "    /|\\    ",
        "   / | \\   ",
        "  *--o--*  ",
        "   \\ | /   ",
        "    \\|/    ",
        "     *     "
    ]
];

function displayFirework() {
    const randomPattern = fireworksPatterns[Math.floor(Math.random() * fireworksPatterns.length)];
    fireworksContainer.textContent = randomPattern.join('\n');
    setTimeout(displayFirework, 1000);
}

displayFirework();
