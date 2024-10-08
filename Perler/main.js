        // Get the canvas and context
        const canvas = document.getElementById('pixelGrid');
        const ctx = canvas.getContext('2d');
        const container = document.querySelector('.content');
        const scrollArea = document.getElementById('scrollArea');

        const gridWidth = 57; // The grid is 57x57 cells
        const gridHeight = 57;
        let gridSize = 10; // Default size of each grid cell

        // Set initial canvas dimensions
        canvas.width = gridWidth * gridSize; // 570px width
        canvas.height = gridHeight * gridSize; // 570px height

        let currentImageData = null; // Store image data for redrawing
        let currentLineRow = Math.floor(gridHeight / 2); // Start the line in the middle


        // Function to populate color palette
        const colorPalette = document.getElementById('colorPalette');

        colors.forEach((color, index) => {
            const colorLabel = document.createElement('label');
            colorLabel.classList.add('colorLabel');

            const colorCheckbox = document.createElement('input');
            colorCheckbox.type = 'checkbox';
            colorCheckbox.checked = true; // All colors are checked by default
            colorCheckbox.dataset.index = index; // Save index to reference later

            const colorSwatch = document.createElement('div');
            colorSwatch.classList.add('colorSwatch');
            colorSwatch.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

            const colorName = document.createElement('span');
            colorName.textContent = color.name;

            colorLabel.appendChild(colorCheckbox);
            colorLabel.appendChild(colorSwatch);
            colorLabel.appendChild(colorName);
            colorPalette.appendChild(colorLabel);
        });

        // Array to track which colors are enabled
        const enabledColors = new Array(colors.length).fill(true);

        let colorCounts = new Array(colors.length).fill(0);
        // Create an image object to store the placeholder image
        const placeholderImg = new Image();
        placeholderImg.src = "bg.png"; // Use your local bg.png file

        // Function to draw the grid and count pixels
        let redBarRow = 0; // Start the red bar at the first row (0-indexed)
        // Function to calculate and display the percentage of enabled pixels
        // Function to calculate and display the percentage of enabled colors based on their counts
        function updatePixelFillPercentage() {
            // Sum of all pixels for enabled colors
            const totalColorPixels = colorCounts.reduce((sum, count, index) => {
                return sum + count; // Sum all colors' pixels
            }, 0);

            // Sum of pixels for enabled colors (only if their checkbox is checked)
            const enabledColorPixels = colorCounts.reduce((sum, count, index) => {
                return enabledColors[index] ? sum + count : sum;
            }, 0);

            // Calculate the percentage of enabled colors based on the color palette
            const percentageFilled = ((enabledColorPixels / totalColorPixels) * 100).toFixed(2);

            // Update the displayed percentage in the bottom bar
            document.getElementById("current_percentage").textContent = `Filled Colors: ${percentageFilled}%`;
        }

        // Define a list of symbols to represent each color
        const symbols = [
            '█', '■', '◆', '▲', '▼', '◀', '▶', '◆', '◇', '■', '□', '▪', '▫', '▴', '▾', '◈', '◍', '◐', '◑', '◒',
            '◓', '◔', '◕', '⬤', '⬛', '⬜', '◼', '◻', '◾', '◽', '▇', '▆', '▅', '▃', '▂', '▁', '◢', '◣', '◤', '◥',
            '▉', '▊', '▋', '▌', '▍', '▎', '▏', '║', '│', '─', '━', '┃'
        ];
let showSymbols = true; // Default state is to show symbols

// Get the toggle symbols button
const toggleSymbolsButton = document.getElementById('toggleSymbols');

// Function to toggle symbols on or off
toggleSymbolsButton.addEventListener('click', () => {
    showSymbols = !showSymbols; // Toggle the state

    // Redraw the grid to reflect the updated symbol state
    if (currentImageData) {
        drawGrid(currentImageData);
    }
});

function drawGrid(imageData) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    colorCounts.fill(0); // Reset color counts

    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            const pixelIndex = (y * imageData.width + x) * 4; // Each pixel has 4 values (RGBA)
            const r = imageData.data[pixelIndex];
            const g = imageData.data[pixelIndex + 1];
            const b = imageData.data[pixelIndex + 2];
            const a = imageData.data[pixelIndex + 3]; // Alpha value

            if (a === 0) {
                // Transparent pixel, draw bg.png
                ctx.drawImage(placeholderImg, x * gridSize, y * gridSize, gridSize, gridSize);
            } else {
                // Find the closest color
                const closestColor = getClosestColor(r, g, b);

                // If the color is disabled, draw bg.png instead
                if (!enabledColors[closestColor.index]) {
                    ctx.drawImage(placeholderImg, x * gridSize, y * gridSize, gridSize, gridSize);
                } else {
                    // Check if the current pixel's color is the last toggled color and if we should flash it
                    if (closestColor.index === lastToggledColorIndex && isGreen) {
                        // Draw green
                        ctx.fillStyle = 'rgb(0, 255, 0)'; // Green color for flashing effect
                    } else {
                        // Draw the original color
                        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    }

                    // Draw the color (or green for flashing)
                    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);

                    // Conditionally draw the symbol if showSymbols is true
                    if (showSymbols) {
                        ctx.font = `${gridSize * 0.7}px Arial`; // Set font size relative to grid size
                        ctx.fillStyle = 'black'; // Set symbol color (black or any color for contrast)
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(symbols[closestColor.index % symbols.length], x * gridSize + gridSize / 2, y * gridSize + gridSize / 2);
                    }

                    // Now, draw a dashed outline around each pixel
                    ctx.setLineDash([2, 2]); // Set dashed line style
                    ctx.strokeStyle = 'black'; // Outline color (can adjust as needed)
                    ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize); // Draw dashed rectangle
                    ctx.setLineDash([]); // Reset line dash for future drawings
                }

                // Increment the count for the closest color
                colorCounts[closestColor.index]++;
            }
        }
    }

    // Draw the red bar at the current row position
    drawRedBar();

    // Update the color palette with the pixel counts
    updateColorPaletteWithCounts();

    // Update the pixel fill percentage
    updatePixelFillPercentage();
}




        // Function to draw the red bar
        function drawRedBar() {
            ctx.fillStyle = 'rgba(255, 0, 0, 1)'; // Semi-transparent red
            ctx.fillRect(0, redBarRow * gridSize, canvas.width, gridSize); // Fill one row across the width
        }

        // Function to handle arrow key presses and move the red bar
        function handleKeyDown(event) {
            if (event.key === 'ArrowUp') {
                event.preventDefault(); // Correct way to prevent default scrolling behavior
                if (redBarRow > 0) {
                    redBarRow--; // Move the red bar up by one row
                    drawGrid(currentImageData); // Redraw the grid
                }
            } else if (event.key === 'ArrowDown') {
                event.preventDefault(); // Correct way to prevent default scrolling behavior
                if (redBarRow < gridHeight - 1) {
                    redBarRow++; // Move the red bar down by one row
                    drawGrid(currentImageData); // Redraw the grid
                }
            }
        }


        // Function to update the color palette with pixel counts and sort by count
        function updateColorPaletteWithCounts() {
            // Create an array of color objects that includes the count for each color
            const colorsWithCounts = colors.map((color, index) => {
                return {
                    name: color.name,
                    r: color.r,
                    g: color.g,
                    b: color.b,
                    count: colorCounts[index], // Add the pixel count
                    index: index // Keep track of original index
                };
            });

            // Sort the colors based on the count (from most to least)
            colorsWithCounts.sort((a, b) => b.count - a.count);

            // Clear the current color palette
            colorPalette.innerHTML = '';

            // Re-populate the color palette with sorted colors
            colorsWithCounts.forEach((colorData) => {
                const colorLabel = document.createElement('label');
                colorLabel.classList.add('colorLabel');

                const colorCheckbox = document.createElement('input');
                colorCheckbox.type = 'checkbox';
                colorCheckbox.checked = enabledColors[colorData.index]; // Retain the enabled/disabled state
                colorCheckbox.dataset.index = colorData.index; // Keep the original index for future reference

                const colorSwatch = document.createElement('div');
                colorSwatch.classList.add('colorSwatch');
                colorSwatch.style.backgroundColor = `rgb(${colorData.r}, ${colorData.g}, ${colorData.b})`;

                const colorName = document.createElement('span');
                colorName.textContent = `${colorData.name} (${colorData.count} pixels)`;

                colorLabel.appendChild(colorCheckbox);
                colorLabel.appendChild(colorSwatch);
                colorLabel.appendChild(colorName);
                colorPalette.appendChild(colorLabel);
            });
        }

        // Function to handle toggling colors
        colorPalette.addEventListener('change', (event) => {
            const checkbox = event.target;
            const colorIndex = parseInt(checkbox.dataset.index, 10);
            enabledColors[colorIndex] = checkbox.checked; // Update enabled state

            if (currentImageData) {
                drawGrid(currentImageData); // Redraw grid with the updated colors
            }
        });

        // Function to find the closest color by comparing RGB values
        function getClosestColor(r, g, b) {
            let closestColor = null;
            let minDistance = Infinity;
            let closestIndex = -1;

            colors.forEach((color, index) => {
                const distance = Math.sqrt(
                    Math.pow(r - color.r, 2) + Math.pow(g - color.g, 2) + Math.pow(b - color.b, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = color;
                    closestIndex = index;
                }
            });

            return {
                color: closestColor,
                index: closestIndex
            };
        }

        // Function to load an image and render it as a grid
        const fileInput = document.getElementById('fileInput');
        const loadImageButton = document.getElementById('loadImage');

        fileInput.addEventListener('change', (event) => {
            // Get the selected file from the input
            const file = event.target.files[0];

            if (file) {
            const file = fileInput.files[0];
            if (file) {
                const img = new Image();
                const reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result;
                    img.onload = function() {
                        const scaledWidth = gridWidth;
                        const scaledHeight = gridHeight;

                        const offCanvas = document.createElement('canvas');
                        const offCtx = offCanvas.getContext('2d');
                        offCanvas.width = gridWidth;
                        offCanvas.height = gridHeight;
                        offCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

                        currentImageData = offCtx.getImageData(0, 0, gridWidth, gridHeight);

                        drawGrid(currentImageData); // Draw the image grid along with the red bar
                    };
                };
                reader.readAsDataURL(file);
            }
            }
        });


        // Function to resize the canvas to fit the window width
        const fitToWidthButton = document.getElementById('fitToWidth');
        fitToWidthButton.addEventListener('click', () => {
            fitCanvasToWidth();
        });

        // Attach event listener to the document for arrow key presses
        document.addEventListener('keydown', handleKeyDown);




        function fitCanvasToWidth() {
            const windowWidth = window.innerWidth; // Get the browser window width
            gridSize = Math.floor(windowWidth / gridWidth); // Recalculate grid size based on new width
            canvas.width = gridWidth * gridSize; // Resize canvas width
            canvas.height = gridHeight * gridSize; // Resize canvas height proportionally

            scrollArea.style.width = `${canvas.width}px`; // Adjust scrollArea width to match canvas

            if (currentImageData) {
                drawGrid(currentImageData); // Redraw the grid with resized canvas
            }
        }

        // Refit canvas when the window is resized
        window.addEventListener('resize', () => {
            fitCanvasToWidth();
        });


        // Variables for pixel dragging and pixel counting
        let isDragging = false;
        let isCtrlDragging = false;
        let startX, startY, scrollLeft, scrollTop, startDragX, startDragY;
        let startGridX = 0,
            startGridY = 0; // Track starting grid cell
        let currentGridX = 0,
            currentGridY = 0; // Track current grid cell
        let pixelsMoved = 0;

        // Modify the mousedown event to detect if Ctrl is pressed and start the counting
        canvas.addEventListener('mousedown', (e) => {
            if (e.ctrlKey) {
                // Ctrl key is pressed, so enable pixel counting but disable dragging
                isCtrlDragging = true;
                startDragX = e.pageX;
                startDragY = e.pageY;

                // Convert starting mouse position to grid cell position
                const rect = canvas.getBoundingClientRect();
                startGridX = Math.floor((e.clientX - rect.left) / gridSize);
                startGridY = Math.floor((e.clientY - rect.top) / gridSize);
                currentGridX = startGridX;
                currentGridY = startGridY;

                pixelsMoved = 0; // Reset pixels moved
            } else {
                // Normal dragging without Ctrl key
                isDragging = true;
                canvas.style.cursor = 'grabbing';
                startX = e.pageX - canvas.offsetLeft;
                startY = e.pageY - canvas.offsetTop;
                scrollLeft = container.scrollLeft;
                scrollTop = container.scrollTop;
            }
        });

        // Modify the mousemove event to calculate pixels moved if Ctrl is pressed, without dragging
        canvas.addEventListener('mousemove', (e) => {
            if (isCtrlDragging) {
                // Only calculate grid cell movement, don't drag
                const rect = canvas.getBoundingClientRect();
                const newGridX = Math.floor((e.clientX - rect.left) / gridSize);
                const newGridY = Math.floor((e.clientY - rect.top) / gridSize);

                // Check if we've moved into a new grid cell
                if (newGridX !== currentGridX || newGridY !== currentGridY) {
                    pixelsMoved++; // Increment pixel count when moving into a new grid cell
                    currentGridX = newGridX; // Update current grid cell
                    currentGridY = newGridY;

                    // Display the pixel count in the bottom bar
                    document.getElementById("current_count").textContent = `Total pixels crossed: ${pixelsMoved+1}`;
                }
            } else if (isDragging) {
                // Normal dragging behavior
                e.preventDefault();

                const x = e.pageX - canvas.offsetLeft;
                const y = e.pageY - canvas.offsetTop;

                const walkX = (x - startX) * 2; // Horizontal scroll multiplier
                const walkY = (y - startY) * 2; // Vertical scroll multiplier

                container.scrollLeft = scrollLeft - walkX;
                container.scrollTop = scrollTop - walkY;
            }
        });

        // Reset the dragging state on mouseup
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
            isCtrlDragging = false;
            canvas.style.cursor = 'default';

            // If Ctrl-based dragging was happening, show the final pixel count
            document.getElementById("current_count").textContent = `Total pixels crossed: ${pixelsMoved+1}`;
        });

        // Handle mouse leaving the canvas (optional to reset drag state)
        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            isCtrlDragging = false;
            canvas.style.cursor = 'default';
        });




        // Get the canvas and context
        const canvas1 = document.getElementById('pixelGrid');
        const ctx1 = canvas1.getContext('2d');

        // Function to get color of the pixel on mousemove
        function getPixelColor(event) {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / gridSize);
            const y = Math.floor((event.clientY - rect.top) / gridSize);

            if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) {
                return; // Out of bounds, don't process
            }

            const pixelIndex = (y * currentImageData.width + x) * 4;
            const r = currentImageData.data[pixelIndex];
            const g = currentImageData.data[pixelIndex + 1];
            const b = currentImageData.data[pixelIndex + 2];
            const a = currentImageData.data[pixelIndex + 3]; // Alpha channel

            if (a === 0) {
                document.getElementById("current_color").textContent = "Transparant";
            } else {
                // Find the closest color
                const closestColorName = getClosestColor(r, g, b);
                document.getElementById("current_color").textContent = closestColorName.color.name;
            }
        }

        // Add event listener for mousemove to detect pixel color continuously
        canvas1.addEventListener('mousemove', getPixelColor);

        // Get the toggle button and the color palette element
        const togglePaletteButton = document.getElementById('togglePalette');
        const colorPaletteDiv = document.getElementById('colorPalette');

        // Variable to track whether the palette is currently visible or hidden
        let isPaletteVisible = true;

        // Function to toggle the visibility of the color palette
        togglePaletteButton.addEventListener('click', () => {
            if (isPaletteVisible) {
                colorPaletteDiv.style.display = 'none'; // Hide the palette
            } else {
                colorPaletteDiv.style.display = 'block'; // Show the palette
            }

            // Toggle the state
            isPaletteVisible = !isPaletteVisible;
        });
        // Get the toggle all colors button
        const toggleAllColorsButton = document.getElementById('toggleAllColors');

        // Variable to track whether all colors are currently enabled or disabled
        let areAllColorsEnabled = true;

        // Function to toggle all colors on or off
        toggleAllColorsButton.addEventListener('click', () => {
            // Toggle the state of all colors
            areAllColorsEnabled = !areAllColorsEnabled;

            // Update all checkboxes in the color palette
            const checkboxes = colorPalette.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox, index) => {
                checkbox.checked = areAllColorsEnabled;
                enabledColors[index] = areAllColorsEnabled; // Update the enabled state
            });

            // Redraw the grid to reflect the updated color state
            if (currentImageData) {
                drawGrid(currentImageData);
            }

            // Update the button text accordingly
        });
    let lastToggledColorIndex = null; // Store the index of the last toggled color
let isGreen = false; // Track if the color is currently green
let blinkInterval = null; // Store the interval ID for blinking
let isBlinking = true; // Track whether blinking is active

// Function to flash the last toggled color
function flashLastToggledColor() {
    if (lastToggledColorIndex !== null && currentImageData && isBlinking) {
        isGreen = !isGreen; // Toggle the green state
        drawGrid(currentImageData); // Redraw grid with flashing effect
    }
}

// Start the blinking effect with setInterval
function startBlinking() {
    blinkInterval = setInterval(flashLastToggledColor, 1000);
}

// Stop the blinking effect
function stopBlinking() {
    clearInterval(blinkInterval);
}

// Initialize the blinking when the page loads
startBlinking();

// Update the last toggled color whenever a checkbox is toggled
colorPalette.addEventListener('change', (event) => {
    const checkbox = event.target;
    const colorIndex = parseInt(checkbox.dataset.index, 10);
    enabledColors[colorIndex] = checkbox.checked; // Update enabled state

    // Track the most recently toggled color
    lastToggledColorIndex = colorIndex;

    if (currentImageData) {
        drawGrid(currentImageData); // Redraw grid with the updated colors
    }
});

// Add the new button's event listener to stop/start blinking
const toggleBlinkingButton = document.getElementById('toggleBlinking');
toggleBlinkingButton.addEventListener('click', () => {
    if (isBlinking) {
        stopBlinking(); // Stop the blinking
    } else {
        startBlinking(); // Start the blinking
    }

    isBlinking = !isBlinking; // Toggle the blinking state
});

	