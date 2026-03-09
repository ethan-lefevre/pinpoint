const https = require("https")
const csv = require("csv-parser")

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsQx3pwEu5zi1C5VH8GN2utWYSrcDSMsSxACzJzlJUo_s0oJY3oGsrogPAEiZ-BBX_w8Qsfk6Cuyr_/pub?gid=0&single=true&output=csv"

function getRankings(){

return new Promise((resolve,reject)=>{

const rankings = {}

https.get(SHEET_URL,(response)=>{

response
.pipe(csv())
.on("data",(row)=>{

const division = row["DIVISION"]
const weight = row["WEIGHT"]
const rank = Number(row["RANK"])
const name = row["NAME"]
const school = row["SCHOOL"]
const grade = row["GRADE"]

if(!division || !weight) return

if(!rankings[division]) rankings[division] = {}
if(!rankings[division][weight]) rankings[division][weight] = []

rankings[division][weight].push({
rank,
name,
school,
grade
})

})
.on("end",()=>{

// sort each weight by rank
for(const division in rankings){
for(const weight in rankings[division]){
rankings[division][weight].sort((a,b)=>a.rank-b.rank)
}
}

resolve(rankings)

})
.on("error",reject)

})

})

}

module.exports = getRankings