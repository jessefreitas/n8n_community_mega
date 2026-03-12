import argparse
import getpass
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


PACKAGE_NAME = "@jessefreitas/n8n-nodes-mega"


def run(command: list[str], cwd: Path, userconfig: Path | None = None) -> None:
    env = os.environ.copy()
    if userconfig is not None:
        env["NPM_CONFIG_USERCONFIG"] = str(userconfig)

    executable = command[0]
    if os.name == "nt" and executable == "npm":
        executable = shutil.which("npm.cmd") or shutil.which("npm") or executable
        command = [executable, *command[1:]]

    result = subprocess.run(command, cwd=cwd, env=env, check=False)
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def build_temp_npmrc(token: str) -> Path:
    temp_dir = Path(tempfile.mkdtemp(prefix="npm-publish-"))
    npmrc = temp_dir / ".npmrc"
    npmrc.write_text(
        f"//registry.npmjs.org/:_authToken={token}\nregistry=https://registry.npmjs.org/\n",
        encoding="ascii",
    )
    return npmrc


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Publish @jessefreitas/n8n-nodes-mega using a temporary npm config.",
    )
    parser.add_argument(
        "--token",
        default=os.environ.get("NPM_TOKEN", ""),
        help="Granular npm token with publish permission. Defaults to NPM_TOKEN.",
    )
    parser.add_argument(
        "--skip-whoami",
        action="store_true",
        help="Skip the npm whoami check before publishing.",
    )
    parser.add_argument(
        "--skip-view",
        action="store_true",
        help="Skip the final npm view version check after publishing.",
    )
    args = parser.parse_args()

    token = args.token.strip()
    if not token:
        token = getpass.getpass("NPM token: ").strip()

    if not token:
        print("Missing npm token. Pass --token, set NPM_TOKEN, or enter it when prompted.", file=sys.stderr)
        return 2

    repo_root = Path(__file__).resolve().parent.parent
    npmrc = build_temp_npmrc(token)

    try:
        if not args.skip_whoami:
            run(["npm", "whoami"], cwd=repo_root, userconfig=npmrc)

        run(
            ["npm", "publish", "--access", "public", "--ignore-scripts"],
            cwd=repo_root,
            userconfig=npmrc,
        )

        if not args.skip_view:
            run(["npm", "view", PACKAGE_NAME, "version"], cwd=repo_root, userconfig=npmrc)
    finally:
        shutil.rmtree(npmrc.parent, ignore_errors=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
