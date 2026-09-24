import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import ReactPaginateModule from "react-paginate";
import type { ReactPaginateProps } from "react-paginate";

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";

import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";

import css from "./App.module.css";

type ModuleWithDefault<T> = { default: T };

const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<
    ComponentType<ReactPaginateProps>
  >
).default;

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = (newQuery: string) => {
    setPage(1);
    setQuery(newQuery);
    setSelectedMovie(null);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: query !== "",
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (data && data.results.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [data]);

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  return (
    <>
      <SearchBar onSubmit={handleSearch} />

      <main className={css.app}>
        {isLoading && <Loader />}

        {isError && !isLoading && <ErrorMessage />}

        {totalPages > 1 && (
          <ReactPaginate
            pageCount={totalPages}
            pageRangeDisplayed={5}
            marginPagesDisplayed={1}
            onPageChange={({ selected }) => setPage(selected + 1)}
            forcePage={page - 1}
            containerClassName={css.pagination}
            activeClassName={css.active}
            nextLabel="→"
            previousLabel="←"
          />
        )}

        {!isLoading && !isError && movies.length > 0 && (
          <MovieGrid movies={movies} onSelect={setSelectedMovie} />
        )}
      </main>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      <Toaster position="top-right" />
    </>
  );
}
