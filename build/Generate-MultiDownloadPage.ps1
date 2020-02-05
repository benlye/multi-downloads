<#
 # Script to build the MULTI-Module firmware download page
 # Uses the Github API To retrieve the list of releases, filters them,
 # and updates the download page.
 #>

# Script parameters
[cmdletbinding()]
	param(
		[switch]$ForceUpdate
	)

# Get all the releases
$MultiReleases = Invoke-RestMethod -Method GET -Uri "https://api.github.com/repos/pascallanger/DIY-Multiprotocol-TX-Module/releases"

# Die if we didn't get any releases
If ($Null -eq $MultiReleases -or $MultiReleases.Count -eq 0) {
	Throw "No releases retrieved from Github"
}

# Filter to just recent releases and exclude pre-releases
$MultiReleases = $MultiReleases | ? { (Get-Date ($_.created_at)) -ge (get-date 2019-10-01) -and $_.prerelease -eq $False}

# Get the last release tag on GitHub
$LastReleaseTag = $MultiReleases[0].tag_name

# Get the last release tag we processed
$LastProcessedTag = Get-Content .\build\last_release -ErrorAction SilentlyContinue

# Stop if the last tag hasn't changed and this isn't a forced update
If ($LastReleaseTag -eq $LastProcessedTag -and $ForceUpdate -eq $False ) {
	Write-Host "No change to GitHub releases, not updating download page."
	exit 0
}

# Array to store the release selector drop-down options
$ReleaseSelector = @()

$ReleaseInfo = @()

# Array to store the table containing the list of files
$FileTable =@()

# The file table header
$FileTable += "			<table id=""fileTable"">`n"
$FileTable += "				<tr class=""header"">`n"
$FileTable += "					<th style=""width:60%;"">Firmware File</th>`n"
$FileTable += "					<th style=""width:20%;"">File Size</th>`n"
$FileTable += "					<th style=""width:20%;"">Download Count</th>`n"
$FileTable += "				</tr>`n"

# Keep track of the latest release (the first release in the list the Github API returns
$IsLatestRelease = $True

# Iterate through the releases
ForEach ($Release in $MultiReleases) {
	# Filter releases with too few assets
	If ($Release.assets.Count -gt 15) {
		# Clean up the tag name
		$ReleaseTag = $Release.tag_name.Replace("v","")

		# Write the option to the release selector array
		If ($IsLatestRelease) {
			$ReleaseSelector += "							<option value=""$ReleaseTag"">$ReleaseTag (Latest)</option>`n"
			$IsLatestRelease = $False
		} Else {
			$ReleaseSelector += "							<option value=""$ReleaseTag"">$ReleaseTag</option>`n"
		}
		
		$TotalDownloads = 0
		
		# Loop through the assets in the release, adding them to the file list
		ForEach ($Asset in $Release.assets) {
			If ($Asset.name -eq "Multi.txt") {
				$FileTable += "				<tr><td><a href=""$($Asset.browser_download_url)"">$($Asset.name) (v$ReleaseTag)</a></td><td>$([math]::Round($Asset.size / 1024))KB</td><td>$($Asset.download_count)</td></tr>`n"
			} Else {
				$FileTable += "				<tr><td><a href=""$($Asset.browser_download_url)"">$($Asset.name)</a></td><td>$([math]::Round($Asset.size / 1024))KB</td><td>$($Asset.download_count)</td></tr>`n"
			}
			$TotalDownloads += $Asset.download_count
		}
		
		$ReleaseInfo += "						<i id=""release_$ReleaseTag"" style=""display: none;"" class=""fp-question-circle"" tabindex=""0"" data-trigger=""focus"" data-container=""body"" data-toggle=""popover"" data-placement=""right"" title=""Firmware Version"" data-content=""<table width=250px><tr><td><b>Version:</b></td><td>$ReleaseTag</td></tr><tr><td><b>Release Date:</b></td><td>$(Get-Date($Release.published_at) -Format D)</td></tr><tr><td><b>Downloads:</b></td><td>$TotalDownloads</td></tr><tr><td><b>Release Notes:</b></td><td><a href=https://github.com/pascallanger/DIY-Multiprotocol-TX-Module/releases/tag/$ReleaseTag target=_new>Link</a></td></tr></table>""></i>`n"
		
	}
}

# End of the table
$FileTable += "			</table>"

# Import the template
$Page = Get-Content .\build\template.html

# Die if we couldn't import the template
If ($Null -eq $Page) {
	Throw "Unable to load page template"
}

# Replace the placeholders in the template
$Page = ($Page | Out-String).Replace("%%filetable%%", $FileTable)
$Page = ($Page | Out-String).Replace("%%releaseselector%%", $ReleaseSelector)
$Page = ($Page | Out-String).Replace("%%releaseinfo%%", $ReleaseInfo)
$Page = ($Page | Out-String).Replace("%%lastupdatestamp%%", (Get-Date -format f))

# Write the new file
$Page | Out-File .\docs\index.html -Encoding ascii

# Update the last release file
$MultiReleases[0].tag_name | Out-File .\build\last_release -Encoding ascii
