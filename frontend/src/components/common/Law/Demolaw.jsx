import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Demolaw() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(
        "https://www.ilo.org/sdmx/rest/data/ILO,DF_EMP_STATUS_SEX_AGE_RT,1.0/A.US.M.EMP.15+.T?format=sdmx-json"
      )
      .then((res) => {
        console.log("API response:", res.data); // Debug output

        const obs = res.data.dataSets[0]?.observations;
        const timeDim = res.data.structure?.dimensions?.observation.find(
          (d) => d.id === "TIME_PERIOD"
        );

        if (!obs || !timeDim) {
          throw new Error("Unexpected API response structure");
        }

        const formatted = Object.entries(obs).map(([key, val]) => {
          const timeIndex = key.split(":")[timeDim.keyPosition];
          return {
            year: timeDim.values[timeIndex].name,
            value: val[0],
          };
        });
        setData(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(
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
        setLoading(false);
      });
  }, []);

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
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>US Population Age Data</h1>
      <ul>
        {data.map((item, i) => (
          <li key={i}>
            {item.year}: {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
