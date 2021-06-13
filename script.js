const color_array = ["#FFC09F" , "#FFEE93", "#FCF5C7", "#A0CED9", "#ADF7B6", "#746606"]


class Box {
  constructor(x, y, n=4) {
    this.x = x;
    this.y = y;
    this.n = n;
  }

  getTopBox() {
    if (this.y === 0) return null;
    return new Box(this.x, this.y - 1, this.n);
  }

  getRightBox() {
    if (this.x === this.n) return null;
    return new Box(this.x + 1, this.y, this.n);
  }

  getBottomBox() {
    if (this.y === this.n) return null;
    return new Box(this.x, this.y + 1, this.n);
  }

  getLeftBox() {
    if (this.x === 0) return null;
    return new Box(this.x - 1, this.y, this.n);
  }

  getNextdoorBoxes() {
    return [
      this.getTopBox(),
      this.getRightBox(),
      this.getBottomBox(),
      this.getLeftBox()
    ].filter(box => box !== null);
  }

  getRandomNextdoorBox() {
    const nextdoorBoxes = this.getNextdoorBoxes();
    return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)];
  }
}

const swapBoxes = (grid, box1, box2) => {
  const temp = grid[box1.y][box1.x];
  grid[box1.y][box1.x] = grid[box2.y][box2.x];
  grid[box2.y][box2.x] = temp;
};

const isSolved = (grid, gridqn) => {
  let isequal = true;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if(grid[i+1][j+1] != gridqn[i][j])
        isequal = false;
    }
    console.log("issolved");
  }  
  
  return (isequal);
};

const getRandomGrid = (size) => {
  //let grid = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 0]];
  //let grid = [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]];
  //let grid = [[1, 2, 3, 4, 5], [6, 1, 2, 3, 4], [5, 6, 1, 2, 3], [4, 5, 6, 1, 2], [3, 4, 5, 6, 0]];
  let grid = Array.from(Array(size), () => new Array(size));
  var k = 1;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if(k>6){ k=1; }  
      grid[i][j] = k;
      console.log(grid[i][j]);
      k++;
    }
  }  
  if(size === 5){
  grid[size - 1][size - 1] = 0; }      
  // Shuffle
  //let blankBox = new Box(3, 3);
  let blankBox = new Box(size-1, size-1, size-1);
  for (let i = 0; i < 1000; i++) {
    const randomNextdoorBox = blankBox.getRandomNextdoorBox();
    swapBoxes(grid, blankBox, randomNextdoorBox);
    blankBox = randomNextdoorBox;
  }

  //if (isSolved(grid, gridqn)) return getRandomGrid(size);
  return grid;
};

class State {
  constructor(gridqn, grid, move, time, status) {
    this.gridqn = gridqn;
    this.grid = grid;
    this.move = move;
    this.time = time;
    this.status = status;
    this.score = 0;
  }

  static ready() {
    return new State(
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],  
    0,
      0,
      "ready"
    );
  }

  static start() {
    return new State(getRandomGrid(3), getRandomGrid(5), 0, 0, "playing");
  }
}

class Game {
  constructor(state) {
    this.state = state;
    this.tickId = null;
    this.tick = this.tick.bind(this);
    this.render();
    this.handleClickBox = this.handleClickBox.bind(this);
  }

  static ready() {
    return new Game(State.ready());
  }

  tick() {
    this.setState({ time: this.state.time + 1 });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  handleClickBox(box) {
    return function() {
      const nextdoorBoxes = box.getNextdoorBoxes();
      const blankBox = nextdoorBoxes.find(
        nextdoorBox => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0
      );
      if (blankBox) {
        const newGrid = [...this.state.grid];
        const newGridQn = [...this.state.gridqn];        swapBoxes(newGrid, box, blankBox);
        if (isSolved(newGrid, newGridQn)) {
          clearInterval(this.tickId);
          this.setState({
            status: "won",
            score: (1/move)*20 + (1/time)*30,
            grid: newGrid,
            move: this.state.move + 1
          });
        } else {
          this.setState({
            grid: newGrid,
            move: this.state.move + 1
          });
        }
      }
    }.bind(this);
  }

  render() {
    const { gridqn, grid, move, time, status , score } = this.state;
    // Render Qn grid
    const newGridQn = document.createElement("div");
    newGridQn.className = "gridqn";
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const buttonqn = document.createElement("button");

        console.log(gridqn[i][j]);
        //button.textContent = grid[i][j] === 0 ? "" : grid[i][j].toString();
        buttonqn.style.background = gridqn[i][j] === 0 ? "#003333" : color_array[gridqn[i][j]];
        newGridQn.appendChild(buttonqn);
      }
    }
    document.querySelector(".gridqn").replaceWith(newGridQn);

    // Render grid
    const newGrid = document.createElement("div");
    newGrid.className = "grid";
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const button = document.createElement("button");

        if (status === "playing") {
          button.addEventListener("click", this.handleClickBox(new Box(j, i)));
        }
        console.log(grid[i][j]);
        //button.textContent = grid[i][j] === 0 ? "" : grid[i][j].toString();
        button.style.background = grid[i][j] === 0 ? "#444444" : color_array[grid[i][j]];
        newGrid.appendChild(button);
      }
    }
    document.querySelector(".grid").replaceWith(newGrid);

    // Render button
    const newButton = document.createElement("button");
    if (status === "ready") newButton.textContent = "Play";
    if (status === "playing") newButton.textContent = "Reset";
    if (status === "won") newButton.textContent = "Play";
    newButton.addEventListener("click", () => {
      clearInterval(this.tickId);
      this.tickId = setInterval(this.tick, 1000);
      this.setState(State.start());
    });
    document.querySelector(".footer button").replaceWith(newButton);

    // Render move
    document.getElementById("move").textContent = `Move: ${move}`;

    // Render time
    document.getElementById("time").textContent = `Time: ${time}`;

    // Render message
    if (status === "won") {
      document.querySelector(".message").textContent = `You Win ! : ${score}`;
    } else {
      document.querySelector(".message").textContent = "";
    }
  }
}

const GAME = Game.ready();
