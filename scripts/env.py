import os

from typing import Any, Dict, Union


def loadEnv(filename: str) -> None:
    """Load the environment variables."""

    with open(filename, "r") as f:
        for line in f:
            line: str = line.strip()
            eq_idx: int = line.find("=")

            if eq_idx != -1:
                key: str = line[:eq_idx]
                value: str = line[eq_idx + 1 :]
                os.environ[key] = value


def getEnv(filename: str) -> Dict[str, str]:
    """Get the environment variables."""

    env: Dict[str, str] = {}
    with open(filename, "r") as f:
        for line in f:
            line: str = line.strip()
            eq_idx: int = line.find("=")

            if eq_idx != -1:
                key: str = line[:eq_idx]
                value: str = line[eq_idx + 1 :]
                env[key] = value

    return env


def getVariable(name: str, filename: str = None) -> Union[str, None]:
    """Get an environment variable from the environment or .env file."""

    var = os.environ.get(name)

    if var is not None:
        return var
    elif filename is not None:
        env = getEnv(filename)
        var = env.get(name)

        if var is not None:
            return var

    return None
