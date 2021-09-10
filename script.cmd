@echo off

rem Execute a Python script
:run_script
  rem Parse the arguments
  set script_name=%1
  for /f "usebackq tokens=1*" %%i in (`echo %*`) do @ set script_args=%%j

  rem Execute the script
  python3 scripts\%script_name%.py %script_args%
goto:eof

call:run_script
