$(document).ready(function () {
  let board = $("#board");
  let borderWidth = 1;
  let gridSize = 23;
  let cellWidth = 20;
  let maxBoardWidth = gridSize * cellWidth + 2 * borderWidth;
  let maxBoardHeight = gridSize * cellWidth + 2 * borderWidth;
  let snake = [];
  let fruit = null;
  let gameState = "paused";
  let directionX = 0;
  let directionY = 0;
  let interval = null;
  let intervalTime = 150;
  let superFruitInterval = null;
  let delta = cellWidth;
  let currentScore = 0;
  let difficulty = null;
  let mapSize = null;

  let highscoreTable = new Map();
  let bestScore = 0;
  let currentScoreSpan = $("#currentScoreSpan");
  let bestScoreSpan = $("#bestScoreSpan");
  let superFruit = null;
  let fruitEaten = [];
  let previousEventHandled = true;

  function getHighScoreTable() {
    let jsonObject =
      localStorage.getItem("highscoreTable") == null
        ? null
        : JSON.parse(localStorage.getItem("highscoreTable"));
    if (jsonObject != null)
      for (let key in jsonObject) highscoreTable.set(key, jsonObject[key]);
  }

  function getParameters() {
    let query = window.location.search.substring(1);
    if (query.length == 0) {
      window.location.href = "./zmijica-uputstvo.html";
    } else {
      let params = query.split("&");
      switch ((mapSize = params[1].split("=")[1])) {
        case "small":
          gridSize = 11;
          break;
        case "medium":
          gridSize = 21;
          break;
        case "large":
          gridSize = 31;
          break;
        default:
          window.location.href = "./zmijica-uputstvo.html";
      }
      switch ((difficulty = params[0].split("=")[1])) {
        case "easy":
          intervalTime = 200;
          break;
        case "medium":
          intervalTime = 150;
          break;
        case "hard":
          intervalTime = 100;
          break;
        default:
          window.location.href = "./zmijica-uputstvo.html";
      }
      maxBoardWidth = gridSize * cellWidth + 2 * borderWidth;
      maxBoardHeight = gridSize * cellWidth + 2 * borderWidth;
      bestScore =
        highscoreTable.get(`${difficulty}-${mapSize}`) == null
          ? 0
          : highscoreTable.get(`${difficulty}-${mapSize}`);
    }
  }

  function boardXOffset() {
    return board.offset().left + borderWidth;
  }

  function boardYOffset() {
    return board.offset().top + borderWidth;
  }

  function boundaryRight() {
    return (gridSize - 1) * cellWidth;
  }

  function boundaryBottom() {
    return (gridSize - 1) * cellWidth;
  }

  function loadBoard() {
    currentScoreSpan.text(currentScore);
    bestScoreSpan.text(bestScore);
    board.css({
      "max-width": maxBoardWidth + "px",
      "min-width": maxBoardWidth + "px",
      "min-height": maxBoardHeight + "px",
      "max-height": maxBoardHeight + "px",
    });
    for (i = 0; i < gridSize * gridSize; i++) {
      let cell = $("<div></div>")
        .addClass("cell")
        .addClass(i % 2 == 0 ? "cellEven" : "cellOdd");
      board.append(cell);
    }
  }

  function spawnSnakeHead() {
    let snakeHead = {
      x: Math.floor(Math.random() * gridSize) * cellWidth,
      y: Math.floor(Math.random() * gridSize) * cellWidth,
    };

    snake.push(snakeHead);
  }

  function spawnFruit() {
    fruit = {
      x: Math.floor(Math.random() * gridSize) * cellWidth,
      y: Math.floor(Math.random() * gridSize) * cellWidth,
    };
  }

  function spawnSuperFruit() {
    superFruit = {
      x: Math.floor(Math.random() * gridSize) * cellWidth,
      y: Math.floor(Math.random() * gridSize) * cellWidth,
    };

    board.find(".superFruit").remove();
    let fruitCell = $("<div></div>")
      .addClass("superFruit")
      .offset({
        top: boardYOffset() + superFruit.y,
        left: boardXOffset() + superFruit.x,
      });
    board.append(fruitCell);
  }

  function drawSuperFruit() {
    board.find(".superFruit").remove();
    let fruitCell = $("<div></div>")
      .addClass("superFruit")
      .offset({
        top: boardYOffset() + superFruit.y,
        left: boardXOffset() + superFruit.x,
      });
    board.append(fruitCell);
  }

  function drawSnake() {
    board.find(".snake").remove();
    snake.forEach((s) => {
      let snakeCell = $("<div></div>")
        .addClass("snake")
        .offset({
          top: boardYOffset() + s.y,
          left: boardXOffset() + s.x,
        });
      board.append(snakeCell);
    });
  }

  function drawFruit() {
    board.find(".fruit").remove();
    let fruitCell = $("<div></div>")
      .addClass("fruit")
      .offset({
        top: boardYOffset() + fruit.y,
        left: boardXOffset() + fruit.x,
      });
    board.append(fruitCell);
  }

  function selfColision() {
    for (i = 1; i < snake.length; i++)
      if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) return true;
    return false;
  }

  function checkColision() {
    let snakeHead = snake[0];
    if (
      snakeHead.x > boundaryRight() ||
      snakeHead.x < 0 ||
      snakeHead.y < 0 ||
      snakeHead.y > boundaryBottom()
    ) {
      finishGame();
    } else if (selfColision()) {
      finishGame();
    } else if (snakeHead.x == fruit.x && snakeHead.y == fruit.y) {
      currentScore += 1;
      currentScoreSpan.text(currentScore);
      bestScore = currentScore >= bestScore ? currentScore : bestScore;
      bestScoreSpan.text(bestScore);
      spawnFruit();
      drawFruit();
      fruitEaten.push(snakeHead);
    } else if (snakeHead.x == superFruit.x && snakeHead.y == superFruit.y) {
      currentScore += 10;
      currentScoreSpan.text(currentScore);
      bestScore = currentScore >= bestScore ? currentScore : bestScore;
      bestScoreSpan.text(bestScore);
      spawnSuperFruit();
      clearInterval(superFruitInterval);
      superFruitInterval = setInterval(spawnSuperFruit, 10000);
      fruitEaten.push(snakeHead);
    }
  }

  function moveSnake() {
    if (gameState == "active") {
      previousEventHandled = true;
      let head = { x: snake[0].x + directionX, y: snake[0].y + directionY };
      if (fruitEaten.length > 0) fruitEaten.shift();
      else {
        let tail = snake.pop();
      }
      snake.unshift(head);
      checkColision();
      if (gameState == "active") drawSnake();
    }
  }

  function startGame() {
    if (gameState == "paused") {
      gameState = "active";
      interval = setInterval(moveSnake, intervalTime);
      spawnSuperFruit();
      superFruitInterval = setInterval(spawnSuperFruit, 10000);
    }
  }

  function finishGame() {
    gameState = "over";
    clearInterval(interval);
    clearInterval(superFruitInterval);
    highscoreTable.set(
      `${difficulty}-${mapSize}`,
      currentScore >= bestScore ? currentScore : bestScore
    );
    localStorage.setItem(
      "highscoreTable",
      JSON.stringify(Object.fromEntries(highscoreTable))
    );
    let username = null;
    while (username == null || username == "") {
      username = prompt("Igra je završena! Unesite svoje ime:");
    }
    window.location.href = `./zmijica-rezultati.html?difficulty=${difficulty}&mapSize=${mapSize}&username=${username}&score=${currentScore}`;
  }

  getHighScoreTable();
  getParameters();

  loadBoard();
  spawnSnakeHead();
  spawnFruit();
  drawSnake();
  drawFruit();

  $(window).resize(() => {
    drawSnake();
    drawFruit();
    drawSuperFruit();
  });

  $(document).keydown((event) => {
    if (previousEventHandled) {
      switch (event.keyCode) {
        case 37:
          if (directionX != delta) {
            previousEventHandled = false;
            directionX = -delta;
            directionY = 0;
            startGame();
          }
          break;
        case 38:
          if (directionY != delta) {
            previousEventHandled = false;
            directionX = 0;
            directionY = -delta;
            startGame();
          }
          break;
        case 39:
          if (directionX != -delta) {
            previousEventHandled = false;
            directionX = delta;
            directionY = 0;
            startGame();
          }
          break;
        case 40:
          if (directionY != -delta) {
            previousEventHandled = false;
            directionX = 0;
            directionY = delta;
            startGame();
          }
          break;
      }
    }
  });
});
