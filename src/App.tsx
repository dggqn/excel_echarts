import { useState } from 'react';
import { AnalysisPage } from './components/AnalysisPage';
import { ExportResultPage } from './components/ExportResultPage';
import { HomeUploadPage } from './components/HomeUploadPage';
import { cloneDefaultReportConfig } from './features/config/reportConfig';
import { parseWorkbook } from './features/excel/parseWorkbook';
import { buildCharts, buildReportPlan } from './features/schema/buildReportPlan';
import type { ReportConfig, UploadedReportFile } from './lib/types';

type AppPage = 'upload' | 'analysis' | 'export';

function App() {
  const [page, setPage] = useState<AppPage>('upload');
  const [files, setFiles] = useState<UploadedReportFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeFile = files.find((file) => file.id === activeFileId) ?? files.find((file) => file.status === 'ready');

  const handleFilesSelected = (nextFiles: FileList | File[]) => {
    const incoming = Array.from(nextFiles).filter((file) => /\.(xlsx|xls|csv)$/i.test(file.name));
    const uploadedAt = new Date().toISOString();

    setFiles((currentFiles) => [
      ...currentFiles,
      ...incoming.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        fileName: buildDisplayName(file.name, currentFiles, index),
        fileSize: file.size,
        uploadedAt,
        status: 'queued' as const,
        file,
        config: cloneDefaultReportConfig(),
      })),
    ]);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(null);
    }
  };

  const handleSubmitUpload = async () => {
    const parsedFiles = await Promise.all(
      files.map(async (uploadedFile) => {
        if (!uploadedFile.file) {
          return uploadedFile;
        }

        try {
          const workbook = await parseWorkbook(uploadedFile.file);
          const report = buildReportPlan(workbook);
          report.charts = buildCharts(report.exams, report.students, uploadedFile.config);
          return {
            ...uploadedFile,
            status: 'ready' as const,
            report,
            error: undefined,
          };
        } catch (error) {
          return {
            ...uploadedFile,
            status: 'error' as const,
            error: error instanceof Error ? error.message : '解析失败',
          };
        }
      }),
    );

    setFiles(parsedFiles);
    setActiveFileId(parsedFiles.find((file) => file.status === 'ready')?.id ?? parsedFiles[0]?.id ?? null);
    setPage('analysis');
  };

  const handleConfigChange = (fileId: string, config: ReportConfig) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) => {
        if (file.id !== fileId) {
          return file;
        }

        if (!file.report) {
          return { ...file, config };
        }

        return {
          ...file,
          config,
          report: {
            ...file.report,
            charts: buildCharts(file.report.exams, file.report.students, config),
          },
        };
      }),
    );
  };

  const handleStudentChange = (fileId: string, studentId: string) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) => {
        if (file.id !== fileId || !file.report) {
          return file;
        }

        const report = {
          ...file.report,
          selectedStudentId: studentId,
          charts: buildCharts(file.report.exams, file.report.students, file.config),
        };

        return { ...file, report };
      }),
    );
  };

  if (page === 'upload') {
    return (
      <HomeUploadPage
        files={files}
        isDragging={isDragging}
        onDragChange={setIsDragging}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={handleRemoveFile}
        onSubmit={handleSubmitUpload}
      />
    );
  }

  if (page === 'export') {
    return (
      <ExportResultPage
        file={activeFile ?? null}
        onBackAnalysis={() => setPage('analysis')}
        onBackHome={() => setPage('upload')}
        onStudentChange={handleStudentChange}
      />
    );
  }

  return (
    <AnalysisPage
      files={files}
      activeFileId={activeFile?.id ?? null}
      onActiveFileChange={setActiveFileId}
      onBackHome={() => setPage('upload')}
      onExport={() => setPage('export')}
      onConfigChange={handleConfigChange}
      onStudentChange={handleStudentChange}
    />
  );
}

function buildDisplayName(fileName: string, currentFiles: UploadedReportFile[], offset: number) {
  const sameNameCount = currentFiles.filter((file) => file.fileName.startsWith(fileName)).length + offset;

  if (sameNameCount === 0) {
    return fileName;
  }

  const dotIndex = fileName.lastIndexOf('.');
  const base = dotIndex > -1 ? fileName.slice(0, dotIndex) : fileName;
  const ext = dotIndex > -1 ? fileName.slice(dotIndex) : '';
  return `${base}(${sameNameCount + 1})${ext}`;
}

export default App;
