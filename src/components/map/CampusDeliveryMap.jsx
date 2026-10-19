import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Zap, Compass, Layers, ShieldCheck, PhoneCall, Clock, CheckCircle2 } from 'lucide-react';

export default function CampusDeliveryMap({ 
  orderStatus = 'Out for Delivery', 
  hostelBlock = 'Block B', 
  storeName = 'Campus Stationery Store',
  roomNumber = '204',
  compact = false 
}) {
  const [satelliteView, setSatelliteView] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [progress, setProgress] = useState(0); // 0 to 100%

  // Waypoints from Campus Stationery Store (SAC) to Hostel Block B
  // SAC is around (45%, 48%) and Block B is at (78%, 74%)
  const waypoints = [
    { x: 45, y: 48, label: 'Campus Stationery Store (SAC)' },
    { x: 50, y: 48, label: 'SAC Plaza Crossing' },
    { x: 56, y: 52, label: 'Central Library Avenue' },
    { x: 64, y: 56, label: 'Sports Complex Road' },
    { x: 70, y: 64, label: 'Junior Hostel Junction' },
    { x: 74, y: 69, label: 'Block B Approach Road' },
    { x: 78, y: 74, label: 'Hostel Block B Main Gate' }
  ];

  // Adjust route progress based on order status
  useEffect(() => {
    if (orderStatus === 'Placed') setProgress(0);
    else if (orderStatus === 'Accepted') setProgress(5);
    else if (orderStatus === 'Preparing') setProgress(15);
    else if (orderStatus === 'Ready') setProgress(25);
    else if (orderStatus === 'Out for Delivery') {
      // Dynamic simulated scooter movement
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 92) return 92;
          return prev + 1.2;
        });
      }, 300);
      return () => clearInterval(interval);
    } else if (orderStatus === 'Delivered') {
      setProgress(100);
    }
  }, [orderStatus]);

  // Calculate current rider position along waypoints
  const getRiderPosition = () => {
    const totalSegments = waypoints.length - 1;
    const scaledProgress = (progress / 100) * totalSegments;
    const currentSegmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segmentProgress = scaledProgress - currentSegmentIndex;

    const p1 = waypoints[currentSegmentIndex];
    const p2 = waypoints[currentSegmentIndex + 1] || p1;

    const curX = p1.x + (p2.x - p1.x) * segmentProgress;
    const curY = p1.y + (p2.y - p1.y) * segmentProgress;
    return { x: curX, y: curY };
  };

  const riderPos = getRiderPosition();

  // Simulated GPS Coordinates for telemetry
  const lat = (12.9716 + (riderPos.y * 0.00015)).toFixed(6);
  const lng = (77.5946 + (riderPos.x * 0.00018)).toFixed(6);
  const etaMinutes = orderStatus === 'Delivered' ? 0 : Math.max(1, Math.ceil((100 - progress) / 20));
  const distanceMeters = orderStatus === 'Delivered' ? 0 : Math.round((100 - progress) * 4.5);

  return (
    <div className={`delivery-map-container ${compact ? 'compact' : ''} ${satelliteView ? 'satellite' : ''}`}>
      {/* Google Maps Style Header Bar */}
      <div className="map-search-bar">
        <div className="map-badge-live">
          <span className="live-dot-pulse"></span>
          <span>LIVE CAMPUS RADAR</span>
        </div>
        <div className="map-route-title">
          <span className="source-point">{storeName.split(' ')[0]}</span>
          <span className="arrow">➔</span>
          <span className="dest-point">{hostelBlock} (Room {roomNumber})</span>
        </div>
        <div className="map-view-toggle">
          <button 
            type="button"
            className={`map-view-btn ${!satelliteView ? 'active' : ''}`}
            onClick={() => setSatelliteView(false)}
          >
            Map
          </button>
          <button 
            type="button"
            className={`map-view-btn ${satelliteView ? 'active' : ''}`}
            onClick={() => setSatelliteView(true)}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Campus Map Canvas / SVG Viewport */}
      <div className="map-viewport">
        <svg 
          viewBox="0 0 100 100" 
          className="campus-svg-map"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="grassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={satelliteView ? "#1c2e1f" : "#e8f5e9"} />
              <stop offset="100%" stopColor={satelliteView ? "#142316" : "#f1f8e9"} />
            </linearGradient>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke={satelliteView ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"} strokeWidth="0.3"/>
            </pattern>
          </defs>

          {/* Background Grounds */}
          <rect width="100" height="100" fill="url(#grassGradient)" />
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Campus Forest & Lawns */}
          <ellipse cx="20" cy="35" rx="14" ry="10" fill={satelliteView ? "#152a17" : "#dcedc8"} opacity="0.7" />
          <ellipse cx="65" cy="20" rx="18" ry="8" fill={satelliteView ? "#152a17" : "#dcedc8"} opacity="0.6" />
          <ellipse cx="85" cy="50" rx="10" ry="12" fill={satelliteView ? "#152a17" : "#dcedc8"} opacity="0.5" />
          <ellipse cx="40" cy="80" rx="15" ry="10" fill={satelliteView ? "#152a17" : "#dcedc8"} opacity="0.6" />

          {/* Campus Roads and Pathways */}
          <path 
            d="M 5 50 Q 30 50 45 48 T 75 45 T 95 45" 
            fill="none" 
            stroke={satelliteView ? "#334155" : "#e2e8f0"} 
            strokeWidth="5" 
            strokeLinecap="round"
          />
          <path 
            d="M 45 10 L 45 48 L 50 48 L 78 74 L 78 95" 
            fill="none" 
            stroke={satelliteView ? "#334155" : "#e2e8f0"} 
            strokeWidth="4.5" 
            strokeLinecap="round"
          />
          <path 
            d="M 30 20 L 30 75 L 5 75" 
            fill="none" 
            stroke={satelliteView ? "#334155" : "#e2e8f0"} 
            strokeWidth="3.5" 
          />
          <path 
            d="M 75 25 L 75 45 L 85 75" 
            fill="none" 
            stroke={satelliteView ? "#334155" : "#e2e8f0"} 
            strokeWidth="3.5" 
          />

          {/* Campus Buildings */}
          {/* Hostel Block A */}
          <g transform="translate(22, 66)">
            <rect width="12" height="12" rx="2" fill={satelliteView ? "#1e293b" : "#cbd5e1"} stroke="#94a3b8" strokeWidth="0.5" />
            <text x="6" y="8" fontSize="2.2" textAnchor="middle" fill="#475569" fontWeight="bold">BLOCK A</text>
          </g>

          {/* Hostel Block B (Destination) */}
          <g transform="translate(73, 69)">
            <rect width="14" height="14" rx="2" fill={satelliteView ? "#312e81" : "#e0e7ff"} stroke="#6366f1" strokeWidth="0.8" />
            <text x="7" y="7.5" fontSize="2.4" textAnchor="middle" fill="#4338ca" fontWeight="800">BLOCK B</text>
            <text x="7" y="11" fontSize="1.8" textAnchor="middle" fill="#6366f1">Room 204</text>
          </g>

          {/* Girls Hostel Gate 1 */}
          <g transform="translate(24, 18)">
            <rect width="14" height="10" rx="2" fill={satelliteView ? "#1e293b" : "#cbd5e1"} stroke="#94a3b8" strokeWidth="0.5" />
            <text x="7" y="6.5" fontSize="2.2" textAnchor="middle" fill="#475569" fontWeight="bold">GIRLS GATE 1</text>
          </g>

          {/* PG Block C */}
          <g transform="translate(68, 22)">
            <rect width="12" height="10" rx="2" fill={satelliteView ? "#1e293b" : "#cbd5e1"} stroke="#94a3b8" strokeWidth="0.5" />
            <text x="6" y="6.5" fontSize="2.2" textAnchor="middle" fill="#475569" fontWeight="bold">BLOCK C</text>
          </g>

          {/* SAC / Campus Stationery Store (Origin) */}
          <g transform="translate(38, 42)">
            <rect width="16" height="12" rx="2" fill={satelliteView ? "#064e3b" : "#d1fae5"} stroke="#10b981" strokeWidth="0.8" />
            <text x="8" y="6" fontSize="2.2" textAnchor="middle" fill="#047857" fontWeight="bold">SAC / STORE</text>
            <text x="8" y="9.5" fontSize="1.8" textAnchor="middle" fill="#059669">Stationery</text>
          </g>

          {/* Delivery Route Path (Full Planned Route) */}
          <polyline
            points={waypoints.map(w => `${w.x},${w.y}`).join(' ')}
            fill="none"
            stroke="#c7d2fe"
            strokeWidth="2.5"
            strokeDasharray="2,2"
            strokeLinecap="round"
          />

          {/* Dynamic Active Traveled Polyline */}
          <polyline
            points={[
              `${waypoints[0].x},${waypoints[0].y}`,
              ...waypoints.slice(1, Math.max(1, Math.floor((progress / 100) * (waypoints.length - 1)) + 1)).map(w => `${w.x},${w.y}`),
              `${riderPos.x},${riderPos.y}`
            ].join(' ')}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Origin Pin (Campus Stationery Store) */}
          <g transform={`translate(${waypoints[0].x}, ${waypoints[0].y})`}>
            <circle r="2.5" fill="#10b981" stroke="#ffffff" strokeWidth="0.8" />
            <circle r="0.8" fill="#ffffff" />
          </g>

          {/* Destination Pulsing Radar (Hostel Block B) */}
          <g transform={`translate(78, 74)`}>
            <circle r="5" fill="#6366f1" opacity="0.15">
              <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="2.8" fill="#4f46e5" stroke="#ffffff" strokeWidth="0.8" />
            <circle r="1" fill="#ffffff" />
          </g>

          {/* Animated Moving Scooter / Delivery Boy Marker */}
          <g 
            transform={`translate(${riderPos.x}, ${riderPos.y})`}
            className="moving-courier-marker"
          >
            {/* Courier Radar Ripple */}
            <circle r="4" fill="#06b6d4" opacity="0.3">
              <animate attributeName="r" values="2;5.5;2" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {/* Courier Base Circle */}
            <circle r="2.6" fill="#0284c7" stroke="#ffffff" strokeWidth="0.7" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
            
            {/* Scooter Icon glyph */}
            <path 
              d="M -1.2 0.8 L -0.5 -0.6 L 0.8 -0.6 L 1.2 0.8 M -0.8 0.8 A 0.4 0.4 0 1 0 -0.8 1.4 A 0.4 0.4 0 1 0 -0.8 0.8 M 0.8 0.8 A 0.4 0.4 0 1 0 0.8 1.4 A 0.4 0.4 0 1 0 0.8 0.8" 
              stroke="#ffffff" 
              strokeWidth="0.4" 
              fill="none" 
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* Floating Google Maps Overlay Controls */}
        <div className="map-floating-controls">
          <div className="compass-widget">
            <Compass className="compass-icon" size={16} />
            <span>N</span>
          </div>
          <div className="zoom-btns">
            <button type="button" onClick={() => setZoomLevel(z => Math.min(z + 0.2, 1.6))}>+</button>
            <button type="button" onClick={() => setZoomLevel(z => Math.max(z - 0.2, 0.8))}>-</button>
          </div>
        </div>

        {/* Live Rider HUD Card */}
        <div className="map-rider-hud">
          <div className="rider-avatar-wrap">
            <div className="rider-avatar">🛵</div>
            <div className="rider-signal-dot"></div>
          </div>
          <div className="rider-info-text">
            <div className="rider-name-row">
              <span className="rider-name">Rider: Sandeep K.</span>
              <span className="rider-badge">Fast Campus Courier</span>
            </div>
            <div className="rider-stats-row">
              <span className="stat-pill"><Clock size={11} /> ETA: <strong>{etaMinutes} mins</strong></span>
              <span className="stat-pill"><Navigation size={11} /> <strong>{distanceMeters}m</strong> remaining</span>
              <span className="stat-pill gps-pill">GPS: {lat}, {lng}</span>
            </div>
          </div>
          <a href="tel:+919876543210" className="call-rider-btn" title="Call Courier Partner">
            <PhoneCall size={14} />
          </a>
        </div>
      </div>

      {/* Map Bottom Delivery Status Bar */}
      <div className="map-footer-status">
        <div className="status-indicator-col">
          <span className="footer-label">CURRENT PHASE</span>
          <span className="footer-status-tag">
            {orderStatus === 'Delivered' ? (
              <span className="tag-green"><CheckCircle2 size={13} /> Order Delivered at Gate</span>
            ) : orderStatus === 'Out for Delivery' ? (
              <span className="tag-blue"><Zap size={13} /> En Route to {hostelBlock}</span>
            ) : (
              <span className="tag-amber"><Clock size={13} /> {orderStatus}</span>
            )}
          </span>
        </div>
        <div className="status-progress-meter">
          <div className="meter-label-row">
            <span>Route Progress</span>
            <span className="meter-percentage">{Math.round(progress)}%</span>
          </div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
