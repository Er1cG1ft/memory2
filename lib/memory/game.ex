defmodule Memory.Game do
  def new do
    %{
      lastClick: [-1, -1, false],
      tiles: new_tiles(),
      score: 0,
      clicks: 0,
      won: false
    }
  end
  
  def client_view(game) do
    %{
      tiles: game.tiles,
      lastClick: game.lastClick,
      score: game.score,
      clicks: game.clicks
    }
  end
  
  def move(game, loc) do
    tiles = game.tiles
    lastClick = game.lastClick
    #only check if different tile
    if loc != game.lastClick do
      #flip the tile
      tiles = Enum.map(tiles, fn r ->
        Enum.map(r, fn t ->
          if Map.equal?(t, Enum.at(Enum.at(tiles, Enum.at(loc, 0)), Enum.at(loc, 1))) ||
            (Enum.at(lastClick, 0) !== -1 && Map.equal?(t, Enum.at(Enum.at(tiles, Enum.at(lastClick, 0)), Enum.at(lastClick, 1)))) do
            Map.put(t, :flipped, true)
          else Map.put(t, :flipped, false)
          end
        end)
      end)
      new_game = Map.merge(game, %{tiles: tiles})
      determine_match(new_game, loc)
    else
      Map.merge(game, %{tiles: game.tiles, lastClick: game.lastClick})
    end
  end
  
  def determine_match(game, loc) do
    tiles = game.tiles
    lastClick = game.lastClick
    thisTile = Enum.at(Enum.at(tiles, Enum.at(loc, 0)), Enum.at(loc, 1))
    lastTile = Map.get(Enum.at(Enum.at(tiles, Enum.at(lastClick, 0)), Enum.at(lastClick, 1)), :name)
    
    #if this is the second click
    if Enum.at(lastClick, 0) > -1 do
      #if we have a match
      if Map.get(thisTile, :name) == lastTile do
        #set the two tiles to matched
        tiles = Enum.map(tiles, fn r -> 
          Enum.map(r, fn t -> 
            if Map.get(thisTile, :name) == Map.get(t, :name) do
              Map.put(t, :matched, true)
            else t
            end
          end)
        end)
        
        #update game state & set last clicked back to -1
        Map.merge(game, %{tiles: tiles, lastClick: [-1, -1, true], 
          clicks: game.clicks + 1, score: game.score + 10})
      #if no match
      else
        #return that last click was not match
        Map.merge(game, %{tiles: tiles, lastClick: [-1, -1, false], 
          clicks: game.clicks + 1, score: game.score - 1})
      end
    else
      #this is the first click, just return game state
      Map.merge(game, %{tiles: tiles, lastClick: loc, clicks: game.clicks + 1})
    end
  end
  
  def new_tiles do
    tiles = Enum.shuffle(["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "E1", "E2", "F1", "F2", "G1", "G2", "H1", "H2"])
    new_tiles = Enum.reduce tiles, [], fn t, acc ->
      Enum.concat(acc, [%{name: Enum.at(String.split(t, ""), 1), 
        flipped: false, matched: false, id: Enum.at(String.split(t, ""), 2)}])
    end
    Enum.chunk_every(new_tiles, 4)
  end
end