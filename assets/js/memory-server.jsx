import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root, channel) {
  ReactDOM.render(<Memory channel={channel} />, root);
}

class Memory extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;
    this.on_move = this.on_move.bind(this);
    this.state = {};
    
    this.channel
        .join()
        .receive("ok", this.got_view.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp); });
  }
  
  got_view(view) {
    console.log("new view", view);
    this.setState(view.game);
    //handle timeout
    if (view.game.lastClick[0] == -1 && !view.game.lastClick[2]) {
      this.setState({flipping: true});
      setTimeout(function() {
        for (var i = 0; i < view.game.tiles.length; i++) {
          for (var j = 0; j < view.game.tiles[i].length; j++) {
            view.game.tiles[i][j].flipped = false;
          }
        }
        this.setState(view.game);
        this.setState({flipping: false});
      }.bind(this), 1000);
    }
  }
  
  on_move(row, column) {
    if (!this.state.flipping) {
    this.channel.push("move", { location: [row, column] })
        .receive("ok", this.got_view.bind(this));
    }
  }

  restart(_ev) {
    this.startGame();
  }
  
  startGame() {
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
  if (props.matched) {
      return (
      <div className="tile matched">
        {props.name}
      </div>
      );
    } else if (props.flipped) {
    return (
      <div className="tile hover" onClick={() => props.root.on_move(props.row, props.col)}>
        {props.name}
      </div>
      );
  } else {
    return (
      <div className="tile hover" onClick={() => props.root.on_move(props.row, props.col)}>
        
      </div>
      );
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

