defmodule Memory.Game do
  def new do
    %{
      lastClick: [-1, -1],
      tiles: new_tiles(),
    }
  end
  
  def client_view(game) do
    tiles = game.tiles
    lastClick = game.lastClick
    %{
      tiles: tiles,
      lastClick: lastClick
    }
  end
  
  def move(game, loc) do
    tiles = game.tiles
    new_game = game
    lastClick = game.lastClick
    #only check if different tile
    if loc != game.lastClick do
      #flip the tile
      tiles = Enum.map(tiles, fn r ->
        Enum.map(r, fn t ->
          if Map.equal?(t, Enum.at(Enum.at(tiles, Enum.at(loc, 0)), Enum.at(loc, 1))) do
            Map.put(t, :flipped, !Map.get(t, :flipped))
          else t
          end
        end)
      end)
      new_game = Map.merge(game, %{tiles: tiles})
      determine_match(new_game, loc)
      
      # #if we have the first click, check if there's a match with no delay
      # if Enum.at(lastClick, 0) == -1 do
      #   IO.puts("here2")
      # else
      #   IO.puts("here")
      #   :timer.sleep(1000)
      #   determine_match(new_game, loc)
      #   #Map.merge(game, %{tiles: tiles, lastClick: loc})
      # end
    else
      IO.puts("here4")
      Map.merge(game, %{tiles: game.tiles, lastClick: game.lastClick})
    end
  end
  
  def determine_match(game, loc) do
    tiles = game.tiles
    lastClick = game.lastClick
    thisTile = Enum.at(Enum.at(tiles, Enum.at(loc, 0)), Enum.at(loc, 1))
    lastTile = Map.get(Enum.at(Enum.at(tiles, Enum.at(lastClick, 0)), Enum.at(lastClick, 1)), :name)
    
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
        Map.merge(game, %{tiles: tiles, lastClick: [-1, -1]})
      #if no match
      else
        #unflip tiles
        tiles = Enum.map(tiles, fn r ->
          Enum.map(r, fn t -> 
            Map.put(t, :flipped, false)
          end)
        end)
        Map.merge(game, %{tiles: tiles, lastClick: [-1, -1]})
      end
    else
      Map.merge(game, %{tiles: tiles, lastClick: loc})
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