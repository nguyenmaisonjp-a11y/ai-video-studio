import React from 'react'
import useStudioDNA from './useStudioDNA.js'

export default function StudioSettings() {
  const { dna, update, usePreset, presets } = useStudioDNA()

  function field(name, label, tag = 'input') {
    if (tag === 'input') {
      return (
        <div className="card-group" key={name}>
          <div className="label">{label}</div>
          <input value={dna[name] || ''} onChange={e => update({ [name]: e.target.value })} />
        </div>
      )
    }
    return (
      <div className="card-group" key={name}>
        <div className="label">{label}</div>
        <textarea value={dna[name] || ''} onChange={e => update({ [name]: e.target.value })} />
      </div>
    )
  }

  return (
    <div className="studio-settings">
      <div className="main-header">
        <h1>Studio Settings</h1>
        <p className="lead">Global production defaults shared across all stages.</p>
      </div>

      <section className="presets">
        <h3>Presets</h3>
        <div className="card-row">
          {Object.keys(presets).map(name => (
            <button key={name} className="card" onClick={() => usePreset(name)}>{name}</button>
          ))}
        </div>
      </section>

      <section className="settings-grid">
        {field('audience', 'Audience', 'input')}
        {field('language', 'Output Language', 'input')}
        {field('tone', 'Tone', 'input')}
        {field('narrative', 'Narrative Style', 'input')}
        {field('evidence', 'Evidence Policy', 'textarea')}
        {field('visual', 'Visual Style', 'input')}
        {field('voice', 'Voice Style', 'input')}
        {field('retention', 'Retention Strategy', 'textarea')}
        {field('model', 'AI Model Preference', 'input')}
      </section>
    </div>
  )
}
