const https = require("https");
const csv = require("csv-parser");
const { rankingsSheetUrl } = require("../config");

function normalizeValue(value) {
  return typeof value === "string" ? value.trim() : value;
}

function fetchCsv(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const { statusCode = 0, headers } = response;

        if (
          statusCode >= 300 &&
          statusCode < 400 &&
          headers.location &&
          redirects < 5
        ) {
          response.resume();
          resolve(fetchCsv(headers.location, redirects + 1));
          return;
        }

        if (statusCode !== 200) {
          response.resume();
          reject(new Error(`Rankings sheet request failed with ${statusCode}`));
          return;
        }

        resolve(response);
      })
      .on("error", reject);
  });
}

async function getRankings() {
  const response = await fetchCsv(rankingsSheetUrl);

  return new Promise((resolve, reject) => {
    const rankings = {};

    response
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
          reject(
            new Error(
              "Rankings sheet loaded, but no ranking rows were parsed from the CSV."
            )
          );
          return;
        }

        resolve(rankings);
      })
      .on("error", reject);
  });
}

module.exports = getRankings;
