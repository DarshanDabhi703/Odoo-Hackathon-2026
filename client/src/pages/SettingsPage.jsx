import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Globe, Save, Check } from 'lucide-react';

const Section = ({ title, icon: Icon, children }) => (
  <div className="glass-card animate-fade-up" style={{ overflow: 'hidden' }}>
    <div
      style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid rgba(34,211,238,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div className="icon-badge" style={{ width: 30, height: 30 }}>
        <Icon size={14} />
      </div>
      <h2 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--secondary)' }}>
        {title}
      </h2>
    </div>
    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, defaultValue, type = 'text', options }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', alignItems: 'center' }}>
    <label style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>{label}</label>
    {options ? (
      <select className="glass-input">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} className="glass-input" defaultValue={defaultValue} />
    )}
  </div>
);

const Toggle = ({ label, description, defaultOn = false }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface)' }}>{label}</p>
        {description && <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: 2 }}>{description}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: on ? 'var(--secondary)' : 'rgba(255,255,255,0.12)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: on ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
};

const SettingsPage = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 760 }}>

      <Section title="Profile" icon={User}>
        <Field label="Full Name"     defaultValue="Admin User" />
        <Field label="Email"         defaultValue="admin@transitops.io" type="email" />
        <Field label="Role"          options={['Fleet Manager', 'Dispatcher', 'Analyst', 'Viewer']} />
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Toggle label="Email Alerts"           description="Receive critical fleet alerts via email" defaultOn />
        <Toggle label="Maintenance Reminders"  description="Get notified when vehicles are due for service" defaultOn />
        <Toggle label="Trip Completion"        description="Alert when a trip completes or is delayed" />
        <Toggle label="Fuel Level Warnings"    description="Notify when vehicle fuel drops below 25%" defaultOn />
      </Section>

      <Section title="Regional Settings" icon={Globe}>
        <Field label="Distance Unit"    options={['Kilometers (km)', 'Miles (mi)']} />
        <Field label="Fuel Unit"        options={['Litres', 'Gallons']} />
        <Field label="Currency"         options={['INR (₹)', 'USD ($)', 'EUR (€)']} />
        <Field label="Timezone"         options={['Asia/Kolkata (IST)', 'UTC', 'America/New_York', 'Europe/London']} />
      </Section>

      <Section title="Data & Security" icon={Shield}>
        <Toggle label="Two-Factor Authentication" description="Add an extra layer of security" />
        <Toggle label="Audit Logging"            description="Log all user actions for compliance" defaultOn />
        <Field label="Data Retention (days)" defaultValue="90" type="number" />
      </Section>

      <Section title="System" icon={Database}>
        <Field label="API Endpoint"   defaultValue="http://localhost:5000/api" />
        <Field label="Refresh Rate"   options={['15 seconds', '30 seconds', '1 minute', '5 minutes']} />
        <Toggle label="Maintenance Mode" description="Disable all write operations" />
      </Section>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn-cyan"
          onClick={handleSave}
          style={{ minWidth: 140 }}
        >
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
