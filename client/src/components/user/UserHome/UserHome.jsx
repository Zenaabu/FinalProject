import "./UserHome.css";
import WeatherWidget from "../Dashboard/WeatherWidget/WeatherWidget";

function UserHome() {
  const stored = sessionStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const firstName = user?.first_name || "Surfer";

  return (
    <div className="user-home">
      <div className="user-home__welcome">
        <h1 className="user-home__title">Welcome back, {firstName}!</h1>
        <p className="user-home__subtitle">Welcome to Blue Mars Surf Club</p>
      </div>
      <WeatherWidget />
    </div>
  );
}

export default UserHome;
