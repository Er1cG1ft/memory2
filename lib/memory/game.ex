defmodule Memory.Game do
  def new do
    %{
      lastClick: [],
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
    IO.puts(loc)
    tiles = game.tiles
    
    #flip the tile
    tiles = Enum.map(tiles, fn r -> 
      Enum.map(r, fn t -> 
        if Map.equal?(t, Enum.at(Enum.at(tiles, Enum.at(loc, 0)), Enum.at(loc, 1))) do
          Map.put(t, :flipped, !Map.get(t, :flipped))
        else t
        end
      end)
    end)
    
    IO.inspect(tiles)

    Map.merge(game, %{tiles: tiles, lastClick: loc})
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