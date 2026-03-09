import React from "react";
import Header from "../components/header"; // your existing header
import "../index.css"; // import your main CSS

function Paywall() {

    

  return (
    <div className="paywall-container">
    <div className="paywall-page min-h-screen w-full flex flex-col items-center">
      {/* Header is always visible */}
      <Header />

      <div className="paywall-card">
        <h1 className="paywall-title">
          Unlock Full Access
        </h1>
        <p className="paywall-subtitle">
          Get rankings, results, and exclusive content for just <strong>$3/month</strong>.
        </p>

        <ul className="paywall-features">
          <li>🔒 Rankings: See all divisions and weights</li>
          <li>🔒 Tournament Results: Stay up-to-date</li>
          <li>🔒 Letter of the Week: Exclusive stories</li>
        </ul>

        <button className="subscribe-button">
          Subscribe Now
        </button>
      </div>
    </div>
    </div>
  );
}

export default Paywall;