import { useState } from 'react'
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
          {workflow.map((s, i) => (
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
    // create project and start research
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
      research: { goal: '', keyQuestions: '', sources: '', prompt: '' }
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

function ResearchView({ project, onUpdateResearch }) {
  const [research, setResearch] = useState(project.research || { goal:'', keyQuestions:'', sources:'', prompt:'' })

  function generatePrompt() {
    // Map display language to English target language phrase
    const langMap = {
      'Tiếng Nhật': 'Japanese',
      'Tiếng Anh': 'English',
      'Tiếng Việt': 'Vietnamese'
    }

    const outputLang = langMap[project.language] || project.language || 'English'

    const systemInstruction = `SYSTEM INSTRUCTION:\nYou are a senior research analyst specializing in creating high-quality research for professional YouTube documentary channels.\n\nYour responsibilities:\n- Perform deep research.\n- Use reliable and up-to-date sources.\n- Distinguish facts, assumptions and opinions.\n- Never fabricate statistics.\n- Never fabricate references.\n- Mention publication dates whenever possible.\n- Present both supporting and opposing viewpoints.\n- Clearly indicate uncertainty if evidence is insufficient.\n\nYour final goal is to help produce a documentary-quality YouTube video.`

    const projectBrief = []
    projectBrief.push('PROJECT BRIEF:')
    projectBrief.push(`Topic: ${project.topic}`)
    projectBrief.push(`Target Market: ${project.market}`)
    projectBrief.push(`Output Language: ${project.language}`)
    projectBrief.push(`Video Length: ${project.duration}`)
    projectBrief.push(`Style: ${project.style}`)
    projectBrief.push(`Audience: ${project.audience}`)
    projectBrief.push(`Desired Emotions: ${project.emotions && project.emotions.length ? project.emotions.join(', ') : 'None'}`)

    projectBrief.push('\nResearch Goal')
    projectBrief.push(research.goal || '')
    projectBrief.push('\nKey Questions')
    projectBrief.push(research.keyQuestions || '')
    projectBrief.push('\nSource Requirements')
    projectBrief.push(research.sources || '')

    const outputDirective = `VERY IMPORTANT\nReturn EVERYTHING in ${outputLang}.\nDo not translate the topic unless necessary.`

    const structure = `Return the research using the following structure.\n\n1. Executive Summary\n\n2. Background\n\n3. Timeline\n\n4. Key Facts\n\n5. Latest Statistics\n\n6. Government Policies\n\n7. Supporting Arguments\n\n8. Opposing Arguments\n\n9. Potential Risks\n\n10. Future Scenarios\n\n11. Important Quotes\n\n12. Recommended Video Hooks\n\n13. Recommended Story Structure\n\n14. List of Sources`

    const p = [
      systemInstruction,
      '',
      projectBrief.join('\n'),
      '',
      '==========================',
      '',
      structure,
      '',
      outputDirective
    ].join('\n\n')

    const newResearch = { ...research, prompt: p }
    setResearch(newResearch)
    onUpdateResearch(newResearch)
  }

  function copyPrompt() {
    if (!research.prompt) return
    try { navigator.clipboard.writeText(research.prompt) } catch(e){ }
  }

  return (
    <div className="research-view">
      <div className="project-info">
        <h2>{project.topic}</h2>
        <div className="meta">{project.market} • {project.language} • {project.duration} • {project.style}</div>
        <div className="meta">Khán giả: {project.audience}</div>
        <div className="meta">Cảm xúc: {project.emotions.join(', ')}</div>
      </div>

      <div className="research-brief">
        <h3>Research Brief</h3>
        <label>Research goal</label>
        <input value={research.goal} onChange={e=>setResearch(r=>({...r,goal:e.target.value}))} />
        <label>Key questions</label>
        <textarea value={research.keyQuestions} onChange={e=>setResearch(r=>({...r,keyQuestions:e.target.value}))} />
        <label>Source requirements</label>
        <input value={research.sources} onChange={e=>setResearch(r=>({...r,sources:e.target.value}))} />

        <div className="brief-actions">
          <button className="btn primary" onClick={generatePrompt}>Tạo Research Prompt</button>
          <button className="btn" onClick={copyPrompt}>Sao chép prompt</button>
          <button className="btn" onClick={()=>window.open('https://gemini.google.com/app','_blank')}>Mở Gemini</button>
        </div>

        <label>Generated Prompt</label>
        <textarea className="prompt-output" value={research.prompt} readOnly />
      </div>
    </div>
  )
}

export default function App() {
  const [projects, setProjects] = useState([])
  const [wizardOpen, setWizardOpen] = useState(false)
  const [viewProjectId, setViewProjectId] = useState(null)

  function openWizard() { setWizardOpen(true) }
  function closeWizard() { setWizardOpen(false) }

  function createProject(p) {
    setProjects(prev => [p, ...prev])
    setViewProjectId(p.id)
    setWizardOpen(false)
  }

  function updateResearch(id, research) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, research } : p))
  }

  const activeProject = projects.find(p => p.id === viewProjectId)

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
          {!activeProject && (
            <>
              <div className="main-header">
                <h1>Production Dashboard</h1>
                <p className="lead">Từ ý tưởng đến video sẵn sàng xuất bản.</p>
              </div>

              <section className="projects">
                <div className="project-card">
                  <div className="card-row">
                    <div className="project-title">Nhật Bản và khủng hoảng lao động</div>
                    <div className="project-meta">Thị trường: Nhật Bản • Thời lượng: 15 phút</div>
                  </div>
                  <div className="card-row">
                    <ProgressBar percent={17} />
                    <div className="percent">17%</div>
                  </div>
                </div>
              </section>

              <section className="workflow">
                <h2>Workflow</h2>
                <div className="steps">
                  {['Idea','Research','Outline','Script','Humanize','Voice Script','Storyboard','Image Prompt','Gemini Flow','Image Library','CapCut Package','Publish'].map((label,i)=> (
                    <div key={label} className={`step ${i===0? 'done': i===1? 'inprogress':'todo'}`}>
                      <div className="step-index">{i+1}</div>
                      <div className="step-body">
                        <div className="step-label">{label}</div>
                        <div className="step-status">{i===0? 'Hoàn thành': i===1? 'Đang thực hiện':'Chưa bắt đầu'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeProject && (
            <ResearchView project={activeProject} onUpdateResearch={(r)=>updateResearch(activeProject.id, r)} />
          )}
        </main>
      </div>

      <Wizard open={wizardOpen} onClose={()=>setWizardOpen(false)} onCreate={createProject} />
    </div>
  )
}
