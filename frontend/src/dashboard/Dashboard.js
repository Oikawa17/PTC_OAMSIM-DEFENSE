import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import TabBar from "../components/TabBar";
import bgImage from "./assets/bg.jpg";

const AnnouncementDetail = ({ title, detail, date, onBack }) => {
  // Use useEffect to scroll to the top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the window
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="announcement-detail-page">
      <button className="back-button" onClick={onBack}>
        &larr; Back to Dashboard
      </button>
      <h1 className="announcement-page-title">{title}</h1>
      <p className="announcement-page-date">{date}</p>
      <p className="announcement-page-content">{detail}</p>
    </div>
  );
};

const headerImages = [
  "https://www.paterostechnologicalcollege.edu.ph/ASSETS/IMAGES/HOME/banner-ptc.png",
  "https://www.paterostechnologicalcollege.edu.ph/ASSETS/IMAGES/COLLEGEPRESIDENT/arts.png",
  "https://www.paterostechnologicalcollege.edu.ph/ASSETS/IMAGES/COLLEGEPRESIDENT/csjs.png",
  "https://www.paterostechnologicalcollege.edu.ph/ASSETS/IMAGES/HOME/banner_do_something.png",
  "https://www.paterostechnologicalcollege.edu.ph/ASSETS/IMAGES/ADMINISTRATION/pppmo-banner.png",
  "https://www.paterostechnologicalcollege.edu.ph/ASSETS/IMAGES/ACADEMICAFFAIRS/IBOA2.png",
  "https://scontent.fmnl3-3.fna.fbcdn.net/v/t1.15752-9/495265190_674529518814894_3453652155819065307_n.png?_nc_cat=111&ccb=1-7&_nc_sid=9f807c&_nc_ohc=jXr30CaQ0aAQ7kNvwFUIzVR&_nc_oc=AdnR_wGYfMxhYi0G2O3Mw89LbFMCEwqyTcizcfpf37RsKvfX3RGeYJRoxC4brBj9JdA&_nc_zt=23&_nc_ht=scontent.fmnl3-3.fna&oh=03_Q7cD2gFXBHqrG7N_2yFqY9syCi0G0_X7bQ8VR-WKp-fzdTXD-Q&oe=686847DD",
  "https://scontent.fmnl3-4.fna.fbcdn.net/v/t1.15752-9/495265178_691825280442869_8348764696181177059_n.png?_nc_cat=101&ccb=1-7&_nc_sid=9f807c&_nc_ohc=0CDNLcB2eWYQ7kNvwGt4_W4&_nc_oc=Adltmlj1djLkYVyLl_mcnMglJimau2YLyOORo45bMmAgMl6JR7K8uq0szeY3WjngIi8&_nc_zt=23&_nc_ht=scontent.fmnl3-4.fna&oh=03_Q7cD2gHRK0Em6Jlh8w99VXziqDQfzfATZni4btLdJ1ZsZd1BWw&oe=6868A320",
  "https://scontent.fmnl37-1.fna.fbcdn.net/v/t1.15752-9/495266436_9865451296843227_8945772980639061437_n.png?_nc_cat=106&ccb=1-7&_nc_sid=9f807c&_nc_ohc=PKliysr-facQ7kNvwGmy-wB&_nc_oc=AdnD6Z4cxviXloy0N3BSm-I1fidImsEFMX07GH1kG-we7B4QaoOO1rUH9-_tj9qElY8&_nc_zt=23&_nc_ht=scontent.fmnl37-1.fna&oh=03_Q7cD2gHnXvERLBIWXJLnt1I7UTCrj-CTVnRntc-bsPiZjV4kDA&oe=68683E1E",
  "https://scontent.fmnl3-4.fna.fbcdn.net/v/t1.15752-9/494817575_1063489708983575_7724780411432873541_n.png?_nc_cat=101&ccb=1-7&_nc_sid=9f807c&_nc_ohc=XOivRvn0IxwQ7kNvwGlGlx2&_nc_oc=Adkp3hEDT1W1oWy4PKZq7hNg034v_UeZa2Vd0wEfW_xDVEQqqRQOOdK7IXbac_rJnP4&_nc_zt=23&_nc_ht=scontent.fmnl3-4.fna&oh=03_Q7cD2gGsELf8v2LLLOtsFnx0XO-veWNg5C--LmFsc-T1NJ-oMA&oe=686863DE",
  "https://scontent.fmnl3-4.fna.fbcdn.net/v/t1.15752-9/494689298_680391114841502_110094531490660148_n.png?_nc_cat=104&ccb=1-7&_nc_sid=9f807c&_nc_ohc=-yQpDiatCNQQ7kNvwEAulee&_nc_oc=AdkArFAvwxvCV-2bzOFZ4VsKU3xFfoZq4D9HKUJf_bObC2I8xKNTdZykA31iuIcWQ7s&_nc_zt=23&_nc_ht=scontent.fmnl3-4.fna&oh=03_Q7cD2gEAVzSsE-61qQdR82Hm0Xc8CgcJ_pbYMIWrwSlsJJ9A4A&oe=68685575",
];

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [sliding, setSliding] = useState(false);

  const showAnnouncementDetail = (announcement) => {
    setSelectedAnnouncement(announcement);
    setCurrentView("announcementDetail");
  };

  useEffect(() => {
    const applicationId = localStorage.getItem("application_id");
    if (!applicationId) return;
    fetch(`http://localhost:5000/profile/${applicationId}`)
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSliding(true);
      setTimeout(() => {
        setHeaderIndex((prev) => (prev + 1) % headerImages.length);
        setSliding(false);
      }, 2000);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const backToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedAnnouncement(null);
  };

  const announcements = [
    {
      id: "early-bird-details",
      title: "Early Bird Enrollment Discount",
      detail: `
Announcing Our Early Bird Enrollment Incentive

We are pleased to announce a special Early Bird Enrollment Discount, providing prospective students with an opportunity to receive a 10% reduction on tuition fees. This initiative is designed to support individuals committed to advancing their education by offering a significant financial incentive.

To qualify for this exclusive offer, applicants must complete their enrollment process by July 15, 2025. This stipulated deadline is firm, and we encourage all interested parties to finalize their registration promptly to benefit from this advantageous offer.

Key Benefits of Early Enrollment:

- Financial Advantage: A direct 10% reduction on tuition fees, contributing to overall cost savings.
- Program Assurance: Early enrollment guarantees placement in your chosen program, particularly beneficial for courses with limited capacities.
- Enhanced Preparation: Securing your enrollment in advance allows ample time for academic and logistical preparations, ensuring a smooth transition into your studies.

Eligibility and Application Procedure:

The 10% tuition fee discount will be automatically applied to all enrollments processed on or before July 15, 2025. No separate application for the discount is required; timely enrollment is the sole prerequisite.

This early bird incentive represents a valuable opportunity to invest in your academic or professional development while realizing substantial savings. We encourage you to utilize this limited-time offer.

For further inquiries or to commence your enrollment, please contact our admissions department.`,
      date: "Posted: June 1, 2025",
    },
    {
      id: "scholarship-details",
      title: "Scholarship Applications Open",
      detail: `
Opportunity Awaits: Scholarship Applications for AY 2025-2026

Aspiring students seeking to fund their academic journey will be pleased to learn that scholarship applications for the Academic Year 2025-2026 are officially open. This is a crucial opportunity for individuals demonstrating exceptional academic promise or outstanding athletic talent to receive financial assistance towards their education.

Both academic and athletic scholarship applications are now being accepted. These scholarships are designed to support students who meet specific criteria, recognizing their achievements and potential.

To ensure all necessary information is readily accessible, comprehensive details regarding "eligibility criteria" for each scholarship category, along with the required application forms, have been published. Prospective applicants are strongly encouraged to visit the dedicated Scholarships page on our officiaL website for full information and to download the relevant documents.

Please note the critical deadline for submission: All applications must be submitted by July 31, 2025. Late submissions will not be considered. We advise all interested candidates to begin their application process promptly to gather all required documents and accurately complete the forms.

This is a chance to invest in your future and alleviate the financial burden of higher education. Don't miss out on the opportunity to secure support for Academic Year 2025-2026.`,
      date: "Posted: June 18, 2025",
    },
    {
      id: "new-courses-details",
      title: "New Course Offerings",
      detail: `We are thrilled to unveil significant enhancements to our academic portfolio with the launch of new initiatives designed to meet diverse educational and industry needs. These new programs and opportunities will be available starting this upcoming academic year.
                
Among our new offerings, we are excited to introduce a cutting-edge "Bachelor of Science in Data Science" program. This innovative program is meticulously designed to equip students with the theoretical knowledge, practical skills, and critical thinking necessary to excel in the dynamic and high-growth sector of data analysis. Graduates of the BS in Data Science program will be prepared to transform complex data into actionable insights, utilizing statistical analysis, machine learning algorithms, and data visualization techniques.

    

    Programs Offered:

    - 4 - Year Baccalaureate Degree
    - 2- Year Certificate Course

    

    Special Skills Program:

    - Executive Class
    - Institute of Technical Resource and Entrepreneurial Development

    

    FREE TUITION FOR:

    UNIFAST - QUALIFIED COLLEGE STUDENTS

Our expanded offerings and financial aid opportunities reflect our commitment to providing accessible and high-quality education. We aim to empower the next generation of professionals and contribute directly to the talent pool required by various industries.

We invite prospective students eager to embark on a rewarding career or enhance their skills to explore these new program offerings and tuition assistance. Join us in shaping your future.`,
      date: "Posted: June 18, 2025",
    },
  ];

  return (
    <div>
      <TabBar profile={profile} />
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-main-content">
          {currentView === "dashboard" ? (
            <>
              {/* Sliding Header Section */}
              <div className="dashboard-header-slideshow">
                <div
                  className={`slide-img current${
                    sliding ? " sliding-out" : ""
                  }`}
                  style={{
                    backgroundImage: `url(${headerImages[headerIndex]})`,
                  }}
                />
                <div
                  className={`slide-img next${sliding ? " sliding-in" : ""}`}
                  style={{
                    backgroundImage: `url(${
                      headerImages[(headerIndex + 1) % headerImages.length]
                    })`,
                  }}
                />
                <div className="header-overlay"></div>
              </div>
              {/* Info Cards Section */}
              <section className="info-cards-section">
                <div className="info-card">
                  <img
                    src="https://img.freepik.com/free-vector/calendar-icon-white-background_1308-84634.jpg"
                    className="info-card-icon"
                    alt="Calendar icon"
                  />
                  <p className="info-card-text">
                    <span className="info-card-highlight">30+ Years</span>
                    <br />{" "}
                    {/* This forces "of Academic Excellence" to a new line */}
                    of Academic Excellence
                  </p>
                </div>
                <div className="info-card">
                  <img
                    src="https://media.istockphoto.com/id/1205507976/vector/graduate-cap-logo-university-mortarboard.jpg?s=612x612&w=0&k=20&c=X_WSdETOyZPl9KeYSdYCYCltoS7cYwUtQHM6hbj_QqQ="
                    className="info-card-icon"
                    alt="Graduation cap icon"
                  />
                  <p className="info-card-text">
                    <span className="info-card-highlight">5,000+</span>
                    <br />{" "}
                    {/* This forces "of Academic Excellence" to a new line */} Enrolled
                    Students
                  </p>
                </div>
                <div className="info-card">
                  <img
                    src="https://chedcar.com/wp-content/uploads/2020/09/Commission_on_Higher_Education_CHEd.svg_.png"
                    className="info-card-icon"
                    alt="CHED logo"
                  />
                  <p className="info-card-text">
                    <span className="info-card-highlight">CHED Recognized</span>
                    <br />{" "}
                    {/* This forces "of Academic Excellence" to a new line */}
                    Quality Education
                  </p>
                </div>
              </section>
              {/* Main Content Columns (Announcements and Important Information) */}
              <div
                className="dashboard-columns-container"
                style={{ backgroundImage: `url(${bgImage})` }}
              >
                {/* Latest Announcements Section */}
                <section className="announcements-section">
                  <h2 className="section-title">Latest Announcements</h2>
                  <ul className="announcement-list">
                    {announcements.map((announcement) => (
                      <li
                        key={announcement.id}
                        className="announcement-item clickable-list-item"
                        onClick={() => showAnnouncementDetail(announcement)}
                      >
                        <h3 className="announcement-heading">
                          {announcement.title}
                        </h3>
                        <p className="announcement-detail">
                          {announcement.detail.substring(0, 80)}...
                        </p>{" "}
                        <span className="announcement-date">
                          {announcement.date}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Important Information Section */}
                <section className="info-section">
                  <h2 className="section-title">Important Information</h2>
                  <ul className="info-list">
                    <li className="info-item">
                      <h3 className="info-heading">Enrollment Period</h3>
                      <p className="info-detail">July 1 - August 15, 2025</p>
                    </li>
                    <li className="info-item">
                      <h3 className="info-heading">Start of Classes</h3>
                      <p className="info-detail">August 29, 2025</p>
                    </li>
                    <li className="info-item">
                      <h3 className="info-heading">Requirements Deadline</h3>
                      <p className="info-detail">August 1, 2025</p>
                    </li>
                    <li className="info-item">
                      <h3 className="info-heading">Library Operating Hours</h3>
                      <p className="info-detail">
                        Monday-Friday, 8:00 AM - 7:00 PM; Saturday, 9:00 AM -
                        4:00 PM
                      </p>
                    </li>
                  </ul>
                </section>
              </div>{" "}
              {/* End dashboard-columns-container */}
              {/* Academic Programs Section */}
              <section className="academic-programs-section">
                <h2 className="section-title">Academic Programs</h2>
                <div className="academic-programs-grid">
                  <div className="program-card">
                    <h3 className="program-heading">
                      TWO YEAR PROGRAMS (PAYING/NON-UNIFAST)
                    </h3>
                    <ul className="program-list">
                      <li>Associate in Business Administration (ABA)</li>
                      <li>Associate in Accounting Information System (AAIS)</li>
                      <li>Associate in Human Resource Development (AHRD)</li>
                      <li>Associate in Hotel and Restaurant Technology (AHRT)</li>
                    </ul>
                  </div>
                  <div className="program-card">
                    <h3 className="program-heading">
                      INSTITUTE OF INFORMATION AND COMMUNICATION TECHNOLOGY
                      (IICT)
                    </h3>
                    <ul className="program-list">
                      <li>Bachelor of Science Information Technology (BSIT)</li>
                      <li>Certificate in Computer Sciences (CCS)</li>
                    </ul>
                  </div>
                  <div className="program-card">
                    <h3 className="program-heading">
                      INSTITUTE OF BUSINESS AND OFFICE ADMINISTRATION (IBOA)
                    </h3>
                    <ul className="program-list">
                      <li>
                        Bachelor of Science in Office Administration (BSOA)
                      </li>
                      <li>Certificate in Office Administration (COA)</li>
                    </ul>
                  </div>
                </div>
              </section>
              {/* Contact Information Section */}
              <section className="contact-info-section">
                <h2 className="section-title">Contact Information</h2>
                <div className="contact-details-grid">
                  <div className="contact-address">
                    <h3 className="contact-heading">Main Campus Address:</h3>
                    <p>123 College Road, Pateros, Metro Manila</p>
                  </div>
                  <div className="contact-numbers">
                    <h3 className="contact-heading">Contact Numbers:</h3>
                    <p>+63 (2) 8123-4567</p>
                    <p>+63 917-123-4567</p>
                  </div>
                  <div className="contact-email">
                    <h3 className="contact-heading">Email:</h3>
                    <p>admissions@ptc.edu.ph</p>
                  </div>
                  <div className="contact-hours">
                    <h3 className="contact-heading">Office Hours:</h3>
                    <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            // Render Announcement Detail page
            <AnnouncementDetail
              title={selectedAnnouncement.title}
              detail={selectedAnnouncement.detail}
              date={selectedAnnouncement.date}
              onBack={backToDashboard}
            />
          )}
        </div>{" "}
        {/* End dashboard-main-content */}
      </div>
    </div>
  );
}

export default Dashboard;
