"use client";

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function RedirectHandler() {
  const { hash } = useParams();        // Grabs the first URL segment
  const navigate = useNavigate();

  useEffect(() => {
  if (!hash) return;

  console.log("Received hash:", hash);  // Debug log

  fetch(`http://localhost:5000/api/redirect?hash=${hash}`, {
    credentials: "include", // 🔐 Required for session cookie
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Redirect response:", data);  // Debug log

      if (data.original_url) {
        window.location.replace(data.original_url);  // Found → redirect
      } else {
        navigate("/mainpage", { replace: true });    // Not found
      }
    })
    .catch((error) => {
      console.error("Redirect fetch error:", error);  // Debug log
      navigate("/mainpage", { replace: true });
    });
}, [hash, navigate]);


  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "4rem" }}>
      Redirecting…
    </div>
  );
}
