const config = {
  port: process.env.PORT || 5000,

  mongoUri: process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,

  rankingsSheetUrl:
    process.env.RANKINGS_SHEET_URL ||
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsQx3pwEu5zi1C5VH8GN2utWYSrcDSMsSxACzJzlJUo_s0oJY3oGsrogPAEiZ-BBX_w8Qsfk6Cuyr_/pub?gid=0&single=true&output=csv",
};

if (!config.mongoUri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET environment variable is not set");
}

module.exports = config;
