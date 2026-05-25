import { chartConfigOptions } from '../features/config/reportConfig';
import type { ReportConfig } from '../lib/types';

type ChartConfigPanelProps = {
  config: ReportConfig;
  onConfigChange: (config: ReportConfig) => void;
};

export function ChartConfigPanel({ config, onConfigChange }: ChartConfigPanelProps) {
  const updateEnabled = (key: keyof ReportConfig['enabledCharts'], checked: boolean) => {
    onConfigChange({
      ...config,
      enabledCharts: {
        ...config.enabledCharts,
        [key]: checked,
      },
    });
  };

  const updateType = (key: keyof ReportConfig['chartTypes'], value: string) => {
    onConfigChange({
      ...config,
      chartTypes: {
        ...config.chartTypes,
        [key]: value,
      },
    });
  };

  return (
    <section className="card config-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Chart Settings</p>
          <h2>表格可选配置</h2>
          <p className="chart-description">默认生成核心图表，可以按需要增删图表并切换图表类型。</p>
        </div>
      </div>

      <div className="config-grid">
        {chartConfigOptions.map((option) => {
          const enabled = config.enabledCharts[option.key];
          const typeKey = option.key as keyof ReportConfig['chartTypes'];
          const selectedType = config.chartTypes[typeKey];

          return (
            <article className={enabled ? 'config-item active' : 'config-item'} key={option.key}>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => updateEnabled(option.key, event.target.checked)}
                />
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </span>
              </label>

              {option.typeOptions.length > 0 ? (
                <label className="config-select">
                  <span>{option.typeLabel}</span>
                  <select
                    disabled={!enabled}
                    value={selectedType}
                    onChange={(event) => updateType(typeKey, event.target.value)}
                  >
                    {option.typeOptions.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
