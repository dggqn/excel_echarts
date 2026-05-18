type UploadPanelProps = {
  onFileSelected: (file: File) => void;
};

export function UploadPanel({ onFileSelected }: UploadPanelProps) {
  return (
    <label className="upload-button">
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFileSelected(file);
          }
        }}
      />
      上传 Excel
    </label>
  );
}
