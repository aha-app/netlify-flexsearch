const FlexSearch = require("flexsearch");

// This will be populated with search data by the build script.
const searchData = {};
const flexSearchOptions = {};

const index = FlexSearch.create(flexSearchOptions);

Object.entries(searchData).forEach(([id, item]) => {
  index.add(id, item.text);
});

exports.handler = function (event, context, callback) {
  const {
    queryStringParameters: { limit, term, excerpt },
  } = event;

  const results = index.search(term, limit).map((id) => {
    const response = searchData[id].response;

    // If the excerpt param is set, find the match and the
    // n closest words in both directions.
    const excerptNum = parseInt(excerpt);
    if (!isNaN(excerptNum)) {
      const fullText = searchData[id].text.split(/\s/);
      const index = fullText.findIndex(
        (word) =>
          word.replace(/[^A-Za-z0-9\s]/g, "").toLowerCase() ===
          term.toLowerCase()
      );
      if (index > -1) {
        response.excerpt = {
          text: fullText
            .slice(
              Math.max(index - excerptNum, 0),
              Math.min(index + excerptNum + 1, fullText.length - 1)
            )
            .join(" "),
          moreBefore: index - excerptNum > 0,
          moreAfter: index + excerptNum + 1 < fullText.length - 1,
        };
      }
    }

    return response;
  });

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      results,
    }),
  });
};
