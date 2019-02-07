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
    this.restart = this.restart.bind(this);
    this.state = {};
    
    this.channel
        .join()
        .receive("ok", this.got_view.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp); });
  }
  
  got_view(view) {
    this.setState(view.game);
    let won = true;
    for (var i = 0; i < this.state.tiles.length; i++) {
      for (var j = 0; j < this.state.tiles[i].length; j++) {
        if (!this.state.tiles[i][j].matched) {
          won = false;
        }
      }
    }
    this.setState({won: won});
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
    this.channel.push("restart", {})
        .receive("ok", this.got_view.bind(this));
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

