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
            height: '60vh',
            width: '100%',
            backgroundColor: '#ffffff',
            color: '#475569',
            padding: '24px',
            textAlign: 'center',
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
        }}>
            <div style={{ 
            fontSize: '48px',
            marginBottom: '16px',
            lineHeight: 1
            }}>🔍</div>
            
            <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#1e293b',
            margin: '0 0 12px 0',
            lineHeight: 1.3
            }}>
            No results found
            </h2>
            
            <p style={{
            margin: 0,
            fontSize: '16px',
            maxWidth: '380px',
            lineHeight: 1.5,
            color: '#64748b',
            marginBottom: '24px'
            }}>
            We couldn't find any matching laws. Try adjusting your search or check back later.
            </p>
            
            <button style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}>
            Try Again
            </button>
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
