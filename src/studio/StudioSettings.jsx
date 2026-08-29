import useStudioDNA from './useStudioDNA.js'

export default function StudioSettings() {
  const {
    dna,
    update,
    selectPreset,
    presets
  } = useStudioDNA()

  function field(
    name,
    label,
    tag = 'input'
  ) {
    if (tag === 'input') {
      return (
        <div
          className="card-group"
          key={name}
        >
          <div className="label">
            {label}
          </div>

          <input
            value={dna[name] || ''}
            onChange={event =>
              update({
                [name]:
                  event.target.value
              })
            }
          />
        </div>
      )
    }

    return (
      <div
        className="card-group"
        key={name}
      >
        <div className="label">
          {label}
        </div>

        <textarea
          value={dna[name] || ''}
          onChange={event =>
            update({
              [name]:
                event.target.value
            })
          }
        />
      </div>
    )
  }

  return (
    <div className="studio-settings">
      <div className="main-header">
        <h1>Studio Settings</h1>

        <p className="lead">
          Global production defaults shared
          across all stages.
        </p>
      </div>

      <section className="presets">
        <h3>Presets</h3>

        <div className="card-row">
          {Object.keys(presets).map(
            name => (
              <button
                key={name}
                className="card"
                onClick={() =>
                  selectPreset(name)
                }
              >
                {name}
              </button>
            )
          )}
        </div>
      </section>

      <section className="settings-grid">
        {field(
          'audience',
          'Audience'
        )}

        {field(
          'language',
          'Output Language'
        )}

        {field(
          'tone',
          'Tone'
        )}

        {field(
          'narrative',
          'Narrative Style'
        )}

        {field(
          'evidence',
          'Evidence Policy',
          'textarea'
        )}

        {field(
          'visual',
          'Visual Style'
        )}

        {field(
          'voice',
          'Voice Style'
        )}

        {field(
          'retention',
          'Retention Strategy',
          'textarea'
        )}

        {field(
          'model',
          'AI Model Preference'
        )}
      </section>
    </div>
  )
}