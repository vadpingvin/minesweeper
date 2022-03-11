import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  width: number = 15;
  height: number = 10;
  minePercent: number = 20;
  flagCounter: number = 0;
  newWidth: number;
  newHeight: number;
  newMinePercent: number;
  minefield: Cell[][] = null;
  gameState: number = 0;
  readonly allowSingleClickSelectNeighbours: boolean = true;

  ngOnInit(): void {
    this.newWidth = this.width;
    this.newHeight = this.height;
    this.newMinePercent = this.minePercent;
    this.restart();
  }

  flag(event: MouseEvent, cell: Cell, column: number, row: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.gameState != 0) {
      return;
    }
    if (cell.flag) {
      cell.flag = false;
      this.flagCounter++;
    } else if (cell.hidden) {
      cell.flag = true;
      this.flagCounter--;
    }
  }

  select(event: MouseEvent, cell: Cell, column: number, row: number, selecting: boolean = true) {
    if (this.gameState != 0) {
      return;
    }
    if (selecting && !cell.hidden) {
      if (this.allowSingleClickSelectNeighbours) {
        this.selectNeighbours(event, cell, column, row);
      }
      return;
    }
    cell.hidden = false;
    if (cell.mine) {
      this.gameState = 1;
      return;
    }
    // show surrounding
    if (cell.count == 0) {
      for (let i = column - 1; i <= column + 1; i++) {
        for (let j = row - 1; j <= row + 1; j++) {
          if ((i != column || j != row) && i >= 0 && i < this.height && j >= 0 && j < this.width &&
            this.minefield[i][j].hidden && !this.minefield[i][j].mine) {
              this.select(event, this.minefield[i][j], i, j, false);
            }
        }
      }
    }
    // check victory
    if (selecting) {
      let win: boolean = true;
      for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width; j++) {
          let c = this.minefield[i][j];
          if (c.hidden && !c.mine) {
            win = false;
          }
        }
      }
      if (win) {
        this.gameState = 2;
      }
    }
  }

  selectNeighbours(event: MouseEvent, cell: Cell, column: number, row: number, selecting: boolean = true) {
    if (this.gameState != 0) {
      return;
    }
    if (cell.hidden || cell.count < 1) {
      return;
    }
    // if cell count equals neighbour flag count, select neighbour cells
    if (this.countNeighbours(column, row, NeighbourCountMode.Flag) == cell.count) {
      for (let i = column - 1; i <= column + 1; i++) {
        for (let j = row - 1; j <= row + 1; j++) {
          if ((i != column || j != row) && i >= 0 && i < this.height && j >= 0 && j < this.width) {
            let cell2: Cell = this.minefield[i][j];
            if (cell2.hidden && !cell2.flag) {
              this.select(event, cell2, i, j);
            }
          }
        }
      }
    }
  }

  countNeighbours(column: number, row: number, mode: NeighbourCountMode): number {
    let count: number = 0;
    for (let i = column - 1; i <= column + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        if ((i != column || j != row) && i >= 0 && i < this.height && j >= 0 && j < this.width) {
          let cell: Cell = this.minefield[i][j];
          switch (mode) {
            case NeighbourCountMode.Mine:
              if (cell.mine) {
                count++;
              }
              break;
            case NeighbourCountMode.Flag:
              if (cell.flag) {
                count++;
              }
              break;
            case NeighbourCountMode.Hidden:
              if (cell.hidden) {
                count++;
              }
              break;
          }
        }
      }
    }
    return count;
  }

  restart() {
    this.gameState = 0;
    this.width = this.newWidth;
    this.height = this.newHeight;
    this.minePercent = this.newMinePercent;
    this.flagCounter = 0;
    this.minefield = [];
    // base field
    for (let i = 0; i < this.height; i++) {
      let row: Cell[] = [];
      for (let j = 0; j < this.width; j++) {
        let c: Cell = new Cell();
        row.push(c);
      }
      this.minefield.push(row);
    }
    // mines
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (Math.random() * 100 < this.minePercent) {
          this.minefield[i][j].mine = true;
          this.flagCounter++;
        }
      }
    }
    // calculate count
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        this.minefield[i][j].count = this.countNeighbours(i, j, NeighbourCountMode.Mine);
      }
    }
  }
}

enum NeighbourCountMode {
  Mine,
  Flag,
  Hidden,
}

class Cell {
  hidden: boolean = true;
  count: number = 0;
  mine: boolean = false;
  flag: boolean = false;

  get imageSrc(): string {
    if (this.hidden) {
      return this.flag ? 'flag.png' : 'covered.png';
    }
    if (this.mine) {
      return 'mine.png';
    }
    return `number-${this.count}.png`;
  }
}
