import type { UploadedReportFile } from '../lib/types';

type HomeUploadPageProps = {
  files: UploadedReportFile[];
  isDragging: boolean;
  onDragChange: (isDragging: boolean) => void;
  onFilesSelected: (files: FileList | File[]) => void;
  onRemoveFile: (fileId: string) => void;
  onSubmit: () => void;
};

export function HomeUploadPage({
  files,
  isDragging,
  onDragChange,
  onFilesSelected,
  onRemoveFile,
  onSubmit,
}: HomeUploadPageProps) {
  return (
    <main className="app-shell page-shell">
      <section className="hero-panel upload-hero">
        <div className="hero-copy upload-copy">
          <p className="eyebrow">Step 01 / Upload</p>
          <h1>在此上传文件。</h1>
          <p className="hero-description">
            支持拖拽上传，也可以一次选择一个或多个 Excel 文件。本次打开网站期间会保留文件清单，关闭后可清空。
          </p>
        </div>
      </section>

      <section className="card upload-workspace">
        <label
          className={isDragging ? 'drop-zone dragging' : 'drop-zone'}
          onDragEnter={(event) => {
            event.preventDefault();
            onDragChange(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            onDragChange(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            onDragChange(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            onDragChange(false);
            onFilesSelected(event.dataTransfer.files);
          }}
        >
          <input
            multiple
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(event) => {
              if (event.target.files) {
                onFilesSelected(event.target.files);
              }
              event.currentTarget.value = '';
            }}
          />
          <span>拖拽 Excel 到这里</span>
          <strong>或点击选择文件</strong>
          <small>支持 `.xlsx` / `.xls` / `.csv`，可多选。</small>
        </label>

        <div className="file-list-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Uploaded Files</p>
              <h2>本次文件清单</h2>
            </div>
            <span className="file-count">{files.length} 个文件</span>
          </div>

          {files.length === 0 ? (
            <p className="muted-text">还没有上传文件。</p>
          ) : (
            <div className="file-list">
              {files.map((file, index) => (
                <article className="file-item" key={file.id}>
                  <div>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{file.fileName}</strong>
                    <small>
                      {formatFileSize(file.fileSize)} / {new Date(file.uploadedAt).toLocaleTimeString()}
                    </small>
                  </div>
                  <button className="text-button" type="button" onClick={() => onRemoveFile(file.id)}>
                    删除
                  </button>
                </article>
              ))}
            </div>
          )}

          <div className="footer-actions">
            <button className="primary-button" type="button" onClick={onSubmit} disabled={files.length === 0}>
              上传完毕
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
