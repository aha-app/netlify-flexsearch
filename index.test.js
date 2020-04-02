import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { search, useSearch } from "./index";

describe("useSearch", () => {
  const Search = () => {
    const [searchTerm, setSearchTerm, results, loading, error] = useSearch(
      "blog"
    );

    return (
      <div>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
        />

        {loading && "Loading..."}
        {error && `Oh no! Something went wrong.`}
        {!(loading || error) && (
          <ul>
            {results.map((result) => (
              // Result data here matches what is provided in the
              // `response` object when building the index.
              <li key={result.id}>{result.name}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  it("returns search results", async () => {
    global.fetch.once(
      JSON.stringify({
        results: [{ id: "123", name: "Lorem ipsum" }],
      })
    );

    render(<Search />);
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "Lorem" },
    });
    await waitFor(() => expect(screen.getByText("Lorem ipsum")));
  });
});
