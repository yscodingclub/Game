const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 난이도 설정
const DIFFICULTY = {
  EASY: { size: 5, pairs: 5 },
  MEDIUM: { size: 6, pairs: 7 },
  HARD: { size: 8, pairs: 10 },
  EXTRA_HARD: { size: 11, pairs: 15 },
};

let difficulty = "EASY"; // 기본 난이도
let stage = 1; // 기본 스테이지
let gridSize = DIFFICULTY[difficulty].size;
let pairCount = DIFFICULTY[difficulty].pairs;

let points = [];
let connections = [];
let currentPath = [];
let dragging = false;

// 캔버스 크기
canvas.width = 500;
canvas.height = 500;

// 초기화
function initGame() {
  gridSize = DIFFICULTY[difficulty].size;
  pairCount = DIFFICULTY[difficulty].pairs;
  generateStage();
  drawGame();
}

// 스테이지 생성
function generateStage() {
  points = generateValidPoints();
  connections = [];
  currentPath = [];
}

// 점 생성 (해결 가능한 상태)
function generateValidPoints() {
  const step = canvas.width / gridSize;
  const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
  const points = [];

  for (let i = 0; i < pairCount; i++) {
    const color = colors[i % colors.length];
    let point1, point2;

    do {
      point1 = { x: randGrid(step), y: randGrid(step), color };
      point2 = { x: randGrid(step), y: randGrid(step), color };
    } while (
      isPointInList(point1, points) ||
      isPointInList(point2, points) ||
      (point1.x === point2.x && point1.y === point2.y)
    );

    points.push(point1, point2);
  }

  return points;
}

function randGrid(step) {
  return Math.floor(Math.random() * gridSize) * step + step / 2;
}

function isPointInList(point, list) {
  return list.some(p => p.x === point.x && p.y === point.y);
}

// 게임 그리기
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawConnections();
  drawPoints();
}

// 격자 그리기
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

// 점 그리기
function drawPoints() {
  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = point.color;
    ctx.fill();
  });
}

// 연결된 선 및 효과 그리기
function drawConnections() {
  connections.forEach(connection => {
    ctx.beginPath();
    ctx.moveTo(connection.start.x, connection.start.y);
    ctx.lineTo(connection.end.x, connection.end.y);
    ctx.strokeStyle = connection.color;
    ctx.lineWidth = 5;
    ctx.stroke();

    // 연결 경로에 불투명한 원 효과 추가
    const stepX = (connection.end.x - connection.start.x) / gridSize;
    const stepY = (connection.end.y - connection.start.y) / gridSize;

    for (let i = 1; i < gridSize; i++) {
      ctx.beginPath();
      ctx.arc(connection.start.x + stepX * i, connection.start.y + stepY * i, 10, 0, Math.PI * 2);
      ctx.fillStyle = `${connection.color}88`; // 투명도 추가
      ctx.fill();
    }
  });
}

// 점 클릭 여부 확인
function findPointAtPosition(x, y) {
  return points.find(
    p => Math.hypot(p.x - x, p.y - y) < 10
  );
}

// 드래그 시작
canvas.addEventListener("mousedown", e => {
  const { offsetX, offsetY } = e;
  const startPoint = findPointAtPosition(offsetX, offsetY);

  if (startPoint) {
    dragging = true;
    currentPath = [startPoint];
  }
});

// 드래그 중
canvas.addEventListener("mousemove", e => {
  if (!dragging || currentPath.length === 0) return;

  const { offsetX, offsetY } = e;
  const lastPoint = currentPath[currentPath.length - 1];
  const nextPoint = findPointAtPosition(offsetX, offsetY);

  if (
    nextPoint &&
    nextPoint.color === lastPoint.color &&
    !currentPath.includes(nextPoint) &&
    Math.abs(nextPoint.x - lastPoint.x) <= canvas.width / gridSize &&
    Math.abs(nextPoint.y - lastPoint.y) <= canvas.height / gridSize
  ) {
    currentPath.push(nextPoint);
    drawGame();
    drawCurrentPath();
  }
});

// 드래그 종료
canvas.addEventListener("mouseup", () => {
  if (!dragging || currentPath.length < 2) {
    dragging = false;
    currentPath = [];
    return;
  }

  connections.push({
    start: currentPath[0],
    end: currentPath[currentPath.length - 1],
    color: currentPath[0].color,
  });

  dragging = false;
  currentPath = [];
  drawGame();

  if (checkStageComplete()) {
    alert("Stage Complete! Moving to next stage.");
    nextStage();
  }
});

// 현재 드래그된 경로 그리기
function drawCurrentPath() {
  ctx.beginPath();
  ctx.moveTo(currentPath[0].x, currentPath[0].y);

  for (let i = 1; i < currentPath.length; i++) {
    ctx.lineTo(currentPath[i].x, currentPath[i].y);
  }

  ctx.strokeStyle = currentPath[0].color;
  ctx.lineWidth = 5;
  ctx.stroke();
}

// 스테이지 완료 여부 확인
function checkStageComplete() {
  return points.every(point =>
    connections.some(
      connection =>
        (connection.start === point || connection.end === point) &&
        connection.color === point.color
    )
  );
}

// 다음 스테이지
function nextStage() {
  stage++;
  generateStage();
  drawGame();
}

// 난이도 변경
function changeDifficulty(newDifficulty) {
  difficulty = newDifficulty;
  stage = 1; // 스테이지 초기화
  initGame();
}

// 초기화 실행
initGame();
