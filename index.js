import { useEffect, useReducer, useState } from "react";
import { useDebounce } from "use-debounce";

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const search = ({ index, term, limit }) => {
  let searchUrl = `/.netlify/functions/search${capitalize(index)}?term=${term}`;
  if (limit) searchUrl = `${searchUrl}&limit=${limit}`;
  return fetch(searchUrl).then((response) => response.json());
};

const initialState = {
  loading: false,
  error: null,
  results: [],
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
  { defaultTerm = "", debounce = 250, limit } = {}
) => {
  const [searchTerm, setSearchTerm] = useState(defaultTerm);
  const [{ loading, results, error }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const [term] = useDebounce(searchTerm, debounce);

  useEffect(() => {
    if (term && term !== "") {
      dispatch({ type: "startSearch" });
      search({ index, term, limit })
        .then((response) =>
          dispatch({
            type: "endSearch",
            results: response.results,
            error: null,
          })
        )
        .catch((error) => dispatch({ type: "endSearch", results: [], error }));
    }
  }, [index, term, limit]);

  return [searchTerm, setSearchTerm, results, loading, error];
};
