import React, { useEffect, useState, useRef } from 'react';
import { Navigation, MapPin, Bike, Compass, ShieldCheck } from 'lucide-react';

export default function CampusMap({ orderStatus, hostelBlock = 'Block B', storeName = 'Campus Stationery Store' }) {
  // Animation progress along route (0 = at store, 1 = at hostel)
  const [progress, setProgress] = useState(0);
  const animRef = useRef(null);

  // Determine progress based on order status
  useEffect(() => {
    if (orderStatus === 'Placed' || orderStatus === 'Accepted') {
      setProgress(0.05); // At the store
    } else if (orderStatus === 'Preparing') {
      setProgress(0.15); // Rider waiting at store
    } else if (orderStatus === 'Ready') {
      setProgress(0.25); // Package picked up, rider mounting
    } else if (orderStatus === 'Out for Delivery') {
      // Smoothly animate towards destination
      let current = 0.3;
      const interval = setInterval(() => {
        current += 0.015;
        if (current >= 0.95) {
          current = 0.95;
          clearInterval(interval);
        }
        setProgress(current);
      }, 300);
      return () => clearInterval(interval);
    } else if (orderStatus === 'Delivered') {
      setProgress(1.0); // At the hostel destination
    }
  }, [orderStatus]);

  // Route waypoints on campus map (percentage coordinates 0-100)
  // Store is at SAC (x: 42, y: 55)
  // Hostel Block B is at (x: 82, y: 78)
  const waypoints = [
    { x: 42, y: 55 }, // SAC Stationery Store
    { x: 50, y: 55 }, // SAC Plaza
    { x: 58, y: 52 }, // Central Boulevard
    { x: 68, y: 62 }, // South Campus Way
    { x: 74, y: 72 }, // Block B Gate
    { x: 82, y: 78 }, // Hostel Block B Entrance
  ];

  // Calculate current rider position along waypoints based on progress
  const getRiderPosition = (p) => {
    const totalSegments = waypoints.length - 1;
    const scaled = p * totalSegments;
    const index = Math.min(Math.floor(scaled), totalSegments - 1);
    const subProgress = scaled - index;

    const p1 = waypoints[index];
    const p2 = waypoints[index + 1];

    const x = p1.x + (p2.x - p1.x) * subProgress;
    const y = p1.y + (p2.y - p1.y) * subProgress;
    return { x, y };
  };

  const riderPos = getRiderPosition(progress);

  // Simulated GPS coordinates
  // Campus center approx: 12.9716° N, 77.5946° E
  const simulatedLat = (12.97160 + (riderPos.y * 0.00005)).toFixed(5);
  const simulatedLng = (77.59460 + (riderPos.x * 0.00005)).toFixed(5);
  const distanceRemaining = Math.max(0, Math.round((1 - progress) * 650));
  const etaMinutes = Math.max(1, Math.round((1 - progress) * 8));

  // Build SVG path string for the route
  const pathData = waypoints.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  return (
    <div className="campus-map-wrapper">
      <div className="map-telemetry-bar">
        <div className="telemetry-pill">
          <Navigation size={13} className="pulse-icon text-indigo" />
          <span>GPS: {simulatedLat}°N, {simulatedLng}°E</span>
        </div>
        <div className="telemetry-pill">
          <Compass size={13} className="text-emerald" />
          <span>ETA: {orderStatus === 'Delivered' ? 'Arrived' : `${etaMinutes} mins (${distanceRemaining}m)`}</span>
        </div>
        <div className="telemetry-pill status-pill">
          <span className="live-dot"></span>
          <span>{orderStatus}</span>
        </div>
      </div>

      <div className="map-container">
        <svg viewBox="0 0 100 100" className="campus-svg-map" preserveAspectRatio="none">
          {/* Campus Grounds & Paths */}
          <rect x="0" y="0" width="100" height="100" fill="#0f172a" />
          
          {/* Campus Lawns & Greenery */}
          <path d="M 5 5 L 35 5 L 30 35 L 5 25 Z" fill="#064e3b" opacity="0.3" />
          <path d="M 65 10 L 95 10 L 90 35 L 60 30 Z" fill="#064e3b" opacity="0.3" />
          <path d="M 10 65 L 35 60 L 30 90 L 5 95 Z" fill="#064e3b" opacity="0.3" />
          <path d="M 60 70 L 95 65 L 95 95 L 65 95 Z" fill="#064e3b" opacity="0.25" />

          {/* Roads & Campus pathways */}
          <path d="M 5 50 L 95 50" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
          <path d="M 50 5 L 50 95" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
          <path d="M 20 20 L 80 80" stroke="#1e293b" strokeWidth="3" strokeDasharray="2,2" />
          
          {/* Active delivery route path */}
          <path 
            d={pathData} 
            stroke="#6366f1" 
            strokeWidth="3.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeDasharray="1 0" 
            opacity="0.9"
          />

          {/* Traveled portion glow */}
          <path 
            d={pathData} 
            stroke="#a5b4fc" 
            strokeWidth="1.5" 
            fill="none" 
            strokeDasharray="2 3" 
            className="travel-glow"
          />

          {/* Landmark: Campus Stationery Store / SAC */}
          <circle cx="42" cy="55" r="4.5" fill="#4f46e5" />
          <circle cx="42" cy="55" r="7" stroke="#818cf8" strokeWidth="0.8" fill="none" opacity="0.6" className="pulse-circle" />
          <text x="42" y="47" textAnchor="middle" fill="#e2e8f0" fontSize="3.2" fontWeight="bold">SAC Store</text>

          {/* Landmark: Hostel Block B Destination */}
          <circle cx="82" cy="78" r="4.5" fill="#10b981" />
          <circle cx="82" cy="78" r="7.5" stroke="#34d399" strokeWidth="0.8" fill="none" opacity="0.7" className="pulse-circle" />
          <text x="82" y="88" textAnchor="middle" fill="#34d399" fontSize="3.2" fontWeight="bold">Hostel {hostelBlock}</text>

          {/* Other Campus Landmarks */}
          <rect x="18" y="22" width="10" height="8" rx="1.5" fill="#1e293b" stroke="#475569" strokeWidth="0.6" />
          <text x="23" y="27" textAnchor="middle" fill="#94a3b8" fontSize="2.2">Block A</text>

          <rect x="75" y="18" width="12" height="8" rx="1.5" fill="#1e293b" stroke="#475569" strokeWidth="0.6" />
          <text x="81" y="23" textAnchor="middle" fill="#94a3b8" fontSize="2.2">Girls Hostel</text>

          <rect x="15" y="70" width="12" height="8" rx="1.5" fill="#1e293b" stroke="#475569" strokeWidth="0.6" />
          <text x="21" y="75" textAnchor="middle" fill="#94a3b8" fontSize="2.2">Canteen</text>

          {/* Moving Delivery Rider Marker */}
          <g transform={`translate(${riderPos.x}, ${riderPos.y})`}>
            {/* Ripple Radar waves */}
            <circle cx="0" cy="0" r="5" fill="#f59e0b" opacity="0.3" className="rider-pulse" />
            <circle cx="0" cy="0" r="3" fill="#f59e0b" />
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
          </g>
        </svg>

        {/* Floating Rider Card Badge */}
        <div 
          className="map-rider-tag"
          style={{
            left: `${Math.min(78, Math.max(15, riderPos.x))}%`,
            top: `${Math.min(75, Math.max(12, riderPos.y - 12))}%`
          }}
        >
          <Bike size={13} className="rider-bike-icon" />
          <div className="rider-tag-text">
            <strong>Campus Express Rider</strong>
            <span>{orderStatus === 'Delivered' ? 'Delivered at Gate' : `${distanceRemaining}m to ${hostelBlock}`}</span>
          </div>
        </div>
      </div>

      <div className="map-footer-notes">
        <div className="route-endpoints">
          <div className="endpoint-item">
            <span className="dot store-dot"></span>
            <div>
              <span className="endpoint-label">Pickup Point</span>
              <strong>{storeName}</strong>
            </div>
          </div>
          <div className="route-arrow">➔</div>
          <div className="endpoint-item">
            <span className="dot hostel-dot"></span>
            <div>
              <span className="endpoint-label">Drop Point</span>
              <strong>Hostel {hostelBlock}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
