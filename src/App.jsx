import { useState, useEffect } from 'react'
import { ResearchEngine, OutlineEngine } from './brain'
import { generateOutlineBrief } from './lib/outlineBrain.js'
import { createProjectDNA, loadProjectDNA, saveProjectDNA } from './lib/projectDNA.js'
import { saveProject, loadProject, clearProject, saveCurrentStage, loadCurrentStage } from './utils/projectStorage.js'
import './App.css'

function ProgressBar({ percent }) {
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}

function WorkflowSidebar({ workflow }) {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {workflow.map((s) => (
            <li key={s.name} className={`wf-${s.status}`}>
              <div className="wf-name">{s.name}</div>
              <div className="wf-status">{s.status === 'done' ? 'Hoàn thành' : s.status === 'inprogress' ? 'Đang thực hiện' : 'Chưa bắt đầu'}</div>
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
      workflow: [
        'Idea','Research','Outline','Script','Humanize','Voice Script','Storyboard','Image Prompt','Gemini Flow','Image Library','CapCut Package','Publish'
      ].map((name, i) => ({ name, status: i === 0 ? 'done' : i === 1 ? 'inprogress' : 'todo' })),
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

  useEffect(() => {
    setOutline(project.outline || { objective:'', coreArgument:'', mustInclude:'', avoid:'', prompt:'' })
    setError('')
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
      setError('')
    } catch (err) {
      setError(err.message || 'Không thể tạo Outline Prompt. Hãy kiểm tra lại thông tin.')
    }
  }

  function copyPrompt() {
    if (!outline.prompt) return
    try { navigator.clipboard.writeText(outline.prompt) } catch (e) { }
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

  function openWizard() { setWizardOpen(true) }
  function closeWizard() { setWizardOpen(false) }

  useEffect(() => {
    const storedProject = loadProject()
    const storedStage = loadCurrentStage()
    const storedDNA = loadProjectDNA()
    if (storedProject && storedProject.id) {
      const projectWithDNA = storedProject.dna ? storedProject : { ...storedProject, dna: storedDNA || createProjectDNA(storedProject) }
      if (!projectWithDNA.dna) {
        projectWithDNA.dna = createProjectDNA(storedProject)
      }
      setProjects([projectWithDNA])
      setViewProjectId(projectWithDNA.id)
      if (!projectWithDNA.dna) {
        saveProjectDNA()
      }
      setCurrentStage(storedStage)
      if (storedStage === 'outline') {
        setViewMode('outline')
      } else if (storedStage === 'research') {
        setViewMode('research')
      } else {
        setViewMode('dashboard')
      }
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
    const projectWithDNA = { ...p, dna }
    setProjects([projectWithDNA])
    setViewProjectId(projectWithDNA.id)
    setViewMode('research')
    setCurrentStage('research')
    setWizardOpen(false)
    saveProject(projectWithDNA)
    saveProjectDNA()
    saveCurrentStage('research')
  }

  function updateResearch(id, research) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, research } : p))
  }

  function updateOutline(id, outline) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, outline } : p))
  }

  function completeResearch(id) {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p
      const workflow = p.workflow.map((step) => {
        if (step.name === 'Idea') return { ...step, status: 'done' }
        if (step.name === 'Research') return { ...step, status: 'done' }
        if (step.name === 'Outline') return { ...step, status: 'inprogress' }
        return { ...step, status: 'todo' }
      })
      return { ...p, workflow }
    }))
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
  const progressPercent = activeProject ? Math.round((activeProject.workflow.filter(s => s.status === 'done').length / activeProject.workflow.length) * 100) : 17

  function handleOpenDashboard() {
    setViewMode('dashboard')
    setMessage('')
  }

  function handleOpenResearch() {
    if (!activeProject) {
      setMessage('Tạo dự án mới để bắt đầu Research.')
      return
    }
    setViewProjectId(activeProject.id)
    setViewMode('research')
    setCurrentStage('research')
    setMessage('')
  }

  function handleOpenOutline() {
    if (!activeProject) return
    const researchDone = activeProject.research?.resultSaved && activeProject.research?.result?.trim().length >= 500
    if (!researchDone) {
      setMessage('Outline chỉ mở sau khi Research đã hoàn thành và lưu kết quả.')
      return
    }
    setViewProjectId(activeProject.id)
    setViewMode('outline')
    setCurrentStage('outline')
    setMessage('')
  }

  function handleOpenProjectCard() {
    if (!activeProject) {
      setMessage('Tạo dự án mới để bắt đầu dự án thực tế.')
      return
    }
    if (currentStage === 'outline') {
      setViewMode('outline')
    } else {
      setViewMode('research')
    }
    setMessage('')
  }

  function handleResetProject() {
    if (!activeProject) return
    const confirmed = window.confirm('Bạn có chắc muốn xóa dự án hiện tại không? Hành động này sẽ giữ lại dự án mới nhưng xóa trạng thái hiện tại.')
    if (!confirmed) return
    clearProject()
    setProjects([])
    setViewProjectId(null)
    setViewMode('dashboard')
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
                  {['Idea','Research','Outline','Script','Humanize','Voice Script','Storyboard','Image Prompt','Gemini Flow','Image Library','CapCut Package','Publish'].map((label,i)=> {
                    const action = label === 'Research' ? handleOpenResearch : label === 'Outline' ? handleOpenOutline : undefined
                    const disabled = label === 'Outline' && !outlineUnlocked
                    return (
                      <div
                        key={label}
                        className={`step ${i===0? 'done': i===1? 'inprogress':'todo'} ${action ? 'clickable' : ''} ${disabled ? 'disabled' : ''}`}
                        onClick={disabled ? undefined : action}
                      >
                        <div className="step-index">{i+1}</div>
                        <div className="step-body">
                          <div className="step-label">{label}</div>
                          <div className="step-status">{i===0? 'Hoàn thành': i===1? 'Đang thực hiện':'Chưa bắt đầu'}</div>
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
            <OutlineView project={activeProject} onUpdateOutline={(outline)=>updateOutline(activeProject.id, outline)} onBackToResearch={() => { setViewMode('research'); setCurrentStage('research') }} />
          )}
        </main>
      </div>

      <Wizard open={wizardOpen} onClose={()=>setWizardOpen(false)} onCreate={createProject} />
    </div>
  )
}
