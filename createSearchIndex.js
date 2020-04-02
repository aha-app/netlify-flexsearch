const fs = require("fs");
const path = require("path");

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = ({ index, data, functionsPath, flexSearchOptions }) => {
  const template = fs
    .readFileSync(path.join(__dirname, "template.js"))
    .toString();

  let populated = template.replace(
    "const searchData = {};",
    `const searchData = ${JSON.stringify(data)};`
  );

  if (flexSearchOptions) {
    populated = populated.replace(
      "const flexSearchOptions = {};",
      `const flexSearchOptions = ${JSON.stringify(flexSearchOptions)};`
    );
  }

  fs.writeFileSync(
    path.join(process.cwd(), functionsPath, `search${capitalize(index)}.js`),
    populated
  );
};
