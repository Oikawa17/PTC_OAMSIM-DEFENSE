import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TabBar from '../components/TabBar'; 
import './documentsUpload.css';

// const applicationId = localStorage.getItem('application_id');

// if (!applicationId) {
//     alert("Error: No application ID found. Please log in again.");
//     window.location.href = "/login";
// }

const categories = [
    { key: "form_137", label: "Form 137 (Transcript of Records)", desc: "Upload a clear scanned copy of your Transcript of Records." },
    { key: "form_138", label: "Form 138 (Report Card)", desc: "Upload a clear scanned copy of your Report Card." },
    { key: "birth_certificate", label: "Birth Certificate", desc: "Upload a clear scanned copy of your Birth Certificate." },
    { key: "good_moral", label: "Good Moral Certificate", desc: "Upload a certificate issued by your previous school." },
    { key: "med_certificate", label: "Medical Certificate", desc: "Upload your latest medical certificate." },
    { key: "id_photos", label: "2x2 ID Photos", desc: "Upload a recent 2x2 ID picture with white background." },
    { key: "recommendation_letter", label: "Recommendation Letter", desc: "Upload a recommendation letter if required." }
];

const statusIcons = {
    "not-uploaded": { icon: "✖", text: "Not Uploaded", className: "not-uploaded" },
    "pending": { icon: "⚠️", text: "Pending Verification", className: "pending" },
    "uploaded": { icon: "✔️", text: "Uploaded", className: "uploaded" },
    "verified": { icon: "✔️", text: "Verified", className: "verified" }
};

const DocumentUpload = () => {
    // const applicationId = localStorage.getItem('application_id'); // <-- Only needed in this process / Place here
    const [files, setFiles] = useState({});
    const [messages, setMessages] = useState({});
    const [statuses, setStatuses] = useState({});
    const [profile, setProfile] = useState(null);
      useEffect(() => {
    const fetchProfile = async () => {
        try {
            const applicationId = localStorage.getItem('application_id');
            if (!applicationId) return;
            const res = await fetch(`http://localhost:5000/profile/${applicationId}`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (err) {
            setProfile(null);
        }
    };
    fetchProfile();
}, []);

    // Fetch initial upload status from backend
    useEffect(() => {
        const applicationId = localStorage.getItem('application_id');
        const fetchStatuses = async () => {
            try {
                const res = await fetch(`http://localhost:5000/document-upload/status/${applicationId}`);
                const data = await res.json();
                // data should be an object like { form_137: "Submitted" or "Verified", ... }
                const newStatuses = {};
                categories.forEach(({ key }) => {
                    if (data[key] && data[key].toLowerCase() === "verified") {
                        newStatuses[key] = "verified";
                    } else if (data[key] && data[key].toLowerCase() === "submitted") {
                        newStatuses[key] = "uploaded";
                    } else {
                        newStatuses[key] = "not-uploaded";
                    }
                });
                setStatuses(newStatuses);
            } catch (err) {
                // fallback: all not uploaded
                const fallback = {};
                categories.forEach(({ key }) => fallback[key] = "not-uploaded");
                setStatuses(fallback);
            }
        };
        fetchStatuses();
    }, []);

    const handleFileChange = (e, category) => {
        setFiles(prevFiles => ({
            ...prevFiles,
            [category]: e.target.files[0]
        }));
    };

    const handleUpload = async (category) => {
        const applicationId = localStorage.getItem('application_id');
        if (!files[category]) {
            setMessages(prev => ({ ...prev, [category]: 'Please select a file' }));
            return;
        }

        const formData = new FormData();
        formData.append('file', files[category]);
        formData.append('application_id', applicationId);

        try {
            const response = await fetch(`http://localhost:5000/document-upload/upload/${category}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setMessages(prev => ({ ...prev, [category]: data.message }));
            setStatuses(prev => ({ ...prev, [category]: "uploaded" }));
        } catch (error) {
            setMessages(prev => ({ ...prev, [category]: 'Error uploading file' }));
        }
    };

    return (
       <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Only render TabBar when profile is loaded to ensure avatar and name show up immediately */}
            <TabBar profile={profile} />
            <Sidebar />
            <div className="documents-upload-container">
                <div className="documents-upload-title">Documents Upload</div>
                <div className="documents-upload-list">
                    {categories.map(({ key, label, desc }) => {
                        const status = statuses[key] || "not-uploaded";
                        const isUploaded = status === "uploaded" || status === "verified";
                        return (
                            <div className="documents-upload-item" key={key}>
                                <div className="documents-upload-row">
                                    <div className="documents-upload-label">
                                        <span className="icon">📄</span>
                                        {label}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span className={`documents-upload-status ${statusIcons[status].className}`}>
                                            <span className="icon">{statusIcons[status].icon}</span>
                                            {statusIcons[status].text}
                                        </span>
                                        <span className="documents-upload-required">Required</span>
                                    </div>
                                </div>
                                <div className="documents-upload-desc">{desc}</div>
                                <div className="documents-upload-file-row">
                                    <label className="documents-upload-file-btn" style={isUploaded ? { opacity: 0.6, cursor: "not-allowed" } : {}}>
                                        <input
                                            type="file"
                                            style={{ display: "none" }}
                                            onChange={(e) => handleFileChange(e, key)}
                                            disabled={isUploaded}
                                        />
                                        {files[key] ? "Replace File" : "Select File"}
                                    </label>
                                    <button
                                        className={
                                            files[key]
                                                ? "documents-upload-update-btn"
                                                : "documents-upload-upload-btn"
                                        }
                                        type="button"
                                        onClick={() => handleUpload(key)}
                                        disabled={isUploaded}
                                        style={isUploaded ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                                    >
                                        {status === "verified"
                                            ? "Verified"
                                            : isUploaded
                                            ? "Uploaded"
                                            : (files[key] ? "Update" : "Upload")}
                                    </button>
                                </div>
                                <p style={{
                                    margin: "6px 0 0 0",
                                    color: status === "verified" ? "#22b455" : isUploaded ? "#22b455" : "#e53935",
                                    fontWeight: 500,
                                    fontSize: "0.98rem"
                                }}>
                                    {status === "verified"
                                        ? "File has been verified."
                                        : isUploaded
                                        ? "File already uploaded."
                                        : messages[key]}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;