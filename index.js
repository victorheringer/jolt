const pixels = require("image-pixels");
const fs = require("fs");
const DEX_ORDER = require("./dex-order.json");

const COLORS = {
  0: "11",
  85: "10",
  170: "01",
  255: "00",
};

const WIDTH_SIZE = 112;

function arrayToMatrix(list, size) {
  let matrix = [],
    i,
    k;

  for (i = 0, k = -1; i < list.length; i++) {
    if (i % size === 0) {
      k++;
      matrix[k] = [];
    }

    matrix[k].push(COLORS[list[i]]);
  }

  return matrix;
}

function groupRGBA(list) {
  const result = [];

  for (let i = 0; i < list.length; i = i + 4) {
    result.push(list[i]);
  }

  return result;
}

function joinRowsAsBinary(row) {
  return row.reduce((acc, value) => `${acc}${value}`, "");
}

function formatFileToName(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).replace(".png", "");
}

function padArray(length) {
  return Array(length).fill("".padStart(WIDTH_SIZE, "0"));
}

async function main() {
  const list = [];

  const files = fs.readdirSync("./sprites/front/");

  for (let i = 0; i < files.length; i++) {
    const { data, width, height } = await pixels(`./sprites/front/${files[i]}`);
    const converted = arrayToMatrix(groupRGBA(data), width);
    if (width != height) console.log(files[i]);

    const joinedConverted = converted.map((c) => {
      const r = joinRowsAsBinary(c);

      if (WIDTH_SIZE - r.length === 0) return r;

      const halfPad = (WIDTH_SIZE - r.length) / 2;

      return r.padStart(WIDTH_SIZE - halfPad, "00").padEnd(WIDTH_SIZE, "00");
    });

    const final =
      56 - joinedConverted.length > 0
        ? [
            ...padArray((56 - joinedConverted.length) / 2),
            ...joinedConverted,
            ...padArray((56 - joinedConverted.length) / 2),
          ]
        : joinedConverted;

    const name = formatFileToName(files[i]);
    list.push({
      number: DEX_ORDER[name.toUpperCase()],
      name: name,
      data: final,
    });
  }

  fs.writeFileSync("./dump.json", JSON.stringify(list));
}

main();
