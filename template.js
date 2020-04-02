const FlexSearch = require("flexsearch");

// This will be populated with search data by the build script.
const searchData = {};
const flexSearchOptions = {};

const index = FlexSearch.create(flexSearchOptions);

Object.entries(searchData).forEach(([id, item]) => {
  index.add(id, item.text);
});

exports.handler = function(event, context, callback) {
  const {
    queryStringParameters: { limit, term },
  } = event;

  const results = index
    .search(term, limit)
    .map((id) => searchData[id].response);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      results,
    }),
  });
};
