import { useState, useEffect } from "react"

function LetterOfTheWeek(){

const [data,setData] = useState(null)
const [loading,setLoading] = useState(true)

useEffect(()=>{

async function fetchArticle(){

const token = localStorage.getItem("token")

const response = await fetch("http://localhost:5000/letters",{
headers:{
Authorization:`Bearer ${token}`
}
})

const result = await response.json()

setData(result)
setLoading(false)

}

fetchArticle()

},[])

if(loading){
return <div className="loading">Loading article...</div>
}

return(

<div className="container">

<div className="article-container">

<h1 className="article-title">
{data.title}
</h1>

<div className="article-meta">
By {data.author} • {data.school} • {data.date}
</div>

<div className="article-body">

{data.body.split("\n").map((p,i)=>(
<p key={i}>{p}</p>
))}

</div>

</div>

<div className="submit-box">

<h2>Want to be featured?</h2>

<p>
We want to hear from
<strong> YOU.</strong>
</p>

<p className="email">
Email submissions to:
</p>

<p className="email-address">
<em>submissions@pinpointsports.com</em>
</p>

</div>

</div>

)

}

export default LetterOfTheWeek