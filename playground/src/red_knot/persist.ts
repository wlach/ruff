import { fetchPlayground, savePlayground } from "./api";

interface Files {
  [name: string]: string;
}

/**
 * Persist the configuration to a URL.
 */
export async function persist(files: Files): Promise<void> {
  const id = await savePlayground({ files });

  await navigator.clipboard.writeText(
    `${window.location.origin}${window.location.pathname}?id=${id}`,
  );
}

/**
 * Restore the workspace by fetching the data for the ID specified in the URL
 * or by restoring from local storage.
 */
export async function restore(): Promise<Files | null> {
  const params = new URLSearchParams(window.location.search);

  const id = params.get("id");

  if (id != null) {
    const playground = await fetchPlayground(id);

    if (playground == null) {
      return null;
    }

    return playground.files;
  }

  // If no URL is present, restore from local storage.
  return restoreLocal();
}

export function persistLocal(files: Files) {
  localStorage.setItem("workspace", JSON.stringify({ files }));
}

function restoreLocal(): Files | null {
  const workspace = localStorage.getItem("workspace");

  if (workspace == null) {
    return null;
  } else {
    return JSON.parse(workspace).files;
  }
}
