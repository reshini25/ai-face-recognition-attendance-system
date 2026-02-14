// import React, { useState } from "react";
// import "./App.css";

// function App() {
//   const [file, setFile] = useState(null);
//   const [studentId, setStudentId] = useState("");
//   const [msg, setMsg] = useState("");

//   // ✅ file select
//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   // ✅ register student
//   const handleRegister = async () => {
//     if (!file || !studentId) {
//       setMsg("⚠️ Enter student ID and select image");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await fetch(
//         `http://44.223.53.242:8000/register/${studentId}`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const data = await response.json();
//       setMsg(data.message || "Registration completed");

//     } catch (error) {
//       console.error(error);
//       setMsg("❌ Registration failed");
//     }
//   };

//   // ✅ mark attendance
//   const handleAttendance = async () => {
//     if (!file) {
//       setMsg("⚠️ Please select an image");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await fetch(
//         "http://44.223.53.242:8000/attendance",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const data = await response.json();
//       console.log("API response:", data);

//       // 🔥 CORRECT LOGIC
//       if (data.success) {
//         setMsg(`✅ Attendance marked for ${data.student_id}`);
//       } else {
//         setMsg(`❌ ${data.message}`);
//       }

//     } catch (error) {
//       console.error(error);
//       setMsg("❌ Server error");
//     }
//   };

//   return (
//     <div className="App">
//       <h1>🎓 AI Face Attendance System</h1>

//       <div className="card">
//         <input
//           type="text"
//           placeholder="Enter Student ID"
//           value={studentId}
//           onChange={(e) => setStudentId(e.target.value)}
//         />

//         <input type="file" accept="image/*" onChange={handleFileChange} />

//         <div className="btn-group">
//           <button onClick={handleRegister}>Register Student</button>
//           <button onClick={handleAttendance}>Mark Attendance</button>
//         </div>

//         {msg && <p className="message">{msg}</p>}
//       </div>
//     </div>
//   );
// }

// export default App;


import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [msg, setMsg] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 📁 file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 🎥 start camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  // 📸 capture photo
  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      setFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
      setMsg("📸 Photo captured");
    }, "image/jpeg");
  };

  // ✅ register
  const handleRegister = async () => {
    if (!file || !studentId) {
      setMsg("⚠️ Enter student ID and capture/upload image");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `/api/register/${studentId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setMsg(data.message);
    } catch (err) {
      setMsg("❌ Registration failed");
    }
  };

  // ✅ attendance
  const handleAttendance = async () => {
    if (!file) {
      setMsg("⚠️ Capture or upload image first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `/api/attendance`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setMsg(`✅ Attendance marked for ${data.student_id}`);
      } else {
        setMsg(`❌ ${data.message}`);
      }
    } catch (err) {
      setMsg("❌ Server error");
    }
  };

  return (
    <div className="App">
      <h1>🎓 AI Face Attendance System</h1>

      <div className="card">
        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <div className="btn-group">
          <button onClick={handleRegister}>Register</button>
          <button onClick={handleAttendance}>Attendance</button>
        </div>

        <hr />

        {/* 🎥 CAMERA SECTION */}
        <video ref={videoRef} autoPlay width="100%" />

        <div className="btn-group">
          <button onClick={startCamera}>Start Camera</button>
          <button onClick={capturePhoto}>Capture</button>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {msg && <p className="message">{msg}</p>}
      </div>
    </div>
  );
}

export default App;
