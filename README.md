[![CircleCI](https://circleci.com/gh/aha-app/netlify-flexsearch.svg?style=shield)](https://circleci.com/gh/aha-app/netlify-flexsearch)

# netlify-flexsearch

Library to help build [FlexSearch](https://github.com/nextapps-de/flexsearch) indexes with Netlify functions.

## When do I need this?

You might find this library useful if:

1. You are building a static site on Netlify and you would like to implement search.
2. You need to index a large enough quantity of data that building an in-browser search index will cause performance problems.
3. You don't want to add a third-party service such as Algolia.

## How does it work?

[Netlify functions](https://www.netlify.com/products/functions) are serverless functions that Netlify automatically detects in your build and serves as APIs. This library helps you generate one or more Netlify functions during your build process which each contain a FlexSearch index. You can then make asynchronous requests to these functions to perform searches; the package also includes helper functions for making search requests.

## Usage

1. Create a build script which invokes `createSearchIndex` one or more times. `createSearchIndex` accepts one object argument with the following options:

| Name | Type | Description |
| --- | --- | --- |
| `index` (required) | `string` | Unique name for the search index (this determines its API path) |
| `data` (required) | `object` | Search data to be indexed (see example below for the required format) |
| `functionsPath` (required) | `string` | Directory where you have configured Netlify functions (relative to the root directory of your application) |
| `flexSearchOptions` (optional) | `object` | Additional options to be passed to FlexSearch when creating the index (see the [FlexSearch documentation](https://github.com/nextapps-de/flexsearch#flexsearch.create) for available options) |

```javascript
const createSearchIndex = require('@aha-app/netlify-flexsearch/createSearchIndex');

// Data must take on this exact format: an object where each key
// is a unique ID and the value is an object containing `text`
// (the text to be indexed for search) and `response` (the data that
// should be returned when this record is found via search).
const blogPosts = {
  "hello-world": {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque augue odio, accumsan eu turpis et, fermentum pellentesque justo.",
    response: {
      slug: "hello-world",
      title: "Hello World"
    }
  },
  "second-post": {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque augue odio, accumsan eu turpis et, fermentum pellentesque justo.",
    response: {
      slug: "second-post",
      title: "Second Post"
    }
  }
}

createSearchIndex({
  index: 'blog',
  data: blogPosts,
  functionsPath: 'src/functions'
});
```

2. You should add a `.gitignore` entry to prevent the output of this script from being checked into git. If your Netlify functions folder is `src/functions`, the `.gitignore` entry might be `src/functions/search*` (all output filenames will begin with `search`).

3. Modify your Netlify build command to invoke the script defined in step 1 in addition to your regular build. For example, if your build command is currently `gatsby build` and you named the script from step ` createSearch.js`, you might change the build command to `node createSearch.js && gatsby build`.

4. Import and use one of the helper functions for searching. The package provides both a React hook and a basic asynchronous function.

```javascript
// Search.js (React-based usage)
import { useSearch } from '@aha-app/netlify-flexsearch';

const Search = () => {
  // useSearch accepts two arguments:
  // 
  // The first (required) is the string name of the index to
  // search -- this must match the index name provided when
  // building the inddex
  // 
  // The second (optional) is an object of additional options:
  // - debounce (default 250)
  // - defaultSearchTerm (prefill the search with a term to start)
  // - limit (limit the number of results that are returned)
  const [searchTerm, setSearchTerm, results, loading, error] = useSearch('blog', { debounce: 300 });

  return (
    <div>
      <input
        type="search"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />

      <h1>Search results</h1>

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
  )
}
```

```javascript
// Non-React helper
import { search } from '@aha-app/netlify-flexsearch';

search({ index: 'blog', term: 'hello', limit: 10 }).then(response => {
  // Do something with the results
  console.log(response.results);
})
```

## Caveats

* By default, Netlify functions run with 1024MB of RAM, so if your search index is too large you will see a build error.
* This library has also not been tested with search indexes larger than a few MB; you might see slow/unacceptable search performance if your search index is hundreds of MB, even if it's under the 1024MB limit.

## License

MIT
