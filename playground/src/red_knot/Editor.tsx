import { Theme } from "../shared/theme";
import PythonEditor from "./PythonEditor";

type Props = {
  fileName: string;
  content: string;
  theme: Theme;
  fileDiagnostics: string[];

  onSourceChanged(source: string): void;
};

export default function Editor({
  content,
  fileName,
  fileDiagnostics,
  theme,
  onSourceChanged,
}: Props) {
  const fileType = fileName.endsWith(".toml") ? "toml" : "py";

  return (
    <PythonEditor
      visible={fileType === "py"}
      source={fileType === "py" ? content : ""}
      theme={theme}
      diagnostics={fileDiagnostics}
      onChange={onSourceChanged}
    />
  );
}
