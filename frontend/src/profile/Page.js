import React, { useEffect, useState, useRef } from "react";
import Tabbar from "../components/TabBar";
import Sidebar from "../components/Sidebar";
import "./profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMsg, setPasswordMsg] = useState("");
  const fileInputRef = useRef();

  // Sidebar collapse/expand state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const applicationId = localStorage.getItem("application_id");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/profile/${applicationId}`);
        if (!res.ok) throw new Error("Profile not found");
        const data = await res.json();
        setProfile(data);
        setProfilePic(data.profile_pic);

        if (data.first_name && data.last_name) {
          document.title = `${data.first_name} ${data.last_name}`;
        } else if (data.full_name) {
          document.title = data.full_name;
        } else {
          document.title = "Profile";
        }
      } catch (err) {
        setError("Failed to load profile.");
        document.title = "Profile";
      }
    };
    fetchProfile();
  }, [applicationId]);

  const handlePictureClick = () => {
    setEditMode(true);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfilePicChange = async e => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("profilePic", file);
      try {
        const picRes = await fetch(`http://localhost:5000/profile/${applicationId}/picture`, {
          method: "PUT",
          body: formData,
        });
        if (!picRes.ok) throw new Error("Failed to update profile picture.");
        const picData = await picRes.json();
        setProfilePic(picData.profile_pic);
        setEditMode(false);
      } catch (err) {
        setError("Failed to update profile picture.");
      }
    }
  };

  const handlePasswordField = e => {
    const { name, value } = e.target;
    setPasswordFields(f => ({ ...f, [name]: value }));
  };
  const handlePasswordSave = async e => {
    e.preventDefault();
    setPasswordMsg("");
    if (!passwordFields.oldPassword || !passwordFields.newPassword || !passwordFields.confirmPassword) {
      setPasswordMsg("All fields are required.");
      return;
    }
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordMsg("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/profile/${applicationId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordFields.oldPassword,
          newPassword: passwordFields.newPassword,
          confirmPassword: passwordFields.confirmPassword
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password.");
      setPasswordMsg("Password updated successfully.");
      setPasswordFields({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setShowPasswordModal(false), 1200);
    } catch (err) {
      setPasswordMsg(err.message);
    }
  };

  if (!profile) return <div>Loading...</div>;

  const initials = (profile.first_name?.[0] ?? "") + (profile.last_name?.[0] ?? "");

  const handleEditProfile = () => {
    window.location.href = "/application-form";
  };

  // Sidebar margin
  const mainContentMarginLeft = isSidebarCollapsed ? 68 : 250;

  // --- Get Complete Address in the same format as the application form ---
  const getCompleteAddress = () => {
    // Show all address parts, including city/municipality and province, and zip
    // Handles both string and object values
    const address = profile.address || "";
    const city = profile.city || profile.city_municipality || "";
    const province = profile.province || "";
    const zip = profile.zip || "";
  
    return [address, city, province, zip].filter(Boolean).join(", ");
  };

  // --- Application Form fields mapping ---
  const getFullName = () => {
    // If middle name exists, show as initial with dot
    if (profile.first_name && profile.last_name) {
      const middle = profile.middle_name
        ? ` ${profile.middle_name[0]}.`
        : "";
      return `${profile.first_name}${middle} ${profile.last_name}`.replace(/\s+/g, " ").trim();
    }
    return profile.full_name || "";
  };

  return (
       <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Tabbar
        profile={{ ...profile, profile_pic: profilePic || profile.profile_pic }}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
      />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className="profile-page">
        <div
          style={{
            display: "flex",
            padding: 0,
            background: "linear-gradient(135deg, #95d891 0%, #137a1c 100%)",
            minHeight: "100vh",
            fontFamily: "Inter, Arial, sans-serif",
            marginTop: 56,
            marginLeft: mainContentMarginLeft,
            transition: "margin-left 0.3s ease-in-out"
          }}
        >
          {/* Profile Card and Security */}
          <div
            style={{
              width: 350,
              background: "#fff",
              borderRight: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "48px 24px 24px 24px",
            }}
          >
            <div
              onClick={handlePictureClick}
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "#e0f7e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                color: "#27d60a",
                marginBottom: 24,
                overflow: "hidden",
                cursor: "pointer",
                border: "6px solid #e5fbe7",
                boxShadow: "0 2px 8px #0001",
                position: "relative"
              }}
            >
              {profilePic ? (
                <img
                  src={
                    profilePic?.startsWith("data:")
                      ? profilePic
                      : `http://localhost:5000${profilePic}`
                  }
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span>{initials.toUpperCase()}</span>
              )}
              {editMode && (
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleProfilePicChange}
                  style={{ display: "none" }}
                />
              )}
              {editMode && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    background: "rgba(39,214,10,0.85)",
                    color: "#fff",
                    fontSize: 14,
                    textAlign: "center",
                    padding: "4px 0"
                  }}
                >
                  Change Photo
                </div>
              )}
            </div>
            {/* Full Name */}
            <h2
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 22,
                color: "#222"
              }}
            >
              {getFullName()}
            </h2>
            {/* Application ID below the name */}
            <div
              style={{
                color: "#888",
                fontSize: 14,
                marginBottom: 24,
                marginTop: 2,
                fontWeight: 500,
                letterSpacing: 0.5
              }}
            >
              {profile.application_id && <>Application ID: {profile.application_id}</>}
            </div>
            {/* Account Security Card */}
            <div
              style={{
                width: "100%",
                marginTop: 24,
                background: "#f9fafb",
                borderRadius: 12,
                boxShadow: "0 1px 4px #0001",
                padding: 0
              }}
            >
              <div
                style={{
                  padding: "20px 24px 12px 24px",
                  borderBottom: "1px solid #f1f1f1"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>
                  Account Security
                </div>
                <div style={{ color: "#888", fontSize: 14, marginTop: 2 }}>
                  Manage your account security settings
                </div>
              </div>
              {/* Password */}
              <div
                style={{
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #f1f1f1"
                }}
              >
                <span
                  style={{
                    background: "#e3edfd",
                    color: "#3b82f6",
                    borderRadius: "50%",
                    width: 38,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    marginRight: 16
                  }}
                >
                  <i className="fa fa-lock" style={{ fontStyle: "normal" }}>
                    🔒
                  </i>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>Password</div>
                  <div style={{ color: "#888", fontSize: 14 }}>
                    Keep your account secure
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  style={{
                    background: "none",
                    color: "#2563eb",
                    border: "none",
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer"
                  }}
                >
                  Change
                </button>
              </div>
              {/* Email Verification */}
              <div
                style={{
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #f1f1f1",
                  opacity: 1,
                  cursor: "default"
                }}
              >
                <span
                  style={{
                    background: "#e6f7ec",
                    color: "#22c55e",
                    borderRadius: "50%",
                    width: 38,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    marginRight: 16
                  }}
                >
                  <i className="fa fa-envelope" style={{ fontStyle: "normal" }}>
                    ✉️
                  </i>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    Email Verification
                  </div>
                  <div style={{ color: "#888", fontSize: 14 }}>
                    Your email address is verified
                  </div>
                </div>
                <span
                  style={{
                    background: "#e5e7eb",
                    color: "#888",
                    fontWeight: 600,
                    fontSize: 15,
                    borderRadius: 8,
                    padding: "4px 14px",
                    pointerEvents: "none"
                  }}
                >
                  Coming soon
                </span>
              </div>
              {/* Phone Verification */}
              <div
                style={{
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  opacity: 1,
                  cursor: "default"
                }}
              >
                <span
                  style={{
                    background: "#f3f4f6",
                    color: "#f59e42",
                    borderRadius: "50%",
                    width: 38,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    marginRight: 16
                  }}
                >
                  <i className="fa fa-phone" style={{ fontStyle: "normal" }}>
                    📞
                  </i>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    Phone Verification
                  </div>
                  <div style={{ color: "#888", fontSize: 14 }}>
                    Verify your phone number for added security
                  </div>
                </div>
                <span
                  style={{
                    background: "#e5e7eb",
                    color: "#888",
                    fontWeight: 600,
                    fontSize: 15,
                    borderRadius: 8,
                    padding: "4px 14px",
                    pointerEvents: "none"
                  }}
                >
                  Coming soon
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              background: "transparent",
              padding: "48px 0",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                width: 540,
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 16px #0001",
                padding: 40,
                display: "flex",
                flexDirection: "column"
              }}
            >
              <h2 style={{ margin: 0, color: "#555", fontWeight: 700, fontSize: 22 }}>
                Profile Information
              </h2>
              <div style={{ marginBottom: 28, color: "#555", fontSize: 15 }}>
                Manage your personal information
              </div>
              {/* Personal Information fields */}
              <div style={{ marginBottom: 0 }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  name="full_name"
                  value={getFullName()}
                  disabled
                  style={inputStyle(false)}
                />
              </div>
              <div style={{ margin: "18px 0 0 0" }}>
                <label style={labelStyle}>Phone Number</label>
                <input
                  name="phone"
                  value={profile.phone || ""}
                  disabled
                  style={inputStyle(false)}
                />
              </div>
              <div style={{ margin: "18px 0 0 0" }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  name="email"
                  value={profile.email || ""}
                  disabled
                  style={inputStyle(false)}
                />
              </div>
              <div style={{ margin: "18px 0 0 0" }}>
                <label style={labelStyle}>Birthdate</label>
                <input
                  name="birthdate"
                  type="date"
                  value={profile.birthdate ? profile.birthdate.slice(0, 10) : ""}
                  disabled
                  style={inputStyle(false)}
                />
              </div>
              <div style={{ margin: "18px 0 0 0" }}>
                <label style={labelStyle}>Complete Address</label>
                <input
                  name="address"
                  value={getCompleteAddress()}
                  disabled
                  style={inputStyle(false)}
                />
              </div>
              {/* Gender and Civil Status intentionally omitted */}
              <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
                <button
                  type="button"
                  onClick={handleEditProfile}
                  style={{
                    background: "#1db954",
                    color: "#fff",
                    padding: "12px 32px",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 1px 4px #0001",
                    width: "100%",
                    justifyContent: "center"
                  }}
                >
                  <span style={{ fontSize: 18, marginRight: 6 }}>✏️</span>
                  Edit Profile
                </button>
              </div>
              {error && <div style={{ color: "red", marginTop: 20 }}>{error}</div>}
            </div>
          </div>

          {/* Password Modal */}
          {showPasswordModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.18)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  boxShadow: "0 2px 16px #0002",
                  padding: 32,
                  width: 380,
                  maxWidth: "90vw"
                }}
              >
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>
                  Change Password
                </h3>
                <form onSubmit={handlePasswordSave} style={{ marginTop: 18 }}>
                  <div>
                    <input
                      type="password"
                      name="oldPassword"
                      placeholder="Current Password"
                      value={passwordFields.oldPassword}
                      onChange={handlePasswordField}
                      style={modalInputStyle}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={passwordFields.newPassword}
                      onChange={handlePasswordField}
                      style={modalInputStyle}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={passwordFields.confirmPassword}
                      onChange={handlePasswordField}
                      style={modalInputStyle}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                    <button
                      type="submit"
                      style={{
                        background: "#1db954",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: 16,
                        padding: "10px 24px",
                        cursor: "pointer"
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      style={{
                        background: "#fff",
                        color: "#222",
                        border: "1px solid #cfd8dc",
                        borderRadius: 8,
                        fontWeight: 500,
                        fontSize: 16,
                        padding: "10px 24px",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  {passwordMsg && (
                    <div
                      style={{
                        color: passwordMsg.includes("success")
                          ? "#1db954"
                          : "red",
                        marginTop: 14,
                        fontSize: 15
                      }}
                    >
                      {passwordMsg}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontWeight: 500,
  fontSize: 15,
  marginBottom: 4,
  color: "#222",
  display: "block"
};

function inputStyle(editMode) {
  return {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1.5px solid rgb(7, 165, 68)",
    background: editMode ? "#fff" : "#f2f2f2",
    marginTop: 4,
    fontSize: 16,
    marginBottom: 0,
    outline: "none",
    transition: "border 0.2s"
  };
}

const modalInputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 7,
  border: "1.5px solid rgb(19, 199, 109)",
  background: "#f8fafc",
  fontSize: 15,
  marginBottom: 12,
  outline: "none"
};

export default Profile;
// ...end of file...