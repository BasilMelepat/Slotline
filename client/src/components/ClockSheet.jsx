import { useEffect, useRef, useState } from 'react';
import { pad } from '../lib/time.js';

const polar = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return [120 + r * Math.sin(a), 120 - r * Math.cos(a)];
};

/** Bottom sheet with a clock face. Hours first, then minutes in steps of 10. */
export default function ClockSheet({ value, onSet, onClose }) {
  const [h0, m0] = (value || '09:00').split(':').map(Number);
  const [h, setH] = useState(h0 % 12 || 12);
  const [m, setM] = useState((Math.round(m0 / 10) % 6) * 10);
  const [ap, setAp] = useState(h0 >= 12 ? 'PM' : 'AM');
  const [mode, setMode] = useState('h');
  const svg = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isH = mode === 'h';
  const marks = isH ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [0, 10, 20, 30, 40, 50];
  const handAt = polar(isH ? h * 30 : m * 6, 88);

  const pick = (e) => {
    const r = svg.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    const deg = ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
    if (isH) setH(Math.round(deg / 30) % 12 || 12);
    else setM((Math.round(deg / 60) % 6) * 10);
  };

  const confirm = () => {
    const h24 = (h % 12) + (ap === 'PM' ? 12 : 0);
    onSet(`${pad(h24)}:${pad(m)}`);
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Pick a start time" onClick={(e) => e.stopPropagation()}>
        <div className="grab" aria-hidden="true" />
        <div className="clock-head">
          <div className="tm">
            <button type="button" className={isH ? 'on' : ''} onClick={() => setMode('h')} aria-label="Hour">{h}</button>
            <span>:</span>
            <button type="button" className={!isH ? 'on' : ''} onClick={() => setMode('m')} aria-label="Minute">{pad(m)}</button>
          </div>
          <div className="ap">
            <button type="button" className={ap === 'AM' ? 'on' : ''} onClick={() => setAp('AM')}>AM</button>
            <button type="button" className={ap === 'PM' ? 'on' : ''} onClick={() => setAp('PM')}>PM</button>
          </div>
        </div>
        <svg
          ref={svg}
          className="dial"
          viewBox="0 0 240 240"
          role="img"
          aria-label="Clock face"
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            dragging.current = true;
            pick(e);
          }}
          onPointerMove={(e) => dragging.current && pick(e)}
          onPointerUp={() => {
            if (!dragging.current) return;
            dragging.current = false;
            if (isH) setMode('m');
          }}
          onPointerCancel={() => (dragging.current = false)}
        >
          <circle cx="120" cy="120" r="116" className="dial-bg" />
          <line x1="120" y1="120" x2={handAt[0]} y2={handAt[1]} className="dial-hand" />
          <circle cx="120" cy="120" r="4" className="dial-pivot" />
          <circle cx={handAt[0]} cy={handAt[1]} r="19" className="dial-knob" />
          {marks.map((v) => {
            const [x, y] = polar(isH ? v * 30 : v * 6, 88);
            const sel = isH ? v === h : v === m;
            return (
              <text key={v} x={x} y={y} textAnchor="middle" dominantBaseline="central" className={`dial-num${sel ? ' sel' : ''}`}>
                {isH ? v : pad(v)}
              </text>
            );
          })}
        </svg>
        <div className="sheet-foot">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="button" className="btn primary" onClick={confirm}>Set time</button>
        </div>
      </div>
    </div>
  );
}
