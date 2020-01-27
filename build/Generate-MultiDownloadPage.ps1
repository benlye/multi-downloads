<#
 # Script to build the MULTI-Module firmware download page
 # Uses the Github API To retrieve the list of releases, filters them,
 # and updates the download page.
 #>

# Get all the releases
$MultiReleases = Invoke-RestMethod -Method GET -Uri "https://api.github.com/repos/pascallanger/DIY-Multiprotocol-TX-Module/releases"

# Die if we didn't get any releases
If ($Null -eq $MultiReleases -or $MultiReleases.Count -eq 0) {
	Throw "No releases retrieved from Github"
}

# Filter to just recent releases
$MultiReleases = $MultiReleases | ? { (Get-Date ($_.created_at)) -ge (get-date 2019-10-01) }

# Array to store the release selector drop-down options
$ReleaseSelector = @()

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
		
		# Loop through the assets in the release, adding them to the file list
		ForEach ($Asset in $Release.assets) {
			If ($Asset.name -eq "Multi.txt") {
				$FileTable += "				<tr><td><a href=""$($Asset.browser_download_url)"">$($Asset.name) (v$ReleaseTag)</a></td><td>$([math]::Round($Asset.size / 1024))KB</td><td>$($Asset.download_count)</td></tr>`n"
			} Else {
				$FileTable += "				<tr><td><a href=""$($Asset.browser_download_url)"">$($Asset.name)</a></td><td>$([math]::Round($Asset.size / 1024))KB</td><td>$($Asset.download_count)</td></tr>`n"
			}
		}
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
$Page = ($Page | Out-String).Replace("%%lastupdatestamp%%", (Get-Date -format f))

# Write the new file
$Page | out-file .\docs\index.html -Encoding utf8
