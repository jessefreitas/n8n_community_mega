import argparse
import shutil
import subprocess
import sys
from pathlib import Path


PACKAGE_NAME = "@jessefreitas/n8n-nodes-mega"
DEFAULT_VERSION = "0.4.7"


def resolve_npm() -> str:
    if sys.platform == "win32":
        return shutil.which("npm.cmd") or shutil.which("npm") or "npm"
    return shutil.which("npm") or "npm"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Install the published Mega n8n community package using npm.",
    )
    parser.add_argument(
        "--version",
        default=DEFAULT_VERSION,
        help=f"Package version to install. Defaults to {DEFAULT_VERSION}.",
    )
    parser.add_argument(
        "--target",
        default=".",
        help="Directory where npm install should run. Defaults to the current directory.",
    )
    args = parser.parse_args()

    target = Path(args.target).resolve()
    if not target.exists():
        print(f"Target directory does not exist: {target}", file=sys.stderr)
        return 2

    npm = resolve_npm()
    package_spec = f"{PACKAGE_NAME}@{args.version}"

    result = subprocess.run(
        [npm, "install", package_spec],
        cwd=target,
        check=False,
    )
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
