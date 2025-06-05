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
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className={`messages-sidebar${collapsed ? ' collapsed' : ''}`}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      {!collapsed && (
        <div style={{ display: 'flex', alignItems: 'center', margin: '10px auto 30px auto', width: 'fit-content' }}>
          <img src="/logoptc.png" alt="PTC Logo" className="ptc-logo" />
          <span style={{ marginLeft: 12, fontWeight: 'bold', fontSize: 22, color: '#2c781d', letterSpacing: 1 }}>PTC OAMS</span>
        </div>
      )}

      {buttons.map((btn) => (
        <div className="sidebar-btn-row" key={btn.label}>
          <img
            src={btn.logo}
            alt={btn.label + " logo"}
            className="sidebar-btn-logo"
          />
          <button onClick={() => navigate(btn.path)}>
            {btn.label}
          </button>
        </div>
      ))}

      {/* Sign Out Button */}
      {!collapsed && (
        <div className="sidebar-btn-row" style={{ marginTop: 30 }}>
          <img
            src="/logout.png"
            alt="Sign Out logo"
            className="sidebar-btn-logo"
          />
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
      )}

      {collapsed && (
        <img className="sidebar-icon" src="/logoptc.png" alt="Menu" />
      )}
    </div>
  );
}

export default Sidebar;