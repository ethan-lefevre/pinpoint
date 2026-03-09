import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">

      <h1 className="home-title">
        Welcome to PinPoint
      </h1>

      <p className="home-subtitle">
        Michigan wrestling. With precision.
      </p>

      <div className="home-buttons">

        <Link to="/rankings" className="home-button">
          View Rankings
        </Link>

        <Link to="/results" className="home-button">
          Tournament Results
        </Link>

        <Link to="/lotw" className="home-button">
          Letter of the Week
        </Link>

      </div>

    </div>
  );
}

export default Home;