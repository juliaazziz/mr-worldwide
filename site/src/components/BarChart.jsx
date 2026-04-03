import './BarChart.css'

export default function BarChart({ data, horizontal = false, showValue = false, decimal = false }) {
  const maxVal = Math.max(...data.map(d => d.max || d.value), 1)

  if (horizontal) {
    return (
      <div className="bar-chart-h">
        {data.map((d, i) => (
          <div className="bar-row" key={d.label} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="bar-label-h">{d.label}</div>
            <div className="bar-track-h">
              <div
                className="bar-fill-h"
                style={{
                  width: `${(d.value / maxVal) * 100}%`,
                  background: d.color || 'var(--gold)',
                }}
              />
            </div>
            <div className="bar-val-h">
              {decimal ? d.value.toFixed(2) : d.value}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bar-chart-v">
      {data.map((d, i) => (
        <div className="bar-col" key={d.label} style={{ animationDelay: `${i * 60}ms` }}>
          <div className="bar-track-v">
            <div
              className="bar-fill-v"
              style={{
                height: `${(d.value / maxVal) * 100}%`,
                background: d.color || 'var(--gold)',
              }}
            />
          </div>
          <div className="bar-label-v">{d.label}</div>
        </div>
      ))}
    </div>
  )
}
