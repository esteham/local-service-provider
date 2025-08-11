import React, { useState, useEffect } from "react";

export default function BDlaw({ id }) {
  const [act, setAct] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${BASE_URL}/backend/api/labourlaw/law.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setAct(data.error ? null : data);
        setLoading(false);
      })
      .catch(() => {
        setAct(null);
        setLoading(false);
      });
  }, [id]);
  
    if (loading) return (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    height: '60vh',
    width: '100vw',
    color: '#64748b',
    padding: '24px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '32px' }}>🔍</div>
    <div style={{ 
      fontSize: '20px', 
      fontWeight: 600,
      color: '#334155'
    }}>
      Oops! <span style={{ fontSize: '24px' }}>😯</span>
    </div>
    <p style={{ 
      margin: 0,
      fontSize: '15px',
      maxWidth: '300px',
      lineHeight: '1.6'
    }}>
      We couldn't find what you're looking for <span>🤔</span>
    </p>
  </div>
);


  if (!act) return <p>No data found</p>;

  return (
    <div>
      <h1>{act.title}</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{act.content}</p>
    </div>
  );
}
