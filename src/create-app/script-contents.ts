import { paths } from './paths.js';

export const bashScript = `#!/usr/bin/env bash

if test -f "${paths.main}"; then
  # get the script name
  node "${paths.main}" "$@"
  script=$(<"${paths.script}")
  arguments=$(<"${paths.arguments}")
  package_manager=$(<"${paths.packageManager}")

  # clear tmp files
  >"${paths.script}"
  >"${paths.arguments}"
  >"${paths.packageManager}"

  # run the script
  if test -n "$script" && test -n "$package_manager"; then
    if test -n "$arguments"; then
      $package_manager "$script" $arguments
    else
      $package_manager "$script"
    fi
  fi

  unset script
  unset arguments
  unset package_manager
fi
`;

export const bashStartScript = `#!/usr/bin/env bash

if test -d "${paths.bin}"; then
	export PATH=${paths.bin}:$PATH
fi`;

export const powershellScript = `#!/usr/bin/env pwsh

if (Test-Path -Path "${paths.main}") {
  # get the script name  
  node "${paths.main}" $args
  $Script = Get-Content -Path "${paths.script}" -ErrorAction SilentlyContinue
  $Arguments = Get-Content -Path "${paths.arguments}" -ErrorAction SilentlyContinue
  $PackageManager = Get-Content -Path "${paths.packageManager}" -ErrorAction SilentlyContinue

  # clear tmp files
  Clear-Content -Path "${paths.script}"
  Clear-Content -Path "${paths.arguments}"
  Clear-Content -Path "${paths.packageManager}"

  # run the script
  if (![string]::IsNullOrEmpty($Script) -and ![string]::IsNullOrEmpty($PackageManager)) {
    if (![string]::IsNullOrEmpty($Arguments)) {
      Invoke-Expression "$PackageManager $Script $Arguments"
    }
    else {
      Invoke-Expression "$PackageManager $Script"
    }
  }
}
`;
