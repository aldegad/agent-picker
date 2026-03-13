const REFACTOR_PROMPT =
  "Please refactor this by clearly separating responsibilities, untangling any spaghetti code, and removing dead code and unnecessary fallbacks. If possible, keep each file under 500 lines.";

async function sendBridgeMessage(type) {
  const daemonUrl = await writeDaemonUrl(daemonUrlInput.value);
  return chrome.runtime.sendMessage({
    type,
    daemonUrl,
    ...(await readActiveTab()),
  });
}

async function runAction(type, workingMessage, successMessage) {
  setBusyState(true);
  setStatus(workingMessage, "working");

  try {
    const result = await sendBridgeMessage(type);
    if (!result?.ok) {
      throw new Error(result?.error || "The bridge did not return a result.");
    }

    setStatus(result.message || successMessage, "success");
    updateSavedSelectionLabel(result);
    return true;
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), "error");
    return false;
  } finally {
    setBusyState(false);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  daemonUrlInput.value = await readDaemonUrl();
  setRefactorPrompt(REFACTOR_PROMPT);
  setStatus("Idle.", "idle");
});

testBridgeButton.addEventListener("click", async () => {
  await runAction(
    "agent-picker:test-daemon",
    "Checking the local bridge...",
    "Bridge reachable.",
  );
});

capturePageButton.addEventListener("click", async () => {
  await runAction(
    "agent-picker:capture-page",
    "Capturing the current page...",
    "Current page saved to the daemon.",
  );
});

inspectElementButton.addEventListener("click", async () => {
  const ok = await runAction(
    "agent-picker:start-inspect",
    "Inspect mode armed. Click the page element you want to save.",
    "Inspect mode armed. Click the target element in the page.",
  );

  if (ok) {
    window.close();
  }
});

copyRefactorPromptButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(REFACTOR_PROMPT);
    setStatus("Refactor prompt copied.", "success");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), "error");
  }
});
