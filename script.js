const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZES = {
  EASY: 5,
  MEDIUM: 6,
  HARD: 8,
  EXTRA_HARD: 11,
};

const PAIR_COUNTS = {
  EASY: 5,
  MEDIUM: 7,
  HARD: 10,
  EXTRA_HARD: 15,
};

let difficulty = "EASY"; // Default difficulty
let stageNumber = 1; // Default stage number
let gridSize = GRID_SIZES[difficulty];
let points = []; // Points to connect
let lines = []; // Connected lines
let dragging = false;
let currentLine = null;
let startPoint = null;

canvas.width = 500;
canvas.height = 500;

// Initialize the game
function initGame() {
  generateStage(difficulty, stageNumber);
  drawGame();
}

// Generate a random stage
function generateStage(difficulty, stage) {
  gridSize = GRID_SIZES[difficulty];
  const pairCount = PAIR_COUNTS[difficulty];
  points = generateValidPoints(gridSize, pairCount);
  lines = []; // Clear existing lines
}

// Generate points and ensure the stage is solvable
function generateValidPoints(gridSize, pairCount) {
  const step = canvas.width / gridSize;
  const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
  const usedColors = [];
  const generatedPoints = [];

  for (let i = 0; i < pairCount; i++) {
    const color = colors[i % colors.length];
    usedColors.push(color);

    let point1, point2;
    do {
      point1 = {
        x: Math.floor(Math.random() * gridSize) * step + step / 2,
        y: Math.floor(Math.random() * gridSize) * step + step / 2,
        color,
      };
      point2 = {
        x: Math.floor(Math.random() * gridSize) * step + step / 2,
        y: Math.floor(Math.random() * gridSize) * step + step / 2,
        color,
      };
    } while (
      isPointInList(point1, generatedPoints) ||
      isPointInList(point2, generatedPoints) ||
      (point1.x === point2.x && point1.y === point2.y)
    );

    generatedPoints.push(point1, point2);
  }

  return generatedPoints;
}

// Check if a point already exists in the list
function isPointInList(point, list) {
  return list.some(
    p => Math.hypot(p.x - point.x, p.y - point.y) < 15
  );
}

// Draw the entire game
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawPoints();
  drawLines();
}

// Draw grid
function drawGrid() {
  const step = canvas.width / gridSize;

  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step, 0);
    ctx.lineTo(i * step, canvas.height);
    ctx.moveTo(0, i * step);
    ctx.lineTo(canvas.width, i * step);
    ctx.strokeStyle = "#ddd";
    ctx.stroke();
  }
}

// Draw points
function drawPoints() {
  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = point.color;
    ctx.fill();
  });
}

// Draw lines
function drawLines() {
  lines.forEach(line => {
    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 5;
    ctx.stroke();
  });
}

// Handle mouse down
canvas.addEventListener("mousedown", (e) => {
  const { offsetX, offsetY } = e;
  startPoint = findPointAtPosition(offsetX, offsetY);

  if (startPoint) {
    dragging = true;
    currentLine = { start: startPoint, end: null, color: startPoint.color };
  }
});

// Handle mouse move
canvas.addEventListener("mousemove", (e) => {
  if (!dragging || !currentLine) return;

  const { offsetX, offsetY } = e;
  currentLine.end = { x: offsetX, y: offsetY, color: currentLine.color };
  drawGame();

  // Draw the temporary line
  ctx.beginPath();
  ctx.moveTo(currentLine.start.x, currentLine.start.y);
  ctx.lineTo(currentLine.end.x, currentLine.end.y);
  ctx.strokeStyle = currentLine.color;
  ctx.lineWidth = 5;
  ctx.stroke();
});

// Handle mouse up
canvas.addEventListener("mouseup", (e) => {
  if (!dragging || !currentLine) return;

  const { offsetX, offsetY } = e;
  const endPoint = findPointAtPosition(offsetX, offsetY);

  if (endPoint && endPoint.color === currentLine.color && endPoint !== startPoint) {
    // Valid connection
    currentLine.end = endPoint;
    lines.push(currentLine);

    // Change grid color along the line
    updateGridColors(currentLine);
  }

  dragging = false;
  currentLine = null;
  startPoint = null;
  drawGame();
});

// Find a point near the given position
function findPointAtPosition(x, y) {
  return points.find(
    p => Math.hypot(p.x - x, p.y - y) < 15
  );
}

// Update the grid colors based on the line
function updateGridColors(line) {
  const step = canvas.width / gridSize;

  const startX = Math.floor(line.start.x / step);
  const startY = Math.floor(line.start.y / step);
  const endX = Math.floor(line.end.x / step);
  const endY = Math.floor(line.end.y / step);

  const dx = Math.sign(endX - startX);
  const dy = Math.sign(endY - startY);

  let x = startX;
  let y = startY;

  while (x !== endX || y !== endY) {
    ctx.fillStyle = line.color;
    ctx.fillRect(x * step, y * step, step, step);
    x += dx;
    y += dy;
  }
}

// Initialize the game
initGame();
