import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TabBar from "../components/TabBar";
import "./applicationForm.css";

const steps = [
  { label: "Personal Information" },
  { label: "Academic Information" },
  { label: "Program Choices" },
  { label: "Review & Submit" },
];

const programOptions = [
  { value: "BSIT", label: "BS Information Technology" },
  { value: "BSOA", label: "BS Office Administration" },
  { value: "CCS", label: "Certificate in Computer Sciences" },
  { value: "COA", label: "Certificate in Office Administration" },
  { value: "ABA", label: "Associate in Business Administration" },
  { value: "AAIS", label: "Associate in Accounting Information System" },
  { value: "AHRD", label: "Associate in Human Resource Development" },
  { value: "AHRT", label: "Associate in Hotel and Restaurant Technology" },
];

// Helper: required fields for each step
const requiredFields = [
  [
    "firstName", "lastName", "email", "phone", "birthdate", "gender", "civilStatus",
    "address", "city", "province", "zip"
  ],
  [
    "lastSchoolAttended", "schoolAddress", "yearGraduated", "trackStrand", "generalAverage"
  ],
  [
    "firstChoice", "secondChoice", "emergencyContactName", "emergencyContactRelationship", "emergencyContactNumber"
  ]
];

function ApplicationForm() {
  const [applicationId, setApplicationId] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lockedInfo, setLockedInfo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "",
    civilStatus: "",
    address: "",
    city: "",
    province: "",
    zip: "",
    lastSchoolAttended: "",
    schoolAddress: "",
    yearGraduated: "",
    trackStrand: "",
    generalAverage: "",
    firstChoice: "",
    secondChoice: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactNumber: "",
  });
  const [profile, setProfile] = useState(null);

  // Fetch lock status and info on mount
  useEffect(() => {
    const storedApplicationId = localStorage.getItem('application_id');
    if (!storedApplicationId) {
      alert('Application ID is missing. Please log in again.');
      window.location.href = "/login";
      return;
    }
    setApplicationId(storedApplicationId);

    fetch(`http://localhost:5000/application-form/application-status/${storedApplicationId}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setIsLocked(data.locked === true);
        if (data.locked === true) {
          setStep(3);
          fetch(`http://localhost:5000/application-form/info/${storedApplicationId}`)
            .then(res => res.json())
            .then(infoData => setLockedInfo(infoData))
            .catch(() => setLockedInfo(null));
        }
      })
      .catch(() => {
        setLoading(false);
        setIsLocked(false);
      });

    // Fetch profile for TabBar
    fetch(`http://localhost:5000/profile/${storedApplicationId}`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  // Populate formData with lockedInfo for editing
  const handleEditLocked = () => {
    if (lockedInfo) {
      setFormData({
        firstName: lockedInfo.first_name || '',
        middleName: lockedInfo.middle_name || '',
        lastName: lockedInfo.last_name || '',
        email: lockedInfo.email || '',
        phone: lockedInfo.phone || '',
        address: lockedInfo.address || '',
        city: lockedInfo.city || '',
        province: lockedInfo.province || '',
        zip: lockedInfo.zip || '',
        birthdate: lockedInfo.birthdate ? lockedInfo.birthdate.slice(0, 10) : '',
        gender: lockedInfo.gender || '',
        civilStatus: lockedInfo.civil_status || '',
        lastSchoolAttended: lockedInfo.last_school_attended || '',
        schoolAddress: lockedInfo.school_address || '',
        yearGraduated: lockedInfo.year_graduated || '',
        trackStrand: lockedInfo.track_strand || '',
        generalAverage: lockedInfo.general_average || '',
        firstChoice: lockedInfo.first_choice || '',
        secondChoice: lockedInfo.second_choice || '',
        emergencyContactName: lockedInfo.emergency_contact_name || '',
        emergencyContactRelationship: lockedInfo.emergency_contact_relationship || '',
        emergencyContactNumber: lockedInfo.emergency_contact_number || ''
      });
      setEditMode(true);
      setIsLocked(false);
      setStep(0);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  // Validation for required fields in current step
  const validateStep = () => {
    const fields = requiredFields[step] || [];
    const newErrors = {};
    fields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all required fields before final submit
    let allValid = true;
    let allErrors = {};
    requiredFields.forEach((fields, idx) => {
      fields.forEach((field) => {
        if (!formData[field] || formData[field].toString().trim() === "") {
          allValid = false;
          allErrors[field] = "This field is required";
        }
      });
    });
    setErrors(allErrors);
    if (!allValid) {
      setStep(requiredFields.findIndex(fields => fields.some(f => allErrors[f])));
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/application-form/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, application_id: applicationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Submission failed. Please try again.');
        return;
      }

      alert(data.message || 'Application updated successfully!');
      setIsLocked(true);
      setEditMode(false);
      setStep(3);
      // Optionally, refresh lockedInfo
      fetch(`http://localhost:5000/application-form/info/${applicationId}`)
        .then(res => res.json())
        .then(infoData => setLockedInfo(infoData))
        .catch(() => setLockedInfo(null));
    } catch (error) {
      alert('Submission failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // LOCKED: Only review page, with edit option
  if (isLocked && !editMode) {
    return (
      <div>
        <TabBar profile={profile} />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div className="application-form-container" style={{ background: "#fafcfb", flex: 1, marginTop: 100 }}>
            <div className="application-form-title">Application Form</div>
            <div className="application-form-section" style={{ marginBottom: 0 }}>
              <div className="application-form-section-title" style={{ color: "#228c22", fontSize: "1.45rem", marginBottom: 2 }}>
                Application Submitted
              </div>
              <div className="application-form-section-desc" style={{ color: "#228c22", fontWeight: 500, marginBottom: 18 }}>
                You have already submitted your application. You may review your details below.
              </div>
              <div style={{
                background: "#eafbee",
                border: "1.5px solid #b7eac7",
                color: "#228c22",
                borderRadius: 10,
                padding: "14px 20px",
                marginBottom: 32,
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontWeight: 500,
                fontSize: "1.08rem"
              }}>
                <span style={{ fontSize: 22, marginRight: 8 }}>🔒</span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: "1.08rem" }}>Your application is locked</span>
                  <span style={{ color: "#228c22", fontWeight: 400, fontSize: "1rem", display: "block" }}>
                    If you need to make changes, click <b>Edit &amp; Resubmit</b>.
                  </span>
                </div>
              </div>
              {/* Highlighted Personal Info */}
              <div className="application-form-section-highlight" style={{ marginBottom: 18 }}>
                <div className="application-form-section-title" style={{ color: "#1a7c2c", fontSize: "1.18rem", marginBottom: 12 }}>
                  Personal Information
                </div>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0 32px",
                  marginBottom: 0
                }}>
                  <div style={{ flex: "1 1 320px", minWidth: 260, marginBottom: 8 }}>
                    <div><span style={{ fontWeight: 700 }}>Full Name:</span> <span style={{ color: "#222" }}>{`${lockedInfo?.first_name || ""} ${lockedInfo?.middle_name || ""} ${lockedInfo?.last_name || ""}`.replace(/\s+/g, " ").trim()}</span></div>
                    <div><span style={{ fontWeight: 700 }}>Phone Number:</span> <span style={{ color: "#222" }}>{lockedInfo?.phone}</span></div>
                    <div><span style={{ fontWeight: 700 }}>Gender:</span> <span style={{ color: "#222" }}>{lockedInfo?.gender}</span></div>
                    <div>
                      <span style={{ fontWeight: 700 }}>Complete Address:</span>{" "}
                      <span style={{ color: "#222" }}>
                        {[
                          lockedInfo?.address,
                          lockedInfo?.city,
                          lockedInfo?.province,
                          lockedInfo?.zip
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                  <div style={{ flex: "1 1 320px", minWidth: 260, marginBottom: 8 }}>
                    <div><span style={{ fontWeight: 700 }}>Email:</span> <span style={{ color: "#222" }}>{lockedInfo?.email}</span></div>
                    <div><span style={{ fontWeight: 700 }}>Birthdate:</span> <span style={{ color: "#222" }}>{lockedInfo?.birthdate ? lockedInfo.birthdate.slice(0, 10) : ""}</span></div>
                    <div><span style={{ fontWeight: 700 }}>Civil Status:</span> <span style={{ color: "#222" }}>{lockedInfo?.civil_status}</span></div>
                  </div>
                </div>
              </div>
              {/* Highlighted Academic Info */}
              <div className="application-form-section-highlight" style={{ marginBottom: 18 }}>
                <div className="application-form-section-title" style={{ color: "#1a7c2c", fontSize: "1.18rem", marginBottom: 12 }}>
                  Academic Information
                </div>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0 32px"
                }}>
                  <div style={{ flex: "1 1 320px", minWidth: 260, marginBottom: 8 }}>
                    <div><span style={{ fontWeight: 700 }}>Last School Attended:</span> <span style={{ color: "#222" }}>{lockedInfo?.last_school_attended}</span></div>
                    <div><span style={{ fontWeight: 700 }}>School Address:</span> <span style={{ color: "#222" }}>{lockedInfo?.school_address}</span></div>
                    <div><span style={{ fontWeight: 700 }}>Year Graduated:</span> <span style={{ color: "#222" }}>{lockedInfo?.year_graduated}</span></div>
                  </div>
                  <div style={{ flex: "1 1 320px", minWidth: 260, marginBottom: 8 }}>
                    <div><span style={{ fontWeight: 700 }}>Track/Strand:</span> <span style={{ color: "#222" }}>{lockedInfo?.track_strand}</span></div>
                    <div><span style={{ fontWeight: 700 }}>General Average:</span> <span style={{ color: "#222" }}>{lockedInfo?.general_average}</span></div>
                  </div>
                </div>
              </div>
              {/* Highlighted Program Choices */}
              <div className="application-form-section-highlight" style={{ marginBottom: 18 }}>
                <div className="application-form-section-title" style={{ color: "#1a7c2c", fontSize: "1.18rem", marginBottom: 12 }}>
                  Program Choices
                </div>
                <div>
                  <div><span style={{ fontWeight: 700 }}>First Choice:</span> <span style={{ color: "#222" }}>{lockedInfo?.first_choice}</span></div>
                  <div><span style={{ fontWeight: 700 }}>Second Choice:</span> <span style={{ color: "#222" }}>{lockedInfo?.second_choice}</span></div>
                </div>
              </div>
              {/* Highlighted Emergency Contact */}
              <div className="application-form-section-highlight" style={{ marginBottom: 18 }}>
                <div className="application-form-section-title" style={{ color: "#1a7c2c", fontSize: "1.18rem", marginBottom: 12 }}>
                  Emergency Contact
                </div>
                <div>
                  <div><span style={{ fontWeight: 700 }}>Name:</span> <span style={{ color: "#222" }}>{lockedInfo?.emergency_contact_name}</span></div>
                  <div><span style={{ fontWeight: 700 }}>Relationship:</span> <span style={{ color: "#222" }}>{lockedInfo?.emergency_contact_relationship}</span></div>
                  <div><span style={{ fontWeight: 700 }}>Contact Number:</span> <span style={{ color: "#222" }}>{lockedInfo?.emergency_contact_number}</span></div>
                </div>
              </div>
              <button
                className="application-form-button"
                style={{
                  width: 220,
                  marginTop: 18,
                  background: "linear-gradient(135deg, #22b455 60%, #1a7c2c 100%)",
                  fontSize: "1.13rem",
                  boxShadow: "0 2px 12px rgba(44, 120, 29, 0.10)"
                }}
                onClick={handleEditLocked}
                type="button"
              >
                Edit &amp; Resubmit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Form (edit or new)
  return (
    <div>
      <TabBar profile={profile} />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div className="application-form-container" style={{ flex: 1 }}>
          <div className="application-form-title">Application Form</div>

          {/* Status Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "24px 0 32px 0",
              justifyContent: "center",
              gap: 0,
            }}
          >
            {steps.map((s, idx) => (
              <React.Fragment key={s.label}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 120,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background:
                        idx === step
                          ? "linear-gradient(135deg, #40db61 60%, #2c781d 100%)"
                          : idx < step
                          ? "#40db61"
                          : "#e0e0e0",
                      color: idx <= step ? "#fff" : "#888",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      marginBottom: 6,
                      border:
                        idx === step
                          ? "2.5px solid #2c781d"
                          : "2.5px solid #e0e0e0",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div
                    style={{
                      fontSize: "0.98rem",
                      color: idx === step ? "#2c781d" : "#888",
                      fontWeight: idx === step ? 700 : 500,
                      textAlign: "center",
                      minWidth: 90,
                      maxWidth: 120,
                      lineHeight: 1.2,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      height: 3,
                      width: 90,
                      background: idx < step ? "#40db61" : "#e0e0e0",
                      margin: "0 8px",
                      borderRadius: 2,
                      alignSelf: "center",
                      position: "relative",
                      top: "-18px",
                      zIndex: 1,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Step 1: Personal Information */}
            {step === 0 && (
              <div className="application-form-section">
                <div className="application-form-section-title">Personal Information</div>
                <div className="application-form-section-desc">
                  Please fill out all required information accurately
                </div>
                <div className="application-form-grid">
                  <label className="application-form-label">
                    <span>First Name <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    {errors.firstName && <span className="application-form-required">{errors.firstName}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Middle Name</span>
                    <input className="application-form-input" type="text" name="middleName" value={formData.middleName} onChange={handleChange} />
                  </label>
                  <label className="application-form-label">
                    <span>Last Name <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    {errors.lastName && <span className="application-form-required">{errors.lastName}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Email Address <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="email" name="email" value={formData.email} onChange={handleChange} required />
                    {errors.email && <span className="application-form-required">{errors.email}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Phone Number <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                    {errors.phone && <span className="application-form-required">{errors.phone}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Birthdate <span className="application-form-required">*</span></span>
                    <input
                      className="application-form-input"
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    />
                    {errors.birthdate && <span className="application-form-required">{errors.birthdate}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Gender <span className="application-form-required">*</span></span>
                    <select className="application-form-select" name="gender" value={formData.gender} onChange={handleChange} required>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {errors.gender && <span className="application-form-required">{errors.gender}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Civil Status <span className="application-form-required">*</span></span>
                    <select className="application-form-select" name="civilStatus" value={formData.civilStatus} onChange={handleChange} required>
                      <option value="">Select status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                    {errors.civilStatus && <span className="application-form-required">{errors.civilStatus}</span>}
                  </label>
                  <label className="application-form-label full-width">
                    <span>Complete Address <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="text" name="address" value={formData.address} onChange={handleChange} required />
                    {errors.address && <span className="application-form-required">{errors.address}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>City/Municipality <span className="application-form-required">*</span></span>
                    <select
                      className="application-form-select"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select City/Municipality</option>
                      <option value="Pateros">Pateros</option>
                      <option value="Taguig">Taguig City</option>
                      <option value="Makati">Makati City</option>
                      <option value="Pasig">Pasig City</option>
                      <option value="Caloocan">Caloocan City</option>
                      <option value="Las Piñas">Las Piñas City</option>
                      <option value="Malabon">Malabon City</option>
                      <option value="Mandaluyong">Mandaluyong City</option>
                      <option value="Marikina">Marikina City</option>
                      <option value="Parañaque">Parañaque City</option>
                      <option value="Pasay">Pasay City</option>
                      <option value="Quezon">Quezon City</option>
                    </select>
                    {errors.city && <span className="application-form-required">{errors.city}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Province <span className="application-form-required">*</span></span>
                    <input
                      className="application-form-input"
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                    />
                    {errors.province && <span className="application-form-required">{errors.province}</span>}
                  </label>
                  <label className="application-form-label full-width">
                    <span>Zip Code <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="text" name="zip" value={formData.zip} onChange={handleChange} required />
                    {errors.zip && <span className="application-form-required">{errors.zip}</span>}
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Academic Information */}
            {step === 1 && (
              <div className="application-form-section">
                <div className="application-form-section-title">Academic Information</div>
                <div className="application-form-section-desc">
                  Please provide your academic background.
                </div>
                <div className="application-form-grid">
                  <label className="application-form-label">
                    <span>Last School Attended <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="text" name="lastSchoolAttended" value={formData.lastSchoolAttended} onChange={handleChange} required />
                    {errors.lastSchoolAttended && <span className="application-form-required">{errors.lastSchoolAttended}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>School Address <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="text" name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} required />
                    {errors.schoolAddress && <span className="application-form-required">{errors.schoolAddress}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Year Graduated <span className="application-form-required">*</span></span>
                    <select className="application-form-select" name="yearGraduated" value={formData.yearGraduated} onChange={handleChange} required>
                      <option value="">Select year</option>
                      {Array.from({ length: 76 }, (_, i) => 1950 + i).map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {errors.yearGraduated && <span className="application-form-required">{errors.yearGraduated}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Track/Strand <span className="application-form-required">*</span></span>
                    <select className="application-form-select" name="trackStrand" value={formData.trackStrand} onChange={handleChange} required>
                      <option value="">Select track/strand</option>
                      <option value="STEM">STEM</option>
                      <option value="HUMSS">HUMSS</option>
                      <option value="ABM">ABM</option>
                      <option value="GAS">GAS</option>
                      <option value="TVL">TVL</option>
                    </select>
                    {errors.trackStrand && <span className="application-form-required">{errors.trackStrand}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>General Average <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="text" name="generalAverage" value={formData.generalAverage} onChange={handleChange} required />
                    {errors.generalAverage && <span className="application-form-required">{errors.generalAverage}</span>}
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Program Choices */}
            {step === 2 && (
              <div className="application-form-section">
                <div className="application-form-section-title">Program Choices & Emergency Contact</div>
                <div className="application-form-section-desc">
                  Select your preferred programs and provide emergency contact details.
                </div>
                <div className="application-form-grid">
                  <label className="application-form-label">
                    <span>First Choice <span className="application-form-required">*</span></span>
                    <select
                      className="application-form-select"
                      name="firstChoice"
                      value={formData.firstChoice}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select program</option>
                      {programOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.firstChoice && <span className="application-form-required">{errors.firstChoice}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Second Choice <span className="application-form-required">*</span></span>
                    <select
                      className="application-form-select"
                      name="secondChoice"
                      value={formData.secondChoice}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select program</option>
                      {programOptions
                        .filter((option) => option.value !== formData.firstChoice)
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                    {errors.secondChoice && <span className="application-form-required">{errors.secondChoice}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Emergency Contact Name <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} required />
                    {errors.emergencyContactName && <span className="application-form-required">{errors.emergencyContactName}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Relationship to Emergency Contact <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} required />
                    {errors.emergencyContactRelationship && <span className="application-form-required">{errors.emergencyContactRelationship}</span>}
                  </label>
                  <label className="application-form-label">
                    <span>Emergency Contact Number <span className="application-form-required">*</span></span>
                    <input className="application-form-input" type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} required />
                    {errors.emergencyContactNumber && <span className="application-form-required">{errors.emergencyContactNumber}</span>}
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 3 && (
              <div>
                {/* Highlighted Personal Info */}
                <div className="application-form-section-highlight">
                  <div className="application-form-section-title">Personal Information</div>
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0 32px",
                    marginBottom: 8
                  }}>
                    <div style={{ flex: "1 1 320px", minWidth: 260 }}>
                      <div><b>Full Name:</b> {`${formData.firstName} ${formData.middleName}. ${formData.lastName}`.replace(/\s+/g, " ").trim()}</div>
                      <div><b>Phone Number:</b> {formData.phone}</div>
                      <div><b>Gender:</b> {formData.gender}</div>
                      <div>
                        <b>Complete Address:</b>{" "}
                        {[
                          formData.address,
                          formData.city,
                          formData.province,
                          formData.zip
                        ].filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <div style={{ flex: "1 1 320px", minWidth: 260 }}>
                      <div><b>Email:</b> {formData.email}</div>
                      <div><b>Birthdate:</b> {formData.birthdate}</div>
                      <div><b>Civil Status:</b> {formData.civilStatus}</div>
                    </div>
                  </div>
                </div>
                {/* Highlighted Academic Info */}
                <div className="application-form-section-highlight">
                  <div className="application-form-section-title">Academic Information</div>
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0 32px"
                  }}>
                    <div style={{ flex: "1 1 320px", minWidth: 260 }}>
                      <div><b>Last School Attended:</b> {formData.lastSchoolAttended}</div>
                      <div><b>School Address:</b> {formData.schoolAddress}</div>
                      <div><b>Year Graduated:</b> {formData.yearGraduated}</div>
                    </div>
                    <div style={{ flex: "1 1 320px", minWidth: 260 }}>
                      <div><b>Track/Strand:</b> {formData.trackStrand}</div>
                      <div><b>General Average:</b> {formData.generalAverage}</div>
                    </div>
                  </div>
                </div>
                {/* Highlighted Program Choices */}
                <div className="application-form-section-highlight">
                  <div className="application-form-section-title">Program Choices</div>
                  <div>
                    <div><b>First Choice:</b> {formData.firstChoice}</div>
                    <div><b>Second Choice:</b> {formData.secondChoice}</div>
                  </div>
                </div>
                {/* Highlighted Emergency Contact */}
                <div className="application-form-section-highlight">
                  <div className="application-form-section-title">Emergency Contact</div>
                  <div>
                    <div><b>Name:</b> {formData.emergencyContactName}</div>
                    <div><b>Relationship:</b> {formData.emergencyContactRelationship}</div>
                    <div><b>Contact Number:</b> {formData.emergencyContactNumber}</div>
                  </div>
                </div>
                <div style={{
                  background: "#e8f8ee",
                  border: "1.5px solid #b7eac7",
                  color: "#228c22",
                  borderRadius: 8,
                  padding: "16px 20px",
                  marginBottom: 28,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontWeight: 500,
                  fontSize: "1.08rem"
                }}>
                  <span style={{ fontSize: 22, marginRight: 8 }}>✔️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.08rem" }}>Application Ready for Submission</div>
                    <div style={{ color: "#228c22", fontWeight: 400, fontSize: "1rem" }}>
                      Please review all your information below before submitting your application.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                marginTop: 32,
                width: "100%",
                maxWidth: 900,
                gap: 270,
              }}
            >
              {step > 0 ? (
                <button
                  type="button"
                  style={{
                    width: 140,
                    background: "#fff",
                    color: "#228c22",
                    fontWeight: 700,
                    border: "2px solid #228c22",
                    borderRadius: 8,
                    padding: "10px 0",
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onClick={prevStep}
                >
                  <span style={{ fontSize: 18, marginRight: 4 }}>←</span>
                  Previous
                </button>
              ) : (
                <div style={{ width: 140 }} />
              )}

              {/* Invisible spacer div between buttons */}
              <div style={{ width: 80, color: "#fff" }} />

              {step < steps.length - 1 && (
                <button
                  type="button"
                  style={{
                    width: 140,
                    background: "linear-gradient(135deg, #40db61 60%, #2c781d 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 0",
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 2px 8px rgba(44, 120, 29, 0.08)",
                    transition: "background 0.2s, color 0.2s",
                    marginLeft: step > 0 ? 18 : 0,
                  }}
                  onClick={nextStep}
                >
                  Next
                  <span style={{ fontSize: 18, marginLeft: 4 }}>→</span>
                </button>
              )}
              {step === steps.length - 1 && (
                <button
                  type="submit"
                  style={{
                    width: 180,
                    background: "linear-gradient(135deg, #40db61 60%, #2c781d 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 0",
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 2px 8px rgba(44, 120, 29, 0.08)",
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  Submit
                  <span style={{ fontSize: 18, marginLeft: 4 }}>→</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplicationForm;