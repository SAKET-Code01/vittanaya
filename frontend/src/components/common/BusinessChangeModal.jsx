import React, { useEffect, useState } from 'react';

export default function BusinessChangeModal({ isOpen, onClose, currentProfile, onSave }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  useEffect(() => { if (isOpen) { setName(currentProfile?.name || ''); setLocation(currentProfile?.location || ''); } }, [isOpen, currentProfile]);
  if (!isOpen) return null;
  const submit = (event) => { event.preventDefault(); onSave({ name: name.trim() || currentProfile?.name, location: location.trim() || currentProfile?.location }); onClose(); };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" role="dialog" aria-modal="true" aria-labelledby="business-change-title"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5"><div><h2 id="business-change-title" className="text-lg font-bold text-slate-900">Switch Business / Location</h2><p className="mt-1 text-xs text-slate-500">Update the active workspace identity. Financial records are not changed.</p></div><label className="block text-xs font-semibold text-slate-700">Business name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label><label className="block text-xs font-semibold text-slate-700">Location<input value={location} onChange={(event) => setLocation(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label><div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold">Cancel</button><button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white">Save workspace</button></div></form></div>;
}
