import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const buttons = [
  { label: 'Dashboard', path: '/dashboard', logo: '/dash.png' },
  { label: 'Application Form', path: '/application-form', logo: '/form.png' },
  { label: 'Application Status', path: '/application-status', logo: '/status.png' },
  { label: 'Payment Information', path: '/payment-information', logo: '/payment.png' },
  { label: 'Documents Upload', path: '/document-upload', logo: '/docs.png' },
  { label: 'Messages', path: '/messages', logo: '/message.png' },
  { label: 'Profile', path: '/profile', logo: '/profile.png' },
  { label: 'Settings', path: '/settings', logo: '/settings.png' },
];

function Sidebar() {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="sidebar-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon Sidebar */}
      <div className="icon-sidebar">
        <div className="sidebar-row logo-row">
          <img src="/logoptc.png" alt="PTC Logo" className="ptc-logo" />
        </div>
        <div className="icon-btns">
          {buttons.map((btn) => (
            <div
              className="sidebar-row icon-btn-row"
              key={btn.label}
              title={btn.label}
              onClick={() => navigate(btn.path)}
            >
              <img
                src={btn.logo}
                alt={btn.label + " logo"}
                className="icon-btn-logo"
              />
            </div>
          ))}
        </div>
        <div
          className="sidebar-row icon-btn-row signout"
          title="Sign Out"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          <img src="/logout.png" alt="Sign Out logo" className="icon-btn-logo" />
        </div>
      </div>

      {/* Label Sidebar */}
      <div className={`label-sidebar${hovered ? " open" : ""}`}>
        <div className="sidebar-row logo-row label-header">
          <span className="label-title">PTC OAMS</span>
        </div>
        <div className="label-btns">
          {buttons.map((btn) => (
            <div className="sidebar-row label-btn-row" key={btn.label}>
              <button onClick={() => navigate(btn.path)}>
                {btn.label}
              </button>
            </div>
          ))}
        </div>
        <div className="sidebar-row label-btn-row signout">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            style={{
              color: "#c62828",
              fontWeight: 700,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              marginLeft: 4,
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;