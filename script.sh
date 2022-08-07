#!/bin/bash

# Execute a Python script
run_script()
{
  # Parse the arguments
  local script_name="$1"; shift
  local script_args="$@"

  # Execute the script
  python3 "scripts/$script_name.py" "$script_args"
}

run_script "$@"
