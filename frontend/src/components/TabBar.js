import React from "react";
import "./tabbar.css";
import logo from '../dashboard/assets/logo-ptc.png'; // Adjust path as needed

function TabBar({ profile }) {
  const initials =
    (profile?.first_name?.[0] ?? "") + (profile?.last_name?.[0] ?? "");

  const handleClick = () => {
    window.location.href = "/profile";
  };

  return (
    <nav className="tabbar-topbar">
      <div className="tabbar-college-name">
        <img src={logo} alt="PTC Logo" className="tabbar-ptc-logo" />
        Pateros Technological College - Online Application Management System
      </div>
      <div
        className="tabbar-profilebar"
        onClick={handleClick}
        tabIndex={0}
        title="Go to profile"
      >
        <div className="tabbar-profile-avatar">
          {profile?.profile_pic ? (
            <img
              src={
                profile.profile_pic.startsWith("http") ||
                profile.profile_pic.startsWith("data:")
                  ? profile.profile_pic
                  : `http://localhost:5000${profile.profile_pic}`
              }
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span>{initials.toUpperCase()}</span>
          )}
        </div>
        <span className="tabbar-profile-name">
          {profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.full_name || ""}
        </span>
      </div>
    </nav>
  );
}

export default TabBar;