import { useEffect, useReducer, useState } from "react";
import { useDebounce } from "use-debounce";

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const search = ({ index, term, excerpt, limit = 25 }) => {
  let searchUrl = `/.netlify/functions/search${capitalize(index)}?term=${term}`;
  if (limit) searchUrl = `${searchUrl}&limit=${limit}`;
  if (excerpt) searchUrl = `${searchUrl}&excerpt=${excerpt}`;
  return fetch(searchUrl).then((response) => response.json());
};

const reducer = (state, action) => {
  switch (action.type) {
    case "startSearch":
      return { loading: true, error: state.error, results: state.results };
    case "endSearch":
      return { loading: false, error: action.error, results: action.results };
    default:
      throw new Error();
  }
};

export const useSearch = (
  index,
  { defaultSearchTerm = "", debounce = 250, limit = 25, excerpt = false } = {}
) => {
  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm);
  const initialState = {
    loading: Boolean(defaultSearchTerm && defaultSearchTerm !== ""),
    error: null,
    results: [],
  };
  const [{ loading, results, error }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const [term] = useDebounce(searchTerm, debounce);

  useEffect(() => {
    if (term && term !== "") {
      dispatch({ type: "startSearch" });
      search({ index, term, limit, excerpt })
        .then((response) =>
          dispatch({
            type: "endSearch",
            results: response.results,
            error: null,
          })
        )
        .catch((error) => dispatch({ type: "endSearch", results: [], error }));
    }
  }, [index, term, limit, excerpt]);

  return [searchTerm, setSearchTerm, results, loading, error];
};
