import { useState, useEffect } from 'react'
import { ResearchEngine, OutlineEngine, ScriptEngine, HumanizeEngine, StoryboardEngine, VoiceScriptEngine } from './brain'
import { generateOutlineBrief } from './lib/outlineBrain.js'
import ImagePromptController from './controllers/ImagePromptController.jsx'
import GeminiFlowController from './controllers/GeminiFlowController.jsx'
import ImageLibraryController from './controllers/ImageLibraryController.jsx'
import CapCutPackageController from './controllers/CapCutPackageController.jsx'
import { createProjectDNA, loadProjectDNA, saveProjectDNA } from './lib/projectDNA.js'
import { normalizeScenes } from './lib/videoProjectSchema.js'
import { validateStoryboardScenes } from './lib/storyboardValidator.js'
import { saveProject, loadProject, clearProject, saveCurrentStage, loadCurrentStage } from './utils/projectStorage.js'
import { WorkflowEngine } from './workflow/workflowEngine.js'
import { loadWorkflow, saveWorkflow, clearWorkflow } from './workflow/workflowStorage.js'
import { WORKFLOW_STAGES } from './workflow/workflowConfig.js'
import StudioSettings from './studio/StudioSettings.jsx'
import { useStudioDNA } from './studio/useStudioDNA.js'
import './App.css'

function ProgressBar({ percent }) {
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}

function normalizeWorkflowStatus(status) {
  if (status === 'done' || status === 'completed') return 'completed'
  if (status === 'inprogress' || status === 'active') return 'active'
  if (status === 'available') return 'available'
  return 'locked'
}

function normalizeWorkflow(workflow) {
  const savedStages = Array.isArray(workflow) ? workflow : []

  let normalized = WORKFLOW_STAGES.map((configStage) => {
    const savedStage = savedStages.find((item) =>
      item?.id === configStage.id ||
      item?.name === configStage.label ||
      item?.name === configStage.id
    )

    if (!savedStage) {
      return {
        ...configStage,
        status:
          configStage.id === 'idea'
            ? 'completed'
            : configStage.id === 'research'
              ? 'active'
              : 'locked'
      }
    }

    return {
      ...savedStage,
      ...configStage,
      status: normalizeWorkflowStatus(savedStage.status)
    }
  })

  // Migration chỉ tiến trạng thái về phía trước; không hạ completed xuống active.
  normalized = normalized.map((stage) => {
    if (stage.status !== 'locked' || !stage.previousStage) return stage

    const previousStage = normalized.find(
      (candidate) => candidate.id === stage.previousStage
    )

    return previousStage?.status === 'completed'
      ? { ...stage, status: 'available' }
      : stage
  })

  return normalized
}

function ensureStoryboardFields(project) {
  return {
    ...project,
    humanizeObjective: project.humanizeObjective || '',
    naturalnessLevel: project.naturalnessLevel || '',
    narrationRhythm: project.narrationRhythm || '',
    retentionStyle: project.retentionStyle || '',
    humanizeMustPreserve: project.humanizeMustPreserve || '',
    humanizeMustAvoid: project.humanizeMustAvoid || '',
    generatedHumanizePrompt: project.generatedHumanizePrompt || '',
    humanizedScriptResult: project.humanizedScriptResult || '',
    humanizedScriptSaved: project.humanizedScriptSaved || false,
    // Voice Script fields
    voiceObjective: project.voiceObjective || '',
    narrationStyle: project.narrationStyle || '',
    pace: project.pace || '',
    pauseStrategy: project.pauseStrategy || '',
    emphasisStrategy: project.emphasisStrategy || '',
    pronunciationNotes: project.pronunciationNotes || '',
    voiceMustPreserve: project.voiceMustPreserve || '',
    voiceMustAvoid: project.voiceMustAvoid || '',
    generatedVoiceScriptPrompt: project.generatedVoiceScriptPrompt || '',
    voiceScriptResult: project.voiceScriptResult || '',
    voiceScriptSaved: project.voiceScriptSaved || false,
    generatedStoryboardPrompt: project.generatedStoryboardPrompt || '',
    rawStoryboardResult: project.rawStoryboardResult || '',
    storyboardScenes: Array.isArray(project.storyboardScenes) ? project.storyboardScenes : [],
    storyboardSaved: project.storyboardSaved || false
  }
}

function WorkflowSidebar({ workflow }) {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {workflow.map((s) => (
            <li key={s.id} className={`wf-${s.status}`}>
              <div className="wf-name">{s.label}</div>
              <div className="wf-status">{s.status === 'locked' ? 'Chưa mở khóa' : s.status === 'available' ? 'Sẵn sàng' : s.status === 'active' ? 'Đang thực hiện' : 'Hoàn thành'}</div>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

function ProjectDNACard({ dna }) {
  if (!dna) return null
  return (
    <div className="project-dna-card">
      <h3>Project DNA</h3>
      <div className="dna-grid">
        {Object.entries(dna).map(([key, value]) => (
          <div key={key} className="dna-item">
            <div className="dna-key">{key}</div>
            <div className="dna-value"><pre>{value}</pre></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Wizard({ open, onClose, onCreate }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    topic: '',
    market: 'Nhật Bản',
    language: 'Tiếng Nhật',
    duration: '15 phút',
    style: 'Analysis',
    audience: 'Khán giả Nhật Bản trưởng thành quan tâm đến kinh tế và xã hội',
    emotions: [],
  })

  if (!open) return null

  const emotionsList = ['Tò mò', 'Bất ngờ', 'Lo lắng', 'Hy vọng', 'Tranh luận']

  function update(f) {
    setData((d) => ({ ...d, ...f }))
  }

  function toggleEmotion(e) {
    setData((d) => ({
      ...d,
      emotions: d.emotions.includes(e) ? d.emotions.filter(x => x !== e) : [...d.emotions, e]
    }))
  }

  function canNext() {
    if (step === 1) return data.topic.trim().length > 0
    return true
  }

  function finish() {
    const project = {
      id: Date.now(),
      topic: data.topic,
      market: data.market,
      language: data.language,
      duration: data.duration,
      style: data.style,
      audience: data.audience,
      emotions: data.emotions,
      research: { goal: '', keyQuestions: '', sources: '', prompt: '', result: '', resultSaved: false },
      outline: { objective: '', coreArgument: '', mustInclude: '', avoid: '', prompt: '' }
    }
    onCreate(project)
  }

  return (
    <div className="wizard-overlay">
      <div className="wizard">
        <div className="wizard-header">
          <div className="wiz-progress">Bước {step}/4</div>
          <div className="wiz-bar"><div className="wiz-bar-fill" style={{ width: `${(step-1)/(4-1)*100}%`}}/></div>
        </div>

        <div className="wizard-body">
          {step === 1 && (
            <div className="wiz-step">
              <h2>Bạn muốn làm video về điều gì?</h2>
              <textarea placeholder="Ví dụ: Tại sao Nhật Bản ngày càng phụ thuộc vào lao động nước ngoài?" value={data.topic} onChange={e=>update({topic:e.target.value})} />
            </div>
          )}

          {step === 2 && (
            <div className="wiz-step">
              <h2>Thị trường và ngôn ngữ</h2>
              <div className="card-row">
                <div className="card-group">
                  <div className="label">Thị trường</div>
                  {['Nhật Bản','Quốc tế','Việt Nam'].map(m => (
                    <button key={m} className={`card ${data.market===m ? 'selected':''}`} onClick={()=>update({market:m})}>{m}</button>
                  ))}
                </div>
                <div className="card-group">
                  <div className="label">Ngôn ngữ</div>
                  {['Tiếng Nhật','Tiếng Anh','Tiếng Việt'].map(l => (
                    <button key={l} className={`card ${data.language===l ? 'selected':''}`} onClick={()=>update({language:l})}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wiz-step">
              <h2>Định dạng video</h2>
              <div className="card-group">
                <div className="label">Thời lượng</div>
                <div className="options">
                  {['5 phút','10 phút','15 phút','20 phút','30 phút'].map(d => (
                    <button key={d} className={`card ${data.duration===d ? 'selected':''}`} onClick={()=>update({duration:d})}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="card-group">
                <div className="label">Phong cách</div>
                <div className="options">
                  {['Analysis','Documentary','Storytelling','Educational','Debate'].map(s => (
                    <button key={s} className={`card ${data.style===s ? 'selected':''}`} onClick={()=>update({style:s})}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="wiz-step">
              <h2>Mục tiêu sản xuất</h2>
              <div className="label">Khán giả mục tiêu</div>
              <input value={data.audience} onChange={e=>update({audience:e.target.value})} />
              <div className="label">Cảm xúc</div>
              <div className="options emotions">
                {emotionsList.map(e => (
                  <button key={e} className={`card ${data.emotions.includes(e)?'selected':''}`} onClick={()=>toggleEmotion(e)}>{e}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="wizard-actions">
          <button className="btn ghost" onClick={onClose}>Hủy</button>
          <div className="spacer" />
          {step > 1 && <button className="btn" onClick={()=>setStep(s=>s-1)}>Quay lại</button>}
          {step < 4 && <button className="btn primary" onClick={()=>{ if(canNext()) setStep(s=>s+1) }} disabled={!canNext()}>Tiếp tục</button>}
          {step === 4 && <button className="btn primary" onClick={finish}>Tạo dự án và bắt đầu Research</button>}
        </div>
      </div>
    </div>
  )
}

const languageMap = {
  'Tiếng Nhật': 'Japanese',
  'Tiếng Anh': 'English',
  'Tiếng Việt': 'Vietnamese'
}

function ResearchView({ project, onUpdateResearch, onCompleteResearch }) {
  const [research, setResearch] = useState(project.research || { goal:'', keyQuestions:'', sources:'', prompt:'', result:'', resultSaved:false })
  const [resultText, setResultText] = useState(project.research?.result || '')
  const [saved, setSaved] = useState(project.research?.resultSaved || false)
  const [error, setError] = useState('')

  useEffect(() => {
    setResearch(project.research || { goal:'', keyQuestions:'', sources:'', prompt:'', result:'', resultSaved:false })
    setResultText(project.research?.result || '')
    setSaved(project.research?.resultSaved || false)
  }, [project.research])

  function updateResearchField(field, value) {
    const next = { ...research, [field]: value }
    setResearch(next)
    onUpdateResearch(next)
  }

  function generatePrompt() {
    try {
      const prompt = ResearchEngine.generate({
        topic: project.topic,
        objective: research.goal,
        language: project.language,
        market: project.market,
        audience: project.audience,
        keyQuestions: research.keyQuestions,
        sources: research.sources,
        emotions: project.emotions
      })
      const next = { ...research, prompt }
      setResearch(next)
      onUpdateResearch(next)
      setError('')
    } catch (err) {
      setError(err.message || 'Không thể tạo Research Prompt. Hãy kiểm tra lại thông tin.')
    }
  }

  function copyPrompt() {
    if (!research.prompt) return
    try { navigator.clipboard.writeText(research.prompt) } catch (e) { }
  }

  function saveResult() {
    if (resultText.trim().length < 500) {
      setError('Nội dung Research phải có ít nhất 500 ký tự.')
      return
    }
    const next = { ...research, result: resultText, resultSaved: true }
    setResearch(next)
    setSaved(true)
    setError('')
    onUpdateResearch(next)
  }

  function completeResearch() {
    if (resultText.trim().length < 500) {
      setError('Nội dung Research phải có ít nhất 500 ký tự.')
      return
    }
    if (!saved) {
      setError('Vui lòng lưu kết quả Research trước khi hoàn thành.')
      return
    }
    setError('')
    onCompleteResearch()
  }

  return (
    <div className="research-view">
      <div className="project-info">
        <h2>{project.topic}</h2>
        <div className="meta">{project.market} • {project.language} • {project.duration} • {project.style}</div>
        <div className="meta">Khán giả: {project.audience}</div>
        <div className="meta">Cảm xúc: {project.emotions.join(', ')}</div>
      </div>

      <ProjectDNACard dna={project.dna} />

      <div className="research-brief">
        <h3>Research Brief</h3>
        <label>Research goal</label>
        <input value={research.goal} onChange={e => updateResearchField('goal', e.target.value)} />
        <label>Key questions</label>
        <textarea value={research.keyQuestions} onChange={e => updateResearchField('keyQuestions', e.target.value)} />
        <label>Source requirements</label>
        <input value={research.sources} onChange={e => updateResearchField('sources', e.target.value)} />

        <div className="brief-actions">
          <button className="btn primary" onClick={generatePrompt}>Tạo Research Prompt</button>
          <button className="btn" onClick={copyPrompt}>Sao chép prompt</button>
          <button className="btn" onClick={() => window.open('https://gemini.google.com/app', '_blank')}>Mở Gemini</button>
        </div>

        <label>Generated Prompt</label>
        <textarea className="prompt-output" value={research.prompt} readOnly />

        <div className="research-result-panel">
          <h3>Research Result</h3>
          <textarea
            className="research-result"
            placeholder="Dán toàn bộ kết quả nghiên cứu từ Gemini vào đây..."
            value={resultText}
            onChange={e => setResultText(e.target.value)}
          />
          <div className="result-footer">
            <div className="char-count">{resultText.length} ký tự</div>
            {saved && <div className="saved-status">Đã lưu</div>}
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="brief-actions">
            <button className="btn" onClick={saveResult}>Lưu kết quả Research</button>
            <button className="btn primary" onClick={completeResearch}>Hoàn thành Research và tạo Outline</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OutlineView({ project, onUpdateOutline, onBackToResearch }) {
  const [outline, setOutline] = useState(project.outline || { objective:'', coreArgument:'', mustInclude:'', avoid:'', prompt:'' })
  const [showFull, setShowFull] = useState(false)
  const [error, setError] = useState('')
  const [outlineResultText, setOutlineResultText] = useState(project.outlineResult || '')
  const [outlineSavedState, setOutlineSavedState] = useState(project.outlineSaved || false)

  useEffect(() => {
    setOutline(project.outline || { objective:'', coreArgument:'', mustInclude:'', avoid:'', prompt:'' })
    setError('')
    setOutlineResultText(project.outlineResult || '')
    setOutlineSavedState(project.outlineSaved || false)
  }, [project.outline])

  useEffect(() => {
    const researchText = project.research?.result || ''
    if (!researchText.trim()) return

    const brief = generateOutlineBrief(researchText)
    const next = {
      ...outline,
      objective: brief.videoObjective,
      coreArgument: brief.coreArgument,
      mustInclude: brief.mustInclude,
      avoid: brief.avoid
    }

    setOutline(next)
    onUpdateOutline(next)
    saveProjectDNA()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.research?.result])

  function updateOutlineField(field, value) {
    const next = { ...outline, [field]: value }
    setOutline(next)
    onUpdateOutline(next)
  }

  function generateOutlinePrompt() {
    try {
      const prompt = OutlineEngine.generate({
        core: outline.coreArgument,
        objective: outline.objective,
        language: project.language,
        market: project.market,
        audience: project.audience,
        mustInclude: outline.mustInclude,
        avoid: outline.avoid,
        research: project.research?.result || ''
      })

      const next = { ...outline, prompt }
      setOutline(next)
      onUpdateOutline(next)
      // also persist generated prompt on project as generatedOutlinePrompt
      try { project.generatedOutlinePrompt = prompt } catch (e) {}
      setError('')
    } catch (err) {
      setError(err.message || 'Không thể tạo Outline Prompt. Hãy kiểm tra lại thông tin.')
    }
  }

  function copyPrompt() {
    if (!outline.prompt) return
    try { navigator.clipboard.writeText(outline.prompt) } catch (e) { }
  }

  function saveOutlineResult() {
    if (outlineResultText.trim().length < 800) {
      setError('Nội dung Outline phải có ít nhất 800 ký tự.')
      return
    }
    setOutlineSavedState(true)
    onUpdateOutline({ ...outline, outlineResult: outlineResultText, outlineSaved: true, generatedOutlinePrompt: outline.prompt })
    if (typeof project.onSaveOutlineResult === 'function') {
      project.onSaveOutlineResult({ outlineResult: outlineResultText, generatedOutlinePrompt: outline.prompt })
    }
    setError('')
  }

  function completeOutlineAndCreateScript() {
    // allow parent to handle completion which validates length and transitions
    if (outlineResultText.trim().length < 800) {
      setError('Nội dung Outline phải có ít nhất 800 ký tự.')
      return
    }
    onUpdateOutline({ ...outline, outlineResult: outlineResultText, outlineSaved: true, generatedOutlinePrompt: outline.prompt })
    if (typeof project.onSaveOutlineResult === 'function') {
      project.onSaveOutlineResult({ outlineResult: outlineResultText, generatedOutlinePrompt: outline.prompt })
    }
    // parent will perform completion and navigate
    if (typeof project.onCompleteOutline === 'function') {
      project.onCompleteOutline()
    }
  }

  const researchText = project.research?.result || ''
  const summary = researchText.slice(0, 1500)

  return (
    <div className="outline-view">
      <div className="project-info outline-info">
        <h3>Project Information</h3>
        <div className="meta-row"><span>Topic</span><span>{project.topic}</span></div>
        <div className="meta-row"><span>Market</span><span>{project.market}</span></div>
        <div className="meta-row"><span>Language</span><span>{project.language}</span></div>
        <div className="meta-row"><span>Duration</span><span>{project.duration}</span></div>
        <div className="meta-row"><span>Style</span><span>{project.style}</span></div>
        <div className="meta-row"><span>Audience</span><span>{project.audience}</span></div>
        <div className="meta-row"><span>Emotions</span><span>{project.emotions.join(', ')}</span></div>
      </div>

      <ProjectDNACard dna={project.dna} />

      <div className="outline-main">
        <div className="outline-summary-panel">
          <div className="summary-header">
            <h3>Research Summary</h3>
            <button className="btn ghost" onClick={() => setShowFull(!showFull)}>{showFull ? 'Thu gọn' : 'Xem toàn bộ Research'}</button>
          </div>
          <div className="summary-text">
            {showFull ? researchText : (summary || 'Chưa có Research Result để hiển thị.')}
            {!showFull && researchText.length > 1500 ? '...' : ''}
          </div>
        </div>

        <div className="outline-brief">
          <h3>Outline Brief</h3>
          <label>Video objective</label>
          <textarea value={outline.objective} onChange={e => updateOutlineField('objective', e.target.value)} placeholder="Người xem phải hiểu hoặc cảm nhận điều gì sau khi xem xong?" />
          <label>Core argument</label>
          <textarea value={outline.coreArgument} onChange={e => updateOutlineField('coreArgument', e.target.value)} placeholder="Luận điểm trung tâm của video là gì?" />
          <label>Must include</label>
          <textarea value={outline.mustInclude} onChange={e => updateOutlineField('mustInclude', e.target.value)} placeholder="Những dữ kiện, tranh luận hoặc ví dụ bắt buộc phải xuất hiện." />
          <label>Avoid</label>
          <textarea value={outline.avoid} onChange={e => updateOutlineField('avoid', e.target.value)} placeholder="Những cách diễn đạt, góc nhìn hoặc nội dung cần tránh." />

          <div className="brief-actions">
            <button className="btn primary" onClick={generateOutlinePrompt}>Tạo Outline Prompt</button>
            <button className="btn" onClick={copyPrompt}>Sao chép Outline Prompt</button>
            <button className="btn" onClick={() => window.open('https://gemini.google.com/app', '_blank')}>Mở Gemini</button>
            <button className="btn ghost" onClick={onBackToResearch}>Quay lại Research</button>
          </div>

          <label>Generated Outline Prompt</label>
          <textarea className="prompt-output outline-prompt" value={outline.prompt} readOnly />

          <div className="outline-result-panel">
            <h3>Outline Result</h3>
            <textarea
              className="outline-result"
              placeholder="Dán toàn bộ Outline từ Gemini vào đây..."
              value={outlineResultText}
              onChange={e => setOutlineResultText(e.target.value)}
            />
            <div className="result-footer">
              <div className="char-count">{outlineResultText.length} ký tự</div>
              {outlineSavedState && <div className="saved-status">Đã lưu kết quả Outline</div>}
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="brief-actions">
              <button className="btn" onClick={saveOutlineResult}>Lưu kết quả Outline</button>
              <button className="btn primary" onClick={completeOutlineAndCreateScript}>Hoàn thành Outline và tạo Script</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScriptView({ project, onUpdateScriptBrief, onGenerateScriptPrompt, onUpdateScriptResult, onSaveScript, onCompleteScript, onBackToOutline }) {
  const [brief, setBrief] = useState(project.scriptBrief || {
    scriptObjective: project.scriptObjective || project.dna?.storyStyle || 'Explain the core argument clearly',
    narrationTone: project.narrationTone || project.dna?.narrationStyle || 'Calm, intelligent, evidence-based',
    retentionStrategy: project.retentionStrategy || 'Start with a question and use curiosity gaps',
    mustPreserve: project.mustPreserve || project.dna?.contentRules || '',
    mustAvoid: project.mustAvoid || ''
  })

  const [outlinePreviewOpen, setOutlinePreviewOpen] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState(project.generatedScriptPrompt || '')
  const [scriptResult, setScriptResult] = useState(project.scriptResult || '')
  const [error, setError] = useState('')

  useEffect(() => {
    setBrief(project.scriptBrief || {
      scriptObjective: project.scriptObjective || project.dna?.storyStyle || 'Explain the core argument clearly',
      narrationTone: project.narrationTone || project.dna?.narrationStyle || 'Calm, intelligent, evidence-based',
      retentionStrategy: project.retentionStrategy || 'Start with a question and use curiosity gaps',
      mustPreserve: project.mustPreserve || project.dna?.contentRules || '',
      mustAvoid: project.mustAvoid || ''
    })
    setGeneratedPrompt(project.generatedScriptPrompt || '')
    setScriptResult(project.scriptResult || '')
  }, [project])

  function updateField(field, value) {
    const next = { ...brief, [field]: value }
    setBrief(next)
    onUpdateScriptBrief(next)
  }

  function updateScriptText(value) {
    setScriptResult(value)
    setError('')
    onUpdateScriptResult(value)
  }

  async function handleGeneratePrompt() {
    try {
      const prompt = ScriptEngine.generate({
        topic: project.topic,
        market: project.market,
        language: project.language,
        duration: project.duration,
        style: project.style,
        audience: project.audience,
        emotions: project.emotions,
        projectDNA: project.dna,
        scriptObjective: brief.scriptObjective,
        narrationTone: brief.narrationTone,
        retentionStrategy: brief.retentionStrategy,
        mustPreserve: brief.mustPreserve,
        mustAvoid: brief.mustAvoid,
        outlineResult: project.outlineResult || project.outline?.outlineResult || project.outline?.prompt || '',
        researchResult: project.research?.result || ''
      })
      setGeneratedPrompt(prompt)
      onGenerateScriptPrompt(prompt)
      setError('')
    } catch (err) {
      setError(err.message || 'Không thể tạo Script Prompt. Hãy kiểm tra lại thông tin.')
    }
  }

  function copyPrompt() {
    if (!generatedPrompt) return
    try { navigator.clipboard.writeText(generatedPrompt) } catch (e) { }
  }

  return (
    <div className="script-view">
      <div className="project-info">
        <h2>{project.topic}</h2>
        <div className="meta">{project.market} • {project.language} • {project.duration} • {project.style}</div>
      </div>

      <ProjectDNACard dna={project.dna} />

      <div className="outline-summary">
        <h3>Outline Summary</h3>
        <div className="outline-preview">
          { (project.outlineResult || project.outline?.prompt || '').slice(0,2000) }
        </div>
        <button className="btn" onClick={() => setOutlinePreviewOpen(!outlinePreviewOpen)}>{outlinePreviewOpen ? 'Thu gọn' : 'Xem toàn bộ Outline'}</button>
        {outlinePreviewOpen && (
          <div className="outline-full">
            <pre>{project.outlineResult || project.outline?.prompt || ''}</pre>
          </div>
        )}
      </div>

      <div className="script-brief">
        <h3>Script Brief</h3>
        <div className="script-brief-grid">
          <div className="field-group">
            <label>Script objective</label>
            <input value={brief.scriptObjective} onChange={e => updateField('scriptObjective', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Narration tone</label>
            <input value={brief.narrationTone} onChange={e => updateField('narrationTone', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Retention strategy</label>
            <input value={brief.retentionStrategy} onChange={e => updateField('retentionStrategy', e.target.value)} />
          </div>
        </div>
        <div className="script-brief-grid two-column">
          <div className="field-group">
            <label>Must preserve</label>
            <textarea value={brief.mustPreserve} onChange={e => updateField('mustPreserve', e.target.value)} />
          </div>
          <div className="field-group">
            <label>Must avoid</label>
            <textarea value={brief.mustAvoid} onChange={e => updateField('mustAvoid', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="brief-actions">
        <button className="btn primary" onClick={handleGeneratePrompt}>Tạo Script Prompt</button>
        <button className="btn" onClick={copyPrompt}>Sao chép Script Prompt</button>
        <button className="btn" onClick={() => window.open('https://gemini.google.com/app', '_blank')}>Mở Gemini</button>
        <button className="btn ghost" onClick={onBackToOutline}>Quay lại Outline</button>
      </div>

      <label>Generated Script Prompt</label>
      <textarea className="prompt-output script-prompt" value={generatedPrompt} readOnly style={{ minHeight: 480 }} />

      <div className="script-result-panel">
        <h3>SCRIPT RESULT</h3>
        <textarea
          className="script-result"
          placeholder="Dán toàn bộ Script từ Gemini vào đây..."
          value={scriptResult}
          onChange={e => updateScriptText(e.target.value)}
        />
        <div className="result-footer">
          <div className="char-count">{scriptResult.length} ký tự</div>
          {project.scriptSaved && <div className="saved-status">Đã lưu</div>}
        </div>
        <div className="brief-actions">
          <button className="btn" onClick={() => { onSaveScript(); }}>Lưu Script</button>
          <button className="btn primary" onClick={() => {
            const toast = onCompleteScript()
            if (toast) setError(toast)
          }}>Complete Script & Unlock Humanize</button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  )
}

function HumanizeView({ project, studioDNA, onUpdateHumanizedScript, onUpdateHumanizeSettings, onSaveHumanizedScript, onSaveGeneratedHumanizePrompt, onCompleteHumanize, onBackToScript, onBackToDashboard }) {
  const [text, setText] = useState(project.humanizedScriptResult || '')
  const [saved, setSaved] = useState(project.humanizedScriptSaved || false)
  const [showFullScript, setShowFullScript] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState(project.generatedHumanizePrompt || '')
  const [objective, setObjective] = useState(project.humanizeObjective || 'Make the script sound natural, spoken, intelligent and human.')
  const [naturalnessLevel, setNaturalnessLevel] = useState(project.naturalnessLevel || 'High')
  const [narrationRhythm, setNarrationRhythm] = useState(project.narrationRhythm || 'Calm with sentence-length variation')
  const [retentionStyle, setRetentionStyle] = useState(project.retentionStyle || 'Curiosity, contrast, rhetorical questions, smooth transitions')
  const [mustPreserve, setMustPreserve] = useState(project.humanizeMustPreserve || 'Facts, statistics, source meaning, neutrality, core argument')
  const [mustAvoid, setMustAvoid] = useState(project.humanizeMustAvoid || 'AI-sounding phrases, repetition, exaggerated emotion, invented facts')
  const [error, setError] = useState('')

  useEffect(() => {
    setText(project.humanizedScriptResult || '')
    setSaved(project.humanizedScriptSaved || false)
    setGeneratedPrompt(project.generatedHumanizePrompt || '')
    setObjective(project.humanizeObjective || 'Make the script sound natural, spoken, intelligent and human.')
    setNaturalnessLevel(project.naturalnessLevel || 'High')
    setNarrationRhythm(project.narrationRhythm || 'Calm with sentence-length variation')
    setRetentionStyle(project.retentionStyle || 'Curiosity, contrast, rhetorical questions, smooth transitions')
    setMustPreserve(project.humanizeMustPreserve || 'Facts, statistics, source meaning, neutrality, core argument')
    setMustAvoid(project.humanizeMustAvoid || 'AI-sounding phrases, repetition, exaggerated emotion, invented facts')
  }, [project.humanizedScriptResult, project.humanizedScriptSaved, project.generatedHumanizePrompt, project.humanizeObjective, project.naturalnessLevel, project.narrationRhythm, project.retentionStyle, project.humanizeMustPreserve, project.humanizeMustAvoid])

  function updateText(value) {
    setText(value)
    setError('')
    onUpdateHumanizedScript(value)
  }

  function updateField(field, value) {
    const next = {
      humanizeObjective: field === 'objective' ? value : objective,
      naturalnessLevel: field === 'naturalnessLevel' ? value : naturalnessLevel,
      narrationRhythm: field === 'narrationRhythm' ? value : narrationRhythm,
      retentionStyle: field === 'retentionStyle' ? value : retentionStyle,
      humanizeMustPreserve: field === 'mustPreserve' ? value : mustPreserve,
      humanizeMustAvoid: field === 'mustAvoid' ? value : mustAvoid
    }
    setObjective(next.humanizeObjective)
    setNaturalnessLevel(next.naturalnessLevel)
    setNarrationRhythm(next.narrationRhythm)
    setRetentionStyle(next.retentionStyle)
    setMustPreserve(next.humanizeMustPreserve)
    setMustAvoid(next.humanizeMustAvoid)
    onUpdateHumanizeSettings(next)
  }

  function generatePrompt() {
    try {
      const prompt = HumanizeEngine.generate({
        topic: project.topic,
        language: project.language,
        audience: project.audience,
        duration: project.duration,
        projectDNA: project.dna,
        studioDNA,
        scriptResult: project.scriptResult || '',
        humanizeObjective: objective,
        naturalnessLevel,
        narrationRhythm,
        retentionStyle,
        mustPreserve,
        mustAvoid
      })
      setGeneratedPrompt(prompt)
      onSaveGeneratedHumanizePrompt(prompt)
      setError('')
    } catch (err) {
      setError(err.message || 'Không thể tạo Humanize Prompt. Hãy kiểm tra lại thông tin.')
    }
  }

  function copyPrompt() {
    if (!generatedPrompt) return
    try { navigator.clipboard.writeText(generatedPrompt) } catch (e) {}
  }

  function openGemini() {
    window.open('https://gemini.google.com/app', '_blank')
  }

  function saveText() {
    if (text.trim().length < 3000) {
      setError('Humanized Script phải có ít nhất 3000 ký tự.')
      return
    }
    onSaveHumanizedScript()
    setSaved(true)
    setError('')
  }

  function complete() {
    const result = onCompleteHumanize()
    if (result) {
      setError(result)
    }
  }

  const originalScript = project.scriptResult || 'Không có Script gốc để xem.'

  return (
    <div className="humanize-view">
      <div className="project-info">
        <h2>{project.topic}</h2>
        <div className="meta">Humanize stage</div>
        <div className="meta">{project.market} • {project.language} • {project.duration} • {project.style}</div>
      </div>

      <ProjectDNACard dna={project.dna} />

      <div className="humanize-panel">
        <h3>Original Script</h3>
        <div className="outline-summary">
          <div className="outline-preview">{originalScript.slice(0, 1800)}</div>
          <button className="btn ghost" onClick={() => setShowFullScript(!showFullScript)}>{showFullScript ? 'Thu gọn Script' : 'Xem toàn bộ Script'}</button>
          {showFullScript && (
            <div className="outline-full"><pre>{originalScript}</pre></div>
          )}
        </div>

        <div className="humanize-brief">
          <h3>Humanize Brief</h3>
          <div className="script-brief-grid">
            <div className="field-group">
              <label>Humanize objective</label>
              <textarea value={objective} onChange={e => updateField('objective', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Naturalness level</label>
              <input value={naturalnessLevel} onChange={e => updateField('naturalnessLevel', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Narration rhythm</label>
              <input value={narrationRhythm} onChange={e => updateField('narrationRhythm', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Retention style</label>
              <textarea value={retentionStyle} onChange={e => updateField('retentionStyle', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Must preserve</label>
              <textarea value={mustPreserve} onChange={e => updateField('mustPreserve', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Must avoid</label>
              <textarea value={mustAvoid} onChange={e => updateField('mustAvoid', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="brief-actions">
          <button className="btn primary" onClick={generatePrompt}>Tạo Humanize Prompt</button>
          <button className="btn" onClick={copyPrompt}>Sao chép Humanize Prompt</button>
          <button className="btn" onClick={openGemini}>Mở Gemini</button>
          <button className="btn ghost" onClick={onBackToScript}>Quay lại Script</button>
          <button className="btn ghost" onClick={onBackToDashboard}>Về Dashboard</button>
        </div>

        <div className="humanize-prompt-panel">
          <label>Generated Humanize Prompt</label>
          <textarea className="prompt-output humanize-prompt" value={generatedPrompt} readOnly style={{ minHeight: 480 }} />
        </div>

        <div className="humanize-result-panel">
          <h3>Humanized Script Result</h3>
          <textarea
            className="humanize-text"
            placeholder="Dán toàn bộ Script đã Humanize từ Gemini vào đây..."
            value={text}
            onChange={e => updateText(e.target.value)}
          />
          <div className="result-footer">
            <div className="char-count">{text.length} ký tự</div>
            {saved && <div className="saved-status">Đã lưu</div>}
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="brief-actions">
            <button className="btn" onClick={saveText}>Lưu Humanized Script</button>
            <button className="btn primary" onClick={complete}>Hoàn thành Humanize và mở Storyboard</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function VoiceScriptView({ project, studioDNA, onUpdateVoiceBrief, onSaveGeneratedVoiceScriptPrompt, onGenerateVoiceScriptPrompt, onUpdateVoiceScriptResult, onSaveVoiceScript, onCompleteVoiceScript, onBackToHumanize, onBackToDashboard }) {
  const [prompt, setPrompt] = useState(project.generatedVoiceScriptPrompt || '')
  const [result, setResult] = useState(project.voiceScriptResult || '')
  const [saved, setSaved] = useState(project.voiceScriptSaved || false)
  const [showFullHumanized, setShowFullHumanized] = useState(false)
  const [voiceObjective, setVoiceObjective] = useState(project.voiceObjective || (project.dna?.coreIdea || 'Make narration conversational and clear'))
  const [narrationStyle, setNarrationStyle] = useState(project.narrationStyle || (studioDNA?.preferredNarrationStyle || 'Natural, measured'))
  const [pace, setPace] = useState(project.pace || 'Moderate')
  const [pauseStrategy, setPauseStrategy] = useState(project.pauseStrategy || 'Short pauses at commas, longer at paragraph ends')
  const [emphasisStrategy, setEmphasisStrategy] = useState(project.emphasisStrategy || 'Restrained emphasis for key facts')
  const [pronunciationNotes, setPronunciationNotes] = useState(project.pronunciationNotes || '')
  const [mustPreserve, setMustPreserve] = useState(project.voiceMustPreserve || 'Facts, statistics, source meaning')
  const [mustAvoid, setMustAvoid] = useState(project.voiceMustAvoid || 'Theatrical directions, invented facts')
  const [error, setError] = useState('')

  useEffect(() => {
    setPrompt(project.generatedVoiceScriptPrompt || '')
    setResult(project.voiceScriptResult || '')
    setSaved(project.voiceScriptSaved || false)
    setVoiceObjective(project.voiceObjective || (project.dna?.coreIdea || 'Make narration conversational and clear'))
    setNarrationStyle(project.narrationStyle || (studioDNA?.preferredNarrationStyle || 'Natural, measured'))
    setPace(project.pace || 'Moderate')
    setPauseStrategy(project.pauseStrategy || 'Short pauses at commas, longer at paragraph ends')
    setEmphasisStrategy(project.emphasisStrategy || 'Restrained emphasis for key facts')
    setPronunciationNotes(project.pronunciationNotes || '')
    setMustPreserve(project.voiceMustPreserve || 'Facts, statistics, source meaning')
    setMustAvoid(project.voiceMustAvoid || 'Theatrical directions, invented facts')
  }, [project.generatedVoiceScriptPrompt, project.voiceScriptResult, project.voiceScriptSaved, project.voiceObjective, project.narrationStyle, project.pace, project.pauseStrategy, project.emphasisStrategy, project.pronunciationNotes, project.voiceMustPreserve, project.voiceMustAvoid])

  function generatePrompt() {
    try {
      const p = VoiceScriptEngine.generate({
        topic: project.topic,
        language: project.language,
        audience: project.audience,
        duration: project.duration,
        projectDNA: project.dna,
        studioDNA,
        humanizedScriptResult: project.humanizedScriptResult || '',
        voiceObjective,
        narrationStyle,
        pace,
        pauseStrategy,
        emphasisStrategy,
        pronunciationNotes,
        mustPreserve,
        mustAvoid
      })
      setPrompt(p)
      onSaveGeneratedVoiceScriptPrompt(p)
      setError('')
    } catch (err) {
      setError(err.message || 'Không thể tạo Voice Script Prompt.')
    }
  }

  function copyPrompt() {
    if (!prompt) return
    try { navigator.clipboard.writeText(prompt) } catch (e) {}
  }

  function openGemini() { window.open('https://gemini.google.com/app', '_blank') }

  function saveResult() {
    if (result.trim().length < 3000) {
      setError('Voice Script phải có ít nhất 3000 ký tự.')
      return
    }
    onUpdateVoiceScriptResult(result)
    onSaveVoiceScript()
    setSaved(true)
    setError('')
  }

  function complete() {
    const r = onCompleteVoiceScript()
    if (r) setError(r)
  }

  return (
    <div className="voiceview">
      <div className="meta">Voice Script stage</div>
      <ProjectDNACard dna={project.dna} />

      <div className="humanized-preview">
        <h3>Humanized Script Preview</h3>
        <div className="preview-box">{ showFullHumanized ? project.humanizedScriptResult : (project.humanizedScriptResult || '').slice(0,2000) }</div>
        <button className="btn" onClick={() => setShowFullHumanized(!showFullHumanized)}>{showFullHumanized ? 'Thu gọn' : 'Xem toàn bộ Humanized Script'}</button>
      </div>

      <div className="voice-brief">
        <h3>Voice Script Brief</h3>
        <div className="field-group"><label>Voice objective</label><input value={voiceObjective} onChange={e=>{setVoiceObjective(e.target.value); onUpdateVoiceBrief({ voiceObjective: e.target.value })}}/></div>
        <div className="field-group"><label>Narration style</label><input value={narrationStyle} onChange={e=>{setNarrationStyle(e.target.value); onUpdateVoiceBrief({ narrationStyle: e.target.value })}}/></div>
        <div className="field-group"><label>Pace</label><input value={pace} onChange={e=>{setPace(e.target.value); onUpdateVoiceBrief({ pace: e.target.value })}}/></div>
        <div className="field-group"><label>Pause strategy</label><input value={pauseStrategy} onChange={e=>{setPauseStrategy(e.target.value); onUpdateVoiceBrief({ pauseStrategy: e.target.value })}}/></div>
        <div className="field-group"><label>Emphasis strategy</label><input value={emphasisStrategy} onChange={e=>{setEmphasisStrategy(e.target.value); onUpdateVoiceBrief({ emphasisStrategy: e.target.value })}}/></div>
        <div className="field-group"><label>Pronunciation notes</label><input value={pronunciationNotes} onChange={e=>{setPronunciationNotes(e.target.value); onUpdateVoiceBrief({ pronunciationNotes: e.target.value })}}/></div>
        <div className="field-group"><label>Must preserve</label><textarea value={mustPreserve} onChange={e=>{setMustPreserve(e.target.value); onUpdateVoiceBrief({ voiceMustPreserve: e.target.value })}}/></div>
        <div className="field-group"><label>Must avoid</label><textarea value={mustAvoid} onChange={e=>{setMustAvoid(e.target.value); onUpdateVoiceBrief({ voiceMustAvoid: e.target.value })}}/></div>
      </div>

      <div className="brief-actions">
        <button className="btn primary" onClick={generatePrompt}>Tạo Voice Script Prompt</button>
        <button className="btn" onClick={copyPrompt}>Sao chép Voice Script Prompt</button>
        <button className="btn" onClick={openGemini}>Mở Gemini</button>
        <button className="btn ghost" onClick={onBackToHumanize}>Quay lại Humanize</button>
        <button className="btn ghost" onClick={onBackToDashboard}>Về Dashboard</button>
      </div>

      <label>Generated Voice Script Prompt</label>
      <textarea className="prompt-output voice-prompt" value={prompt} readOnly style={{ minHeight: 480, width: '100%' }} />

      <div className="voice-result-panel">
        <h3>VOICE SCRIPT RESULT</h3>
        <textarea className="voice-result" placeholder="Dán toàn bộ Voice Script từ Gemini vào đây..." value={result} onChange={e=>setResult(e.target.value)} />
        <div className="result-footer">
          <div className="char-count">{result.length} ký tự</div>
          {saved && <div className="saved-status">Đã lưu</div>}
        </div>
        <div className="brief-actions">
          <button className="btn" onClick={saveResult}>Lưu Voice Script</button>
          <button className="btn primary" onClick={complete}>Hoàn thành Voice Script & Mở Storyboard</button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  )
}

function StoryboardView({ project, onGenerateStoryboardPrompt, onUpdateRawStoryboardResult, onUpdateStoryboardScenes, onSaveStoryboard, onBackToHumanize, onBackToDashboard }) {
  const [prompt, setPrompt] = useState(project.generatedStoryboardPrompt || '')
  const [rawStoryboard, setRawStoryboard] = useState(project.rawStoryboardResult || '')
  const [scenesText, setScenesText] = useState(JSON.stringify(project.storyboardScenes || [], null, 2))
  const [saved, setSaved] = useState(project.storyboardSaved || false)
  const [error, setError] = useState('')

  useEffect(() => {
    setPrompt(project.generatedStoryboardPrompt || '')
    setRawStoryboard(project.rawStoryboardResult || '')
    setScenesText(JSON.stringify(project.storyboardScenes || [], null, 2))
    setSaved(project.storyboardSaved || false)
    setError('')
  }, [project.generatedStoryboardPrompt, project.rawStoryboardResult, project.storyboardScenes, project.storyboardSaved])

  function generatePrompt() {
    try {
      const generated = StoryboardEngine.generate({
        topic: project.topic,
        language: project.language,
        market: project.market,
        duration: project.duration,
        style: project.style,
        audience: project.audience,
        emotions: project.emotions,
        humanizedScriptResult: project.humanizedScriptResult || project.scriptResult || ''
      })
      setPrompt(generated)
      onGenerateStoryboardPrompt(generated)
      setError('')
    } catch (err) {
      setError(err.message || 'Không thể tạo Storyboard Prompt. Hãy kiểm tra lại.')
    }
  }

  function updateRaw(value) {
    setRawStoryboard(value)
    onUpdateRawStoryboardResult(value)
    setSaved(false)
    setError('')
  }

  function updateScenes(value) {
  setScenesText(value)

  try {
    const parsed = JSON.parse(value)

    if (!Array.isArray(parsed)) {
      setError('Storyboard scenes phải là một mảng JSON.')
      return
    }

    const normalizedScenes = normalizeScenes(parsed)
    
    const validationErrors = validateStoryboardScenes(normalizedScenes)

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'))
      return
    }

    onUpdateStoryboardScenes(normalizedScenes)

    setSaved(false)
    setError('')
  } catch (err) {
    setError('Storyboard scenes phải là JSON hợp lệ.')
  }
}

  function saveStoryboard() {
  try {
    const parsed = JSON.parse(scenesText)

    if (!Array.isArray(parsed)) {
      setError('Storyboard scenes phải là một mảng JSON.')
      return
    }

    const normalizedScenes = normalizeScenes(parsed)
    const validationErrors = validateStoryboardScenes(normalizedScenes)

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'))
      return
    }

    onSaveStoryboard(normalizedScenes)

    setScenesText(
      JSON.stringify(normalizedScenes, null, 2)
    )

    setSaved(true)
    setError('')
  } catch (err) {
    setError('Storyboard scenes phải là JSON hợp lệ.')
  }
}

  return (
    <div className="storyboard-view">
      <div className="project-info">
        <h2>{project.topic}</h2>
        <div className="meta">Storyboard stage</div>
        <div className="meta">{project.market} • {project.language} • {project.duration} • {project.style}</div>
      </div>

      <ProjectDNACard dna={project.dna} />

      <div className="storyboard-panel">
        <div className="brief-actions">
          <button className="btn primary" onClick={generatePrompt}>Tạo Storyboard Prompt</button>
          <button className="btn ghost" onClick={onBackToHumanize}>Quay lại Humanize</button>
          <button className="btn ghost" onClick={onBackToDashboard}>Về Dashboard</button>
        </div>

        <div className="storyboard-prompt-section">
          <label>Generated Storyboard Prompt</label>
          <textarea className="prompt-output storyboard-prompt" value={prompt} readOnly style={{ minHeight: 180 }} />
        </div>

        <div className="storyboard-raw-section">
          <label>Raw Storyboard Result</label>
          <textarea
            className="storyboard-result"
            placeholder="Dán kết quả Storyboard từ Gemini vào đây..."
            value={rawStoryboard}
            onChange={e => updateRaw(e.target.value)}
            style={{ minHeight: 200 }}
          />
        </div>

        <div className="storyboard-scenes-section">
          <label>Storyboard Scenes (JSON Array)</label>
          <textarea
            className="storyboard-scenes"
            placeholder='[ {"scene":"Opening", "description":"..."} ]'
            value={scenesText}
            onChange={e => updateScenes(e.target.value)}
            style={{ minHeight: 200 }}
          />
        </div>

        <div className="result-footer">
          <div className="char-count">{rawStoryboard.length} ký tự</div>
          {saved && <div className="saved-status">Storyboard đã được lưu</div>}
        </div>
        {error && <div className="error-message">{error}</div>}

        <div className="brief-actions">
          <button className="btn" onClick={saveStoryboard}>Lưu Storyboard</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [projects, setProjects] = useState([])
  const [wizardOpen, setWizardOpen] = useState(false)
  const [viewProjectId, setViewProjectId] = useState(null)
  const [viewMode, setViewMode] = useState('dashboard')
  const [currentStage, setCurrentStage] = useState(null)
  const [message, setMessage] = useState('')
  const studioDNA = useStudioDNA()

  function openWizard() { setWizardOpen(true) }
  function closeWizard() { setWizardOpen(false) }
  
  function replaceProjectInState(nextProject) {
  setProjects(prev =>
    prev.map(project =>
      project.id === nextProject.id
        ? nextProject
        : project
    )
  )
}

 useEffect(() => {
  const storedProject = loadProject()
  const storedStage = loadCurrentStage()
  const storedDNA = loadProjectDNA()
  const storedWorkflow = loadWorkflow()

  if (!storedProject || !storedProject.id) {
    return
  }

  const workflowSource = Array.isArray(storedProject.workflow)
    ? storedProject.workflow
    : storedWorkflow

  const workflow = normalizeWorkflow(workflowSource)
  const normalizedProject = ensureStoryboardFields(storedProject)

  const projectWithDNA = {
    ...normalizedProject,
    workflow,
    dna:
      normalizedProject.dna ||
      storedDNA ||
      createProjectDNA(normalizedProject)
  }

  setProjects([projectWithDNA])
  setViewProjectId(projectWithDNA.id)

  // Lưu workflow đã migrate vào cả hai nơi.
  saveProject(projectWithDNA)
  saveWorkflow(workflow)

  setCurrentStage(storedStage)

  if (storedStage === 'research') {
    setViewMode('research')
  } else if (storedStage === 'outline') {
    setViewMode('outline')
  } else if (storedStage === 'script') {
    setViewMode('script')
  } else if (storedStage === 'humanize') {
    setViewMode('humanize')
  } else if (storedStage === 'voiceScript') {
    setViewMode('voiceScript')
  } else if (storedStage === 'storyboard') {
    setViewMode('storyboard')
  } else if (storedStage === 'imagePrompt') {
  setViewMode('imagePrompt')
  } else if (storedStage === 'geminiFlow') {
  setViewMode('geminiFlow')
} else if (storedStage === 'imageLibrary') {
  setViewMode('imageLibrary')
} else if (storedStage === 'capcutPackage') {
  setViewMode('capcutPackage')
} else {
  setViewMode('dashboard')
}
}, [])

  useEffect(() => {
    if (!viewProjectId) return
    const active = projects.find(p => p.id === viewProjectId)
    if (active) {
      saveProject(active)
    }
  }, [projects, viewProjectId])

  useEffect(() => {
    if (currentStage) {
      saveCurrentStage(currentStage)
    }
  }, [currentStage])

  function createProject(p) {
    const dna = createProjectDNA(p)
    const workflow = WorkflowEngine.createInitialWorkflow()
    const projectWithDNA = {
      ...p,
      dna,
      workflow,
      humanizeObjective: '',
      naturalnessLevel: '',
      narrationRhythm: '',
      retentionStyle: '',
      humanizeMustPreserve: '',
      humanizeMustAvoid: '',
      generatedHumanizePrompt: '',
      humanizedScriptResult: '',
      humanizedScriptSaved: false,
      // Voice Script defaults
      voiceObjective: '',
      narrationStyle: '',
      pace: '',
      pauseStrategy: '',
      emphasisStrategy: '',
      pronunciationNotes: '',
      voiceMustPreserve: '',
      voiceMustAvoid: '',
      generatedVoiceScriptPrompt: '',
      voiceScriptResult: '',
      voiceScriptSaved: false,
      generatedStoryboardPrompt: '',
      rawStoryboardResult: '',
      storyboardScenes: [],
      storyboardSaved: false
    }
    setProjects([projectWithDNA])
    setViewProjectId(projectWithDNA.id)
    setViewMode('research')
    setCurrentStage('research')
    setWizardOpen(false)
    saveProject(projectWithDNA)
    saveProjectDNA()
    saveWorkflow(workflow)
    saveCurrentStage('research')
  }

  function updateResearch(id, research) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, research } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function updateOutline(id, outline) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, outline } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function saveOutlineResult(id, outlinePayload) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...{ outlineResult: outlinePayload.outlineResult, outlineSaved: true, generatedOutlinePrompt: outlinePayload.generatedOutlinePrompt } } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function completeOutline(id) {
    const project = projects.find(p => p.id === id)
    if (!project) return
    const outlineText = project.outlineResult || project.outline?.outlineResult || project.outline?.result || ''
    if (outlineText.trim().length < 800) {
      setMessage('Nội dung Outline phải có ít nhất 800 ký tự.')
      return
    }

    // Save outline completed timestamp
    const completedAt = Date.now()

    // Mark outline stage completed
    const { workflow: completedWorkflow, error: completeError } = WorkflowEngine.completeStage(project.workflow, 'outline')
    if (completeError) {
      setMessage(completeError)
      return
    }

    // Enter script stage
    const { workflow: nextWorkflow, error: enterError } = WorkflowEngine.enterStage(completedWorkflow, 'script', project)
    if (enterError) {
      setMessage(enterError)
      return
    }

    // Persist project updates and workflow
    const nextProject = { ...project, outlineSaved: true, outlineResult: outlineText, outlineCompletedAt: completedAt, workflow: nextWorkflow }
    replaceProjectInState(nextProject)
    saveProject(nextProject)
    saveWorkflow(nextWorkflow)
    setCurrentStage('script')
    setViewMode('script')
    setMessage('')
  }

  function updateScriptBrief(id, brief) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, scriptBrief: brief, scriptObjective: brief.scriptObjective, narrationTone: brief.narrationTone, retentionStrategy: brief.retentionStrategy, mustPreserve: brief.mustPreserve, mustAvoid: brief.mustAvoid } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function updateScriptResult(id, scriptResult) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, scriptResult, scriptSaved: false } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function updateHumanizeSettings(id, updates) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function saveGeneratedHumanizePrompt(id, prompt) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, generatedHumanizePrompt: prompt } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function saveScript(id) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, scriptSaved: true } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
    setCurrentStage('script')
    setMessage('Script đã được lưu vào bộ nhớ.')
  }

  function completeScript(id) {
    const project = projects.find(p => p.id === id)
    if (!project) return 'Không tìm thấy dự án.'
    const scriptText = project.scriptResult || ''
    if (scriptText.trim().length < 3000) {
      return 'Vui lòng dán toàn bộ Script trước.'
    }

    const { workflow: completedWorkflow, error: completeError } = WorkflowEngine.completeStage(project.workflow, 'script')
    if (completeError) {
      return completeError
    }

    const { workflow: nextWorkflow, error: enterError } = WorkflowEngine.enterStage(completedWorkflow, 'humanize', project)
    if (enterError) {
      return enterError
    }

    const nextProject = { ...project, scriptSaved: true, workflow: nextWorkflow }
    replaceProjectInState(nextProject)
    saveProject(nextProject)
    saveWorkflow(nextWorkflow)
    setCurrentStage('humanize')
    setViewMode('humanize')
    setMessage('Script hoàn thành. Humanize đã được mở khóa.')
    return null
  }

  function updateHumanizedScript(id, humanizedScriptResult) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, humanizedScriptResult, humanizedScriptSaved: false } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function saveHumanizedScript(id) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, humanizedScriptSaved: true } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
    setCurrentStage('humanize')
    setMessage('Humanized Script đã được lưu vào bộ nhớ.')
  }

  function completeHumanize(id) {
    const project = projects.find(p => p.id === id)
    if (!project) return 'Không tìm thấy dự án.'
    const humanizedText = project.humanizedScriptResult || ''
    if (humanizedText.trim().length < 3000) {
      return 'Humanized Script phải có ít nhất 3000 ký tự.'
    }

    const { workflow: completedWorkflow, error: completeError } = WorkflowEngine.completeStage(project.workflow, 'humanize')
    if (completeError) {
      return completeError
    }

    const { workflow: nextWorkflow, error: enterError } = WorkflowEngine.enterStage(completedWorkflow, 'voiceScript', project)
    if (enterError) {
      return enterError
    }

    const nextProject = { ...project, humanizedScriptSaved: true, workflow: nextWorkflow }
    replaceProjectInState(nextProject)
    saveProject(nextProject)
    saveWorkflow(nextWorkflow)
    saveCurrentStage('voiceScript')
    setCurrentStage('voiceScript')
    setViewMode('voiceScript')
    setMessage('Humanize hoàn thành. Voice Script đã được mở khóa.')
    return null
  }

  function saveGeneratedScriptPrompt(id, prompt) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, generatedScriptPrompt: prompt } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function saveGeneratedVoiceScriptPrompt(id, prompt) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, generatedVoiceScriptPrompt: prompt } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function updateVoiceScriptResult(id, voiceScriptResult) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, voiceScriptResult, voiceScriptSaved: false } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function updateVoiceBrief(id, updates) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function saveVoiceScript(id) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, voiceScriptSaved: true } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
    setCurrentStage('voiceScript')
    setMessage('Voice Script đã được lưu vào bộ nhớ.')
  }

 function completeVoiceScript(id) {
  const project =
    projects.find(p => p.id === viewProjectId) ||
    projects.find(p => p.id === id)

  if (!project) return 'Không tìm thấy dự án.'

  const voiceText = project.voiceScriptResult || ''

  if (voiceText.trim().length < 3000) {
    return 'Voice Script phải có ít nhất 3000 ký tự.'
  }

  const stage =
    project.workflow &&
    project.workflow.find(s => s.id === 'voiceScript')

  if (!stage) {
    return 'Giai đoạn Voice Script không tồn tại trong workflow.'
  }

  let workingWorkflow = project.workflow

  // Nếu Voice Script chưa hoàn thành thì hoàn thành nó.
  // Nếu đã completed từ trước thì không báo lỗi nữa.
  if (stage.status === 'active' || stage.status === 'available') {
    const result = WorkflowEngine.completeStage(
      workingWorkflow,
      'voiceScript'
    )

    if (result.error) {
      return result.error
    }

    workingWorkflow = result.workflow
  } else if (stage.status !== 'completed') {
    return `Không thể hoàn thành Voice Script vì trạng thái hiện tại là '${stage.status}'.`
  }

  // Mở Storyboard
  const storyboardStage = workingWorkflow.find(
    s => s.id === 'storyboard'
  )

  if (!storyboardStage) {
    return 'Giai đoạn Storyboard không tồn tại trong workflow.'
  }

  // Storyboard phải trở thành stage đang thực hiện.
  workingWorkflow = workingWorkflow.map(stage => {
    if (stage.id === 'storyboard') {
      return {
        ...stage,
        status: 'active'
      }
    }

    if (stage.id === 'voiceScript') {
      return {
        ...stage,
        status: 'completed'
      }
    }

    return stage
  })

  const nextProject = {
    ...project,
    voiceScriptSaved: true,
    storyboardSaved: false,
    workflow: workingWorkflow
  }

  // Không xóa các project khác.
  setProjects(prev =>
    prev.map(p =>
      p.id === nextProject.id ? nextProject : p
    )
  )

  saveProject(nextProject)
  saveWorkflow(workingWorkflow)
  saveCurrentStage('storyboard')

  setCurrentStage('storyboard')
  setViewProjectId(nextProject.id)
  setViewMode('storyboard')

  setMessage(
    'Voice Script hoàn thành. Storyboard đã được mở khóa.'
  )

  return null
}

  function saveGeneratedStoryboardPrompt(id, prompt) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, generatedStoryboardPrompt: prompt } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function updateRawStoryboardResult(id, rawStoryboardResult) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, rawStoryboardResult } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

  function updateStoryboardScenes(id, storyboardScenes) {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, storyboardScenes, storyboardSaved: false } : p)
      const active = next.find(p => p.id === id)
      if (active) saveProject(active)
      return next
    })
  }

 function saveStoryboard(id, storyboardScenes) {
  const project = projects.find(item => item.id === id)

  if (!project) {
    setMessage('Không tìm thấy dự án.')
    return
  }

  const { workflow: completedWorkflow, error } =
    WorkflowEngine.completeStage(
      project.workflow,
      'storyboard'
    )

  if (error) {
    setMessage(error)
    return
  }

  const nextProject = {
    ...project,
    storyboardScenes,
    storyboardSaved: true,
    workflow: completedWorkflow
  }

  replaceProjectInState(nextProject)
  saveProject(nextProject)
  saveWorkflow(completedWorkflow)

  setMessage('Storyboard đã được lưu và hoàn thành.')
}

  function completeResearch(id) {
    const project = projects.find(p => p.id === id)
    if (!project) return
    const { workflow: completedWorkflow, error: completeError } = WorkflowEngine.completeStage(project.workflow, 'research')
    if (completeError) {
      setMessage(completeError)
      return
    }
    const { workflow: nextWorkflow, error: enterError } = WorkflowEngine.enterStage(completedWorkflow, 'outline', project)
    if (enterError) {
      setMessage(enterError)
      return
    }
    const nextProject = { ...project, workflow: nextWorkflow }
    replaceProjectInState(nextProject)
    saveProject(nextProject)
    saveWorkflow(nextWorkflow)
    setViewMode('outline')
    setCurrentStage('outline')
  }

  const activeProject = projects.find(p => p.id === viewProjectId)
  const outlineUnlocked = activeProject?.research?.resultSaved && activeProject?.research?.result?.trim().length >= 500
  const dashboardProject = activeProject || {
    topic: 'Nhật Bản và khủng hoảng lao động',
    market: 'Nhật Bản',
    duration: '15 phút'
  }
  const progressPercent = activeProject ? WorkflowEngine.getProgress(activeProject.workflow) : 17

  function handleOpenDashboard() {
  setViewMode('dashboard')
  setCurrentStage('dashboard')
  setMessage('')
  }

  function handleOpenResearch() {
    if (!activeProject) {
      setMessage('Tạo dự án mới để bắt đầu Research.')
      return
    }
    const { workflow: nextWorkflow, error } = WorkflowEngine.enterStage(activeProject.workflow, 'research', activeProject)
    if (error) {
      setMessage(error)
      return
    }
    const nextProject = { ...activeProject, workflow: nextWorkflow }
    replaceProjectInState(nextProject)
    setViewProjectId(activeProject.id)
    setViewMode('research')
    setCurrentStage('research')
    saveProject(nextProject)
    saveWorkflow(nextWorkflow)
    setMessage('')
  }

  function handleOpenOutline() {
    if (!activeProject) return
    const { workflow: nextWorkflow, error } = WorkflowEngine.enterStage(activeProject.workflow, 'outline', activeProject)
    if (error) {
      setMessage(error)
      return
    }
    const nextProject = { ...activeProject, workflow: nextWorkflow }
    replaceProjectInState(nextProject)
    setViewProjectId(activeProject.id)
    setViewMode('outline')
    setCurrentStage('outline')
    saveProject(nextProject)
    saveWorkflow(nextWorkflow)
    setMessage('')
  }

  function handleOpenScript() {
    if (!activeProject) return
    const { workflow: nextWorkflow, error } = WorkflowEngine.enterStage(activeProject.workflow, 'script', activeProject)
    if (error) {
      setMessage(error)
      return
    }
    const nextProject = { ...activeProject, workflow: nextWorkflow }
    replaceProjectInState(nextProject)
    setViewProjectId(activeProject.id)
    setViewMode('script')
    setCurrentStage('script')
    saveProject(nextProject)
    saveWorkflow(nextWorkflow)
    setMessage('')
  }

  function handleOpenHumanize() {
    if (!activeProject) return
    const { workflow: nextWorkflow, error } = WorkflowEngine.enterStage(activeProject.workflow, 'humanize', activeProject)
    if (error) {
      setMessage(error)
      return
    }
    const nextProject = { ...activeProject, workflow: nextWorkflow }
    replaceProjectInState(nextProject)
    setViewProjectId(activeProject.id)
    setViewMode('humanize')
    setCurrentStage('humanize')
    saveProject(nextProject)
    saveWorkflow(nextWorkflow)
    setMessage('')
  }

  function handleOpenVoiceScript() {
    if (!activeProject) return
    const { workflow: nextWorkflow, error } = WorkflowEngine.enterStage(activeProject.workflow, 'voiceScript', activeProject)
    if (error) {
      setMessage(error)
      return
    }
    const nextProject = { ...activeProject, workflow: nextWorkflow }
    replaceProjectInState(nextProject)
    setViewProjectId(activeProject.id)
    setViewMode('voiceScript')
    setCurrentStage('voiceScript')
    saveProject(nextProject)
    saveWorkflow(nextWorkflow)
    setMessage('')
  }

 function handleOpenStoryboard() {
  if (!activeProject) return

  const { workflow: nextWorkflow, error } =
    WorkflowEngine.enterStage(
      activeProject.workflow,
      'storyboard',
      activeProject
    )

  if (error) {
    setMessage(error)
    return
  }

  const nextProject = {
    ...activeProject,
    workflow: nextWorkflow
  }

  replaceProjectInState(nextProject)

  setViewProjectId(activeProject.id)
  setViewMode('storyboard')
  setCurrentStage('storyboard')

  saveProject(nextProject)
  saveWorkflow(nextWorkflow)

  setMessage('')
}

function handleOpenImagePrompt() {
  if (!activeProject) return

  const { workflow: nextWorkflow, error } =
    WorkflowEngine.enterStage(
      activeProject.workflow,
      'imagePrompt',
      activeProject
    )

  if (error) {
    setMessage(error)
    return
  }

  const nextProject = {
    ...activeProject,
    workflow: nextWorkflow
  }

  replaceProjectInState(nextProject)

  setViewProjectId(activeProject.id)
  setViewMode('imagePrompt')
  setCurrentStage('imagePrompt')

  saveProject(nextProject)
  saveWorkflow(nextWorkflow)

  setMessage('')
}
function handleOpenGeminiFlow() {
  if (!activeProject) return

  const { workflow: nextWorkflow, error } =
    WorkflowEngine.enterStage(
      activeProject.workflow,
      'geminiFlow',
      activeProject
    )

  if (error) {
    setMessage(error)
    return
  }

  const nextProject = {
    ...activeProject,
    workflow: nextWorkflow
  }

  replaceProjectInState(nextProject)

  setViewProjectId(activeProject.id)
  setViewMode('geminiFlow')
  setCurrentStage('geminiFlow')

  saveProject(nextProject)
  saveWorkflow(nextWorkflow)

  setMessage('')
}

function handleOpenImageLibrary() {
  if (!activeProject) return

  const { workflow: nextWorkflow, error } =
    WorkflowEngine.enterStage(
      activeProject.workflow,
      'imageLibrary',
      activeProject
    )

  if (error) {
    setMessage(error)
    return
  }

  const nextProject = {
    ...activeProject,
    workflow: nextWorkflow
  }

  replaceProjectInState(nextProject)

  setViewProjectId(activeProject.id)
  setViewMode('imageLibrary')
  setCurrentStage('imageLibrary')

  saveProject(nextProject)
  saveWorkflow(nextWorkflow)

  setMessage('')
}
function handleOpenCapCutPackage() {
  if (!activeProject) return

  const { workflow: nextWorkflow, error } =
    WorkflowEngine.enterStage(
      activeProject.workflow,
      'capcutPackage',
      activeProject
    )

  if (error) {
    setMessage(error)
    return
  }

  const nextProject = {
    ...activeProject,
    workflow: nextWorkflow
  }

  replaceProjectInState(nextProject)

  setViewProjectId(activeProject.id)
  setViewMode('capcutPackage')
  setCurrentStage('capcutPackage')

  saveProject(nextProject)
  saveWorkflow(nextWorkflow)

  setMessage('')
}
  function handleOpenProjectCard() {
  if (!activeProject) {
    setMessage('Tạo dự án mới để bắt đầu dự án thực tế.')
    return
  }

  const supportedStages = [
    'research',
    'outline',
    'script',
    'humanize',
    'voiceScript',
    'storyboard',
    'imagePrompt',
    'geminiFlow',
    'imageLibrary',
    'capcutPackage'
  ]

  setViewMode(
    supportedStages.includes(currentStage)
      ? currentStage
      : 'dashboard'
  )

  setMessage('')
}

  function handleResetProject() {
    if (!activeProject) return
    const confirmed = window.confirm('Bạn có chắc muốn xóa dự án hiện tại không? Hành động này sẽ xóa dữ liệu hiện tại trong trình duyệt.')
    if (!confirmed) return
    clearProject()
    clearWorkflow()
    setProjects([])
    setViewProjectId(null)
    setViewMode('dashboard')
    setCurrentStage(null)
    setMessage('Dự án đã được xóa. Quay về Dashboard.')
  }

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">
          <div className="logo-pill">AV</div>
          <div className="brand-text">
            <div className="product">AI Video Studio</div>
            <div className="sub">Project Alpha · Foundation</div>
          </div>
        </div>
        <div className="top-actions">
          <button className="btn new" onClick={openWizard}>Dự án mới</button>
          <button className="btn" onClick={() => setViewMode('studio')}>Studio Settings</button>
          {activeProject && (
            <>
              <button className="btn ghost" onClick={handleOpenDashboard}>Về Dashboard</button>
              <button className="btn" onClick={handleResetProject}>Xóa dự án hiện tại</button>
            </>
          )}
        </div>
      </header>

      <div className="layout">
        {activeProject ? <WorkflowSidebar workflow={activeProject.workflow} /> : (
          <aside className="sidebar">
            <nav>
              <ul>
                <li className="active">Dashboard</li>
                <li>Dự án</li>
                <li>Style Library</li>
                <li>Assets</li>
                <li>Settings</li>
              </ul>
            </nav>
          </aside>
        )}

        <main className="main">
          {message && <div className="global-message">{message}</div>}
          {viewMode === 'dashboard' && (
            <>
              <div className="main-header">
                <h1>Production Dashboard</h1>
                <p className="lead">Từ ý tưởng đến video sẵn sàng xuất bản.</p>
              </div>

              <section className="projects">
                <div className={`project-card clickable ${activeProject ? 'active' : ''}`} onClick={handleOpenProjectCard}>
                  <div className="card-row">
                    <div className="project-title">{dashboardProject.topic}</div>
                    <div className="project-meta">Thị trường: {dashboardProject.market} • Thời lượng: {dashboardProject.duration}</div>
                  </div>
                  <div className="card-row">
                    <ProgressBar percent={progressPercent} />
                    <div className="percent">{progressPercent}%</div>
                  </div>
                </div>
              </section>

              <section className="workflow">
                <h2>Workflow</h2>
                <div className="steps">
                  {activeProject?.workflow?.map((stage, i) => {
                    const action =
  stage.id === 'research'
    ? handleOpenResearch
    : stage.id === 'outline'
      ? handleOpenOutline
      : stage.id === 'script'
        ? handleOpenScript
        : stage.id === 'humanize'
          ? handleOpenHumanize
          : stage.id === 'voiceScript'
            ? handleOpenVoiceScript
            : stage.id === 'storyboard'
              ? handleOpenStoryboard
              : stage.id === 'imagePrompt'
                ? handleOpenImagePrompt
                : stage.id === 'geminiFlow'
  ? handleOpenGeminiFlow
  : stage.id === 'imageLibrary'
  ? handleOpenImageLibrary
  : stage.id === 'capcutPackage'
    ? handleOpenCapCutPackage
    : undefined
                    const disabled = stage.id === 'outline' && !outlineUnlocked
                    const label = stage.label || stage.name || `Stage ${i + 1}`
                    return (
                      <div
                        key={stage.id || label}
                        className={`step ${stage.status === 'completed' ? 'done' : stage.status === 'active' ? 'inprogress' : 'todo'} ${action ? 'clickable' : ''} ${disabled ? 'disabled' : ''}`}
                        onClick={disabled ? undefined : action}
                      >
                        <div className="step-index">{i + 1}</div>
                        <div className="step-body">
                          <div className="step-label">{label}</div>
                          <div className="step-status">{stage.status === 'completed' ? 'Hoàn thành' : stage.status === 'active' ? 'Đang thực hiện' : stage.status === 'available' ? 'Sẵn sàng' : 'Chưa mở khóa'}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </>
          )}

          {activeProject && viewMode === 'research' && (
            <ResearchView project={activeProject} onUpdateResearch={(r)=>updateResearch(activeProject.id, r)} onCompleteResearch={()=>completeResearch(activeProject.id)} />
          )}

          {activeProject && viewMode === 'outline' && (
            <OutlineView
              project={{ ...activeProject, onCompleteOutline: () => completeOutline(activeProject.id), onSaveOutlineResult: (payload) => saveOutlineResult(activeProject.id, payload) }}
              onUpdateOutline={(outline)=> { updateOutline(activeProject.id, outline); }}
              onBackToResearch={() => { setViewMode('research'); setCurrentStage('research') }}
            />
          )}

          {activeProject && viewMode === 'script' && (
            <ScriptView
              project={activeProject}
              onUpdateScriptBrief={(brief) => updateScriptBrief(activeProject.id, brief)}
              onUpdateScriptResult={(scriptResult) => updateScriptResult(activeProject.id, scriptResult)}
              onSaveScript={() => saveScript(activeProject.id)}
              onCompleteScript={() => completeScript(activeProject.id)}
              onGenerateScriptPrompt={(prompt) => saveGeneratedScriptPrompt(activeProject.id, prompt)}
              onBackToOutline={() => { setViewMode('outline'); setCurrentStage('outline') }}
            />
          )}
          {activeProject && viewMode === 'humanize' && (
            <HumanizeView
              project={activeProject}
              studioDNA={studioDNA.dna}
              onUpdateHumanizedScript={(value) => updateHumanizedScript(activeProject.id, value)}
              onUpdateHumanizeSettings={(updates) => updateHumanizeSettings(activeProject.id, updates)}
              onSaveGeneratedHumanizePrompt={(prompt) => saveGeneratedHumanizePrompt(activeProject.id, prompt)}
              onSaveHumanizedScript={() => saveHumanizedScript(activeProject.id)}
              onCompleteHumanize={() => completeHumanize(activeProject.id)}
              onBackToScript={() => { setViewMode('script'); setCurrentStage('script') }}
              onBackToDashboard={handleOpenDashboard}
            />
          )}
          {activeProject && viewMode === 'voiceScript' && (
            <VoiceScriptView
              project={activeProject}
              studioDNA={studioDNA.dna}
              onUpdateVoiceBrief={(updates) => updateVoiceBrief(activeProject.id, updates)}
              onSaveGeneratedVoiceScriptPrompt={(prompt) => saveGeneratedVoiceScriptPrompt(activeProject.id, prompt)}
              onUpdateVoiceScriptResult={(raw) => updateVoiceScriptResult(activeProject.id, raw)}
              onSaveVoiceScript={() => saveVoiceScript(activeProject.id)}
              onCompleteVoiceScript={() => completeVoiceScript(activeProject.id)}
              onBackToHumanize={() => { setViewMode('humanize'); setCurrentStage('humanize') }}
              onBackToDashboard={() => { setViewMode('dashboard'); setMessage('') }}
            />
          )}
          {activeProject && viewMode === 'storyboard' && (
  <StoryboardView
    project={activeProject}
    onGenerateStoryboardPrompt={(prompt) =>
      saveGeneratedStoryboardPrompt(activeProject.id, prompt)
    }
    onUpdateRawStoryboardResult={(raw) =>
      updateRawStoryboardResult(activeProject.id, raw)
    }
    onUpdateStoryboardScenes={(scenes) =>
      updateStoryboardScenes(activeProject.id, scenes)
    }
    onSaveStoryboard={(scenes) =>
      saveStoryboard(activeProject.id, scenes)
    }
    onBackToHumanize={() => {
      setViewMode('humanize')
      setCurrentStage('humanize')
    }}
    onBackToDashboard={() => {
      setViewMode('dashboard')
      setMessage('')
    }}
  />
)}

{activeProject && viewMode === 'imagePrompt' && (
  <ImagePromptController
    project={activeProject}

    onProjectChange={(nextProject) => {
      replaceProjectInState(nextProject)
      saveProject(nextProject)

     if (Array.isArray(nextProject.workflow)) {
      saveWorkflow(nextProject.workflow)
     }
    }}

    onBackToStoryboard={() => {
      setViewMode('storyboard')
      setCurrentStage('storyboard')
    }}

    onBackToDashboard={() => {
      setViewMode('dashboard')
      setMessage('')
    }}
  />
)}
{activeProject && viewMode === 'geminiFlow' && (
  <GeminiFlowController
    project={activeProject}

    onProjectChange={(nextProject) => {
      replaceProjectInState(nextProject)
      saveProject(nextProject)

      if (Array.isArray(nextProject.workflow)) {
        saveWorkflow(nextProject.workflow)
      }
    }}

    onBackToImagePrompt={() => {
      setViewMode('imagePrompt')
      setCurrentStage('imagePrompt')
    }}

    onBackToDashboard={handleOpenDashboard}
  />
)}
 {activeProject && viewMode === 'imageLibrary' && (
  <ImageLibraryController
    project={activeProject}

    onProjectChange={(nextProject) => {
      replaceProjectInState(nextProject)
      saveProject(nextProject)

      if (Array.isArray(nextProject.workflow)) {
        saveWorkflow(nextProject.workflow)
      }
    }}

    onBackToGeminiFlow={() => {
      setViewMode('geminiFlow')
      setCurrentStage('geminiFlow')
    }}

    onBackToDashboard={handleOpenDashboard}
  />
)}
{activeProject && viewMode === 'capcutPackage' && (
  <CapCutPackageController
    project={activeProject}

    onProjectChange={(nextProject) => {
      replaceProjectInState(nextProject)
      saveProject(nextProject)

      if (Array.isArray(nextProject.workflow)) {
        saveWorkflow(nextProject.workflow)
      }
    }}

    onBackToImageLibrary={() => {
      setViewMode('imageLibrary')
      setCurrentStage('imageLibrary')
    }}

    onBackToDashboard={handleOpenDashboard}
  />
)}
          {viewMode === 'studio' && (
            <StudioSettings />
          )}
        </main>
      </div>

      <Wizard open={wizardOpen} onClose={()=>setWizardOpen(false)} onCreate={createProject} />
    </div>
  )
}
