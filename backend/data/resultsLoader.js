const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function getResults() {
  const filePath = path.join(__dirname, "results.csv");

  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", () => {
        const tournamentsMap = new Map();

        for (const row of rows) {
          const tournamentName = (row.tournament || "").trim();
          const rawDate = (row.date || "").trim();
          const location = (row.location || "").trim();
          const weight = (row.weight || "").trim();
          const champion = (row.champion || "").trim();
          const runnerUp = (row.runnerUp || "").trim();

          if (!tournamentName) continue;

          const key = `${tournamentName}__${rawDate}__${location}`;

          if (!tournamentsMap.has(key)) {
            tournamentsMap.set(key, {
              name: tournamentName,
              date: formatDate(rawDate),
              location,
              matches: [],
            });
          }

          if (weight || champion || runnerUp) {
            tournamentsMap.get(key).matches.push({
              weight,
              champion,
              runnerUp,
            });
          }
        }

        const tournaments = Array.from(tournamentsMap.values());

        resolve(tournaments);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

module.exports = getResults;