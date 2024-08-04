import { useDeferredValue, useMemo } from "react";
import { Workspace, FileHandle } from "./red_knot_wasm";
import { ErrorMessage } from "../shared/ErrorMessage";

import { Theme } from "../shared/theme";
import PythonEditor from "./PythonEditor";

interface CheckResult {
  diagnostics: string[];
  error: string | null;
}

type Props = {
  file: FileHandle;
  content: string;
  theme: Theme;
  workspace: Workspace;

  onSourceChanged(source: string): void;
};

export default function Editor({
  content,
  file,
  workspace,
  theme,
  onSourceChanged,
}: Props) {
  // TODO: figure out how to do deferred
  const deferredContent = useDeferredValue(content);

  const checkResult: CheckResult = useMemo(() => {
    try {
      const diagnostics = workspace.checkFile(file);
      // There's an implicit dependency on deferredContent by what's stored
      // in the workspace
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _value = deferredContent;

      return {
        diagnostics,
        error: null,
      };
    } catch (e) {
      console.error(e);
      return {
        diagnostics: [],
        error: (e as Error).message,
      };
    }
  }, [deferredContent, file, workspace]);

  const filePath = file.toString();
  const fileType = filePath.endsWith(".toml") ? "toml" : "py";

  return (
    <>
      <PythonEditor
        visible={fileType === "py"}
        source={fileType === "py" ? content : ""}
        theme={theme}
        diagnostics={checkResult.diagnostics}
        onChange={onSourceChanged}
      />

      {checkResult.error ? (
        <div
          style={{
            position: "fixed",
            left: "10%",
            right: "10%",
            bottom: "10%",
          }}
        >
          <ErrorMessage>{checkResult.error}</ErrorMessage>
        </div>
      ) : null}
    </>
  );
}
