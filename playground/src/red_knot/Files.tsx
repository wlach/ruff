import { FileHandle } from "./red_knot_wasm";
import { FileIndex } from "./Chrome";
import { AddIcon, CloseIcon, PythonIcon } from "../shared/Icons";
import classNames from "classnames";
import { useMemo, useState } from "react";
import { Theme } from "../shared/theme";

export interface Props {
  // The file names
  files: FileIndex;
  theme: Theme;
  selected: FileHandle | null;

  onAdd(name: string): void;
  onRemove(id: FileHandle): void;
  onSelected(id: FileHandle): void;
  onRename(id: FileHandle, newName: string): void;
}

export function Files({
  files,
  selected,
  theme,
  onAdd,
  onRemove,
  onRename,
  onSelected,
}: Props) {
  const handleAdd = () => {
    let index: number | null = null;
    let fileName = "file.py";

    while (files[fileName] != null) {
      index = (index ?? 0) + 1;
      fileName = `file${index}.py`;
    }

    onAdd(fileName);
  };

  const lastFile = useMemo(() => {
    return Object.keys(files).length === 1;
  }, [files]);

  return (
    <ul
      className={classNames(
        "flex flex-wrap border-b border-gray-200",
        theme === "dark" ? "text-white border-rock" : null,
      )}
    >
      {Object.entries(files).map(([name, file]) => (
        <ListItem key={name} selected={selected === file} theme={theme}>
          <FileEntry
            selected={selected === file}
            name={name}
            onClicked={() => onSelected(file)}
            onRenamed={(newName) => {
              if (files[newName] == null) {
                onRename(file, newName);
              }
            }}
          />

          <button
            disabled={lastFile}
            onClick={lastFile ? undefined : () => onRemove(file)}
            className={"inline-block disabled:opacity-50"}
            title="Close file"
          >
            <span className="sr-only">Close</span>
            <CloseIcon />
          </button>
        </ListItem>
      ))}
      <ListItem selected={false} theme={theme}>
        <button onClick={handleAdd} title="Add file" className="inline-block">
          <span className="sr-only">Add file</span>
          <AddIcon />
        </button>
      </ListItem>
    </ul>
  );
}

interface ListItemProps {
  selected: boolean;
  children: React.ReactNode;
  theme: Theme;
}

function ListItem({ children, selected, theme }: ListItemProps) {
  const activeBorderColor =
    theme === "light" ? "border-galaxy" : "border-radiate";

  return (
    <li
      aria-selected={selected}
      className={classNames(
        "flex",
        "px-4",
        "gap-2",
        "border-b-1",
        "text-sm",
        "items-center",
        selected ? ["active", "border-b-2", activeBorderColor] : null,
      )}
    >
      {children}
    </li>
  );
}

interface FileEntryProps {
  selected: boolean;
  name: string;
  onClicked(): void;
  onRenamed(name: string): void;
}
function FileEntry({ name, onClicked, onRenamed, selected }: FileEntryProps) {
  const [newName, setNewName] = useState<string | null>(null);

  if (!selected && newName != null) {
    setNewName(null);
  }

  const handleRenamed = (newName: string) => {
    setNewName(null);
    if (name !== newName) {
      onRenamed(newName);
    }
  };

  return (
    <button
      onClick={() => {
        if (selected) {
          setNewName(name);
        } else {
          onClicked();
        }
      }}
      className="flex gap-2 items-center py-4"
    >
      <span className="inline-block flex-none" aria-hidden>
        <PythonIcon width={12} height={12} />
      </span>
      {newName == null ? (
        <span className="inline-block">{name}</span>
      ) : (
        <input
          className="inline-block"
          autoFocus={true}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={() => handleRenamed(newName)}
          onKeyDown={(event) => {
            if (event.metaKey || event.altKey || event.shiftKey) {
              return;
            }

            switch (event.key) {
              case "Enter":
                handleRenamed(newName);
                return;
              case "Escape":
                setNewName(null);
                return;
              case "/":
              case "\\":
                event.preventDefault();
            }
          }}
        />
      )}
    </button>
  );
}
