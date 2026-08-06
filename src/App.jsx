import './App.css'

function ProgressBar({ percent }) {
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}

function Step({ index, label, status }) {
  return (
    <div className={`step ${status}`}>
      <div className="step-index">{index}</div>
      <div className="step-body">
        <div className="step-label">{label}</div>
        <div className="step-status">{status === 'done' ? 'Hoàn thành' : status === 'inprogress' ? 'Đang thực hiện' : 'Chưa bắt đầu'}</div>
      </div>
    </div>
  )
}

export default function App() {
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
          <button className="btn new">Dự án mới</button>
        </div>
      </header>

      <div className="layout">
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

        <main className="main">
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
              {[
                ['Idea', 'done'],
                ['Research', 'inprogress'],
                ['Outline', 'todo'],
                ['Script', 'todo'],
                ['Humanize', 'todo'],
                ['Voice Script', 'todo'],
                ['Storyboard', 'todo'],
                ['Image Prompt', 'todo'],
                ['Gemini Flow', 'todo'],
                ['Image Library', 'todo'],
                ['CapCut Package', 'todo'],
                ['Publish', 'todo'],
              ].map(([label, status], i) => (
                <Step key={label} index={i + 1} label={label} status={status} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
