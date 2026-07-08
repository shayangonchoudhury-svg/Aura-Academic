import React, { useState } from 'react';
import { AcademicSettings } from '../types';
import LofiPlayer from './LofiPlayer';
import { User, Shield, HelpCircle, Bell, Volume2, LogOut, Settings, Sliders, Check, Mail, Info, Calendar } from 'lucide-react';

interface SettingsViewProps {
  settings: AcademicSettings;
  setSettings: React.Dispatch<React.SetStateAction<AcademicSettings>>;
}

export default function SettingsView({ settings, setSettings }: SettingsViewProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(settings.studentName);
  const [email, setEmail] = useState(settings.studentEmail);

  const [isEditingSemester, setIsEditingSemester] = useState(false);
  const [semName, setSemName] = useState(settings.semesterName);
  const [semStart, setSemStart] = useState(settings.semesterStart);
  const [semEnd, setSemEnd] = useState(settings.semesterEnd);

  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleSaveProfile = () => {
    setSettings(prev => ({
      ...prev,
      studentName: name,
      studentEmail: email
    }));
    setIsEditingProfile(false);
  };

  const handleSaveSemester = () => {
    setSettings(prev => ({
      ...prev,
      semesterName: semName,
      semesterStart: semStart,
      semesterEnd: semEnd
    }));
    setIsEditingSemester(false);
  };

  const handleGpaChange = (val: number) => {
    setSettings(prev => ({
      ...prev,
      gpaTarget: val
    }));
  };

  const toggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled
    }));
  };

  return (
    <div className="w-full flex flex-col gap-stack-lg animate-fade-in" id="settings-preferences-view">
      
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-bold font-serif text-on-surface">Settings</h2>
        <p className="text-xs text-on-surface-variant mt-1">
          Manage your Aura Academic preferences and account data.
        </p>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
          Profile
        </span>

        <div className="glass-card rounded-xl p-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Profile Avatar with elegant gradient */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-surface text-xl font-bold shadow-[0_0_15px_rgba(74,222,128,0.25)] select-none">
                {settings.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "S"}
              </div>

              {isEditingProfile ? (
                <div className="flex flex-col gap-1.5 w-full max-w-xs">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="px-2 py-1 bg-surface-container-lowest border border-outline-variant/30 rounded text-xs text-on-surface font-semibold"
                    placeholder="Full Name"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="px-2 py-1 bg-surface-container-lowest border border-outline-variant/30 rounded text-xs text-on-surface-variant font-mono"
                    placeholder="Email Address"
                  />
                </div>
              ) : (
                <div>
                  <h4 className="font-bold text-on-surface text-sm md:text-base">{settings.studentName}</h4>
                  <p className="text-xs text-on-surface-variant font-mono">{settings.studentEmail}</p>
                </div>
              )}
            </div>

            {isEditingProfile ? (
              <button
                onClick={handleSaveProfile}
                className="px-4 py-1.5 bg-primary text-surface rounded-lg font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all self-start sm:self-auto"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-3.5 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/15 text-on-surface rounded-lg text-xs font-semibold transition-all self-start sm:self-auto"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Academic Target Settings */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
          Academic Settings
        </span>

        <div className="flex flex-col gap-3">
          {/* Semester Config */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm text-on-surface">Semester Configuration</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {settings.semesterName}
                  </p>
                </div>
              </div>
              
              {isEditingSemester ? (
                <button
                  onClick={handleSaveSemester}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingSemester(true)}
                  className="text-xs text-on-surface-variant hover:text-on-surface"
                >
                  Configure
                </button>
              )}
            </div>

            {isEditingSemester ? (
              <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/10">
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-on-surface-variant uppercase mb-1">
                    Semester Name
                  </label>
                  <input
                    type="text"
                    value={semName}
                    onChange={e => setSemName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/25 rounded-lg text-on-surface text-xs focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-semibold text-on-surface-variant uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={semStart}
                      onChange={e => setSemStart(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/25 rounded-lg text-on-surface text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-semibold text-on-surface-variant uppercase mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={semEnd}
                      onChange={e => setSemEnd(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/25 rounded-lg text-on-surface text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-xs text-on-surface-variant font-mono">
                <span>Start: {settings.semesterStart}</span>
                <span>•</span>
                <span>End: {settings.semesterEnd}</span>
              </div>
            )}
          </div>

          {/* GPA Target slider */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-on-surface">Target CGPA Goal</span>
              </div>
              <span className="text-sm font-bold font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {settings.gpaTarget.toFixed(2)}
              </span>
            </div>
            
            <input
              type="range"
              min="2.0"
              max="10.0"
              step="0.05"
              value={settings.gpaTarget}
              onChange={(e) => handleGpaChange(parseFloat(e.target.value))}
              className="w-full accent-primary bg-surface-container h-1 rounded-lg appearance-none cursor-pointer mt-2"
            />
            <div className="flex justify-between text-[10px] font-mono text-on-surface-variant mt-1.5">
              <span>5.0 (Average)</span>
              <span>7.5 (Good)</span>
              <span>10.0 (Excellence)</span>
            </div>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
          App Preferences
        </span>

        {/* Notifications Preference */}
        <div className="glass-card rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-primary" />
            <div>
              <h4 className="font-semibold text-sm text-on-surface">Study Reminder Notifications</h4>
              <p className="text-xs text-on-surface-variant">Focus mode overrides enabled</p>
            </div>
          </div>
          <button
            onClick={toggleNotifications}
            className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              settings.notificationsEnabled ? 'bg-primary' : 'bg-surface-container-highest'
            }`}
          >
            <div className={`w-5 h-5 bg-surface rounded-full shadow-md transform transition-transform ${
              settings.notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Custom procedural noise synthesizer player */}
        <LofiPlayer />
      </div>

      {/* Support & Legal Info */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
          Support & Legal
        </span>

        <div className="flex flex-col gap-2.5">
          <div className="glass-card rounded-xl p-4 flex items-center justify-between text-xs hover:text-primary cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4" />
              <span>Aura Help Center</span>
            </div>
            <span className="font-mono text-[10px] text-on-surface-variant">docs.aura.edu</span>
          </div>

          <div className="glass-card rounded-xl p-4 flex items-center justify-between text-xs hover:text-primary cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4" />
              <span>Student Privacy Policy</span>
            </div>
            <span className="font-mono text-[10px] text-on-surface-variant">compliance</span>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="mt-2 text-center">
        {showLogoutAlert ? (
          <div className="glass-card rounded-xl p-4 flex flex-col gap-3 items-center animate-scale-up">
            <p className="text-xs text-on-surface-variant">Are you sure you want to reset and logout of your study session?</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-3.5 py-1.5 bg-error text-surface rounded-lg text-xs font-bold"
              >
                Yes, Reset Local State
              </button>
              <button
                onClick={() => setShowLogoutAlert(false)}
                className="px-3.5 py-1.5 bg-surface-container text-on-surface rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutAlert(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 w-full bg-surface-container hover:bg-error/10 hover:text-error border border-outline-variant/15 hover:border-error/20 rounded-xl text-xs font-bold font-mono tracking-wide transition-all"
          >
            <LogOut className="w-4 h-4" /> Reset Study Profile
          </button>
        )}
      </div>

    </div>
  );
}
