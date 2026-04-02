"""
.github/scripts/update_readme.py

Runs summary script, captures its stdout, and splices the output
into README.md between the two marker comments:

    <!-- STATS:START -->
    ...anything here gets replaced on every push...
    <!-- STATS:END -->
"""

import subprocess
import sys
from pathlib import Path

SUMMARY_SCRIPT = "scripts/progress.py"

# Markers that wrap the auto-generated block in README.md
MARKER_START = "<!-- STATS:START -->"
MARKER_END   = "<!-- STATS:END -->"

README_PATH  = Path("README.md")

def run_summary() -> str:
    """Run the summary script and return its stdout as a string."""
    result = subprocess.run(
        [sys.executable, SUMMARY_SCRIPT],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print("Summary script failed. stderr output:")
        print(result.stderr)
        sys.exit(1)
    return result.stdout.strip()

def inject(readme: str, content: str) -> str:
    """Replace everything between the markers with `content`."""
    start = readme.find(MARKER_START)
    end   = readme.find(MARKER_END)

    if start == -1 or end == -1:
        raise ValueError(
            f"Could not find markers in README.md.\n"
            f"Make sure both of these lines exist:\n"
            f"  {MARKER_START}\n"
            f"  {MARKER_END}"
        )

    before = readme[: start + len(MARKER_START)]
    after  = readme[end:]
    return f"{before}\n{content}\n{after}"

def main():
    print("Running summary script…")
    summary = run_summary()

    original = README_PATH.read_text(encoding="utf-8")
    updated  = inject(original, summary)

    if updated == original:
        print("README is already up to date, nothing to write.")
        return

    README_PATH.write_text(updated, encoding="utf-8")
    print("README.md updated.")

if __name__ == "__main__":
    main()