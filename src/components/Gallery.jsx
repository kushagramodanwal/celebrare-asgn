import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import useFetchPhotos from "../hooks/useFetchPhotos";

const KEY = "favourites";

function favouritesReducer(state, action) {
  switch (action.type) {
    case "TOGGLE":
      return state.includes(action.id)
        ? state.filter((id) => id !== action.id)
        : [...state, action.id];
    default:
      return state;
  }
}

function loadFavourites() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

export default function Gallery() {
  const { photos, loading, error } = useFetchPhotos();
  const [query, setQuery] = useState("");
  const [favourites, dispatch] = useReducer(favouritesReducer, [], loadFavourites);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favourites));
  }, [favourites]);

  const handleSearch = useCallback((e) => setQuery(e.target.value), []);

  const visible = useMemo(
    () => photos.filter((p) => p.author.toLowerCase().includes(query.toLowerCase())),
    [photos, query]
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search by author name..."
          className="w-full max-w-md mx-auto block border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && (
        <div className="flex justify-center p-10">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full" />
        </div>
      )}

      {!loading && error && (
        <p className="text-center text-red-600 p-10">{error}</p>
      )}

      {!loading && !error && visible.length === 0 && (
        <p className="text-center text-gray-500 p-10">No photos match "{query}".</p>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {visible.map((p) => {
            const isFav = favourites.includes(p.id);
            return (
              <div key={p.id} className="rounded-xl overflow-hidden shadow bg-white">
                <img
                  src={`https://picsum.photos/id/${p.id}/400/300`}
                  alt={p.author}
                  className="w-full h-48 object-cover"
                />
                <div className="flex justify-between items-center p-3">
                  <span className="text-sm text-gray-700">{p.author}</span>
                  <button
                    onClick={() => dispatch({ type: "TOGGLE", id: p.id })}
                    aria-label="Toggle favourite"
                    aria-pressed={isFav}
                    className="text-xl"
                  >
                    {isFav ? "❤️" : "🤍"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
