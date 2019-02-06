import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root) {
  ReactDOM.render(<Starter />, root);
}

class Starter extends React.Component {
  constructor(props) {
    super(props);
    this.flipTile = this.flipTile.bind(this);
    this.state = {
      score: 0,
      clicks: 0,
      lastClick: {row: -1, col: -1},
      tiles: [],
      flipping: false,
      won: false
      };
    this.startGame();
  }

  restart(_ev) {
    this.startGame();
  }
  
  startGame() {
    var positions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    var tiles = _.shuffle(["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"]);
    this.state.tiles = [];
    for (var i = 1; i < positions.length + 1; i++) {
      this.state.tiles.push({name: tiles[i - 1], flipped: false, matched: false});
    }
    this.state.tiles = _.chunk(this.state.tiles, 4);
    this.setState({lastClick: this.state.lastClick, score: 0, flipping: false, won: false, clicks: 0});
  }
  
  determineMatch(row, col) {
    if (this.state.lastClick.row > -1) {
      let newScore = 0;
      if (this.state.tiles[row][col].name == this.state.tiles[this.state.lastClick.row][this.state.lastClick.col].name) {
        this.state.tiles[row][col].matched = true;
        this.state.tiles[this.state.lastClick.row][this.state.lastClick.col].matched = true;
        newScore = this.state.score + 10;
      } else {
        newScore = this.state.score - 1;
      }
        this.state.tiles[row][col].flipped = false;
        this.state.tiles[this.state.lastClick.row][this.state.lastClick.col].flipped = false;
      this.setState({tiles: this.state.tiles, lastClick: {row: -1, col: -1}, flipping: false, score: newScore});
    } else {
      this.setState({tiles: this.state.tiles, lastClick: {row: row, col: col}, flipping: false});
    }
    let won = true;
    for (var i = 0; i < this.state.tiles.length; i++) {
      for (var j = 0; j < this.state.tiles[i].length; j++) {
        if (!this.state.tiles[i][j].matched) {
          won = false;
        }
      }
    }
    this.setState({won: won});
  }
  
  flipTile(row, col) {
    if (!(this.state.lastClick.row == row && this.state.lastClick.col == col)) {
      if (!this.state.flipping) {
        this.state.tiles[row][col].flipped = !this.state.tiles[row][col].flipped;
        this.setState({tiles: this.state.tiles, clicks: this.state.clicks + 1});
        this.setState({flipping: true});
        if (this.state.lastClick.row == -1) {
          this.determineMatch(row, col);
        } else {
          setTimeout(function() {
            this.determineMatch(row, col);
          }.bind(this), 1000);
        }
      }
    }
  }

  render() {
    let result = _.map(this.state.tiles, (row, index) => {
      return <Row 
      key={index}
      row={row}
      rowNum={index}
      root={this}
        />;
    });
    return (
      <div className="container">
        <div className="row">
          <div className="column">
            <h2>Memory Game - Letter Edition</h2>
          </div>
        </div>
        <div className="row">
          <div className="column">
            <h4>Score: {this.state.score}</h4>
            <h4>Clicks: {this.state.clicks}</h4>
          </div>
          <div className="column">
            <button className="restartButton" onClick={this.restart.bind(this)}>Restart</button>
            <Won won={this.state.won} />
          </div>
        </div>
          {result}
      </div>
    );
  }
}

function Tile(props) {
  if (props.flipped) {
    return (
      <div className="tile hover" onClick={() => props.root.flipTile(props.row, props.col)}>
        {props.name}
      </div>
      );
  } else {
    if (props.matched) {
      return (
      <div className="tile matched">
        {props.name}
      </div>
      );
    } else {
    return (
      <div className="tile hover" onClick={() => props.root.flipTile(props.row, props.col)}>
        
      </div>
      );
    }
  }
}

function Row(props) {
  let result = _.map(props.row, (col, index) => {
    return (
      <div className="column" key={index}>
        <Tile 
        name={col.name}
        matched={col.matched}
        row={props.rowNum}
        col={index}
        flipped={col.flipped}
        matched={col.matched}
        root={props.root} />
      </div>
      );
  });
  return <div className="row">{result}</div>;
}

function Won(props) {
  if (props.won) {
    return (<h4 className="won">You Won!</h4>);
  } else {
    return null;
  }
}

