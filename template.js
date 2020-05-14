const FlexSearch = require("flexsearch");

// This will be populated with search data by the build script.
const searchData = {};
const flexSearchOptions = {};

const index = FlexSearch.create(flexSearchOptions);

Object.entries(searchData).forEach(([id, item]) => {
  index.add(id, item.text);
});

exports.handler = function (event, context) {
  const {
    queryStringParameters: { limit, term, excerpt },
  } = event;

  const tokenizeStrategy = flexSearchOptions.tokenize || "strict";

  const results = index.search(term, limit).map((id) => {
    const response = searchData[id].response;

    // If the excerpt param is set, find the match and the
    // n closest words in both directions.
    const excerptNum = parseInt(excerpt);
    if (!isNaN(excerptNum)) {
      const fullText = searchData[id].text.split(/\s/);
      const index = fullText.findIndex((word) => {
        const cleanWord = word.replace(/[^A-Za-z0-9\s]/g, "").toLowerCase();
        const cleanTerm = term.toLowerCase();

        switch (tokenizeStrategy) {
          case "forward":
            return cleanWord.startsWith(cleanTerm);
          case "reverse":
            return cleanWord.endsWith(cleanTerm);
          case "full":
            return cleanWord.includes(cleanTerm);
          case "strict":
          default:
            return cleanWord === cleanTerm;
        }
      });
      if (index > -1) {
        const excerptStartIdx = Math.max(index - excerptNum, 0);
        const excerptEndIdx = Math.min(
          index + excerptNum + 1,
          fullText.length - 1
        );

        response.excerpt = {
          text: fullText.slice(excerptStartIdx, excerptEndIdx).join(" "),
          matchIndex: index - excerptStartIdx,
          moreBefore: index - excerptNum > 0,
          moreAfter: index + excerptNum + 1 < fullText.length - 1,
        };
      }
    }

    return response;
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      results,
    }),
  };
};
