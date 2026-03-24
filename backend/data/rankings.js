const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

function normalizeValue(value) {
  return typeof value === "string" ? value.trim() : value;
}

async function getRankings() {
  const filePath = path.join(__dirname, "rankings.csv");

  return new Promise((resolve, reject) => {
    const rankings = {};

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => normalizeValue(header).toUpperCase(),
          mapValues: ({ value }) => normalizeValue(value),
        })
      )
      .on("data", (row) => {
        const division = row.DIVISION;
        const weight = row.WEIGHT;
        const rank = Number(row.RANK);
        const name = row.NAME;
        const school = row.SCHOOL;
        const grade = row.GRADE;

        if (!division || !weight || Number.isNaN(rank) || !name) {
          return;
        }

        if (!rankings[division]) rankings[division] = {};
        if (!rankings[division][weight]) rankings[division][weight] = [];

        rankings[division][weight].push({
          rank,
          name,
          school,
          grade,
        });
      })
      .on("end", () => {
        for (const division of Object.keys(rankings)) {
          for (const weight of Object.keys(rankings[division])) {
            rankings[division][weight].sort((a, b) => a.rank - b.rank);
          }
        }

        if (Object.keys(rankings).length === 0) {
          reject(new Error("Rankings CSV loaded, but no ranking rows were parsed."));
          return;
        }

        resolve(rankings);
      })
      .on("error", reject);
  });
}

module.exports = getRankings;