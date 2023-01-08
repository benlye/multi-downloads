<#
 # Script to build the MULTI-Module firmware download page
 # Uses the Github API To retrieve the list of releases, filters them,
 # and updates the data used to populate the download page.
 #>

# Get all the releases
$Header = @{"Authorization"="token $($Env:GITHUB_TOKEN)"}
$MultiReleases = Invoke-RestMethod -Method GET -Uri "https://api.github.com/repos/pascallanger/DIY-Multiprotocol-TX-Module/releases" -Header $Header

# Die if we didn't get any releases
If ($Null -eq $MultiReleases -or $MultiReleases.Count -eq 0) {
	Throw "No releases retrieved from Github"
}

# Filter to just recent releases and parse the properties we care about
$ReleaseData = $MultiReleases | ? { (Get-Date ($_.created_at)) -ge (get-date 2019-10-01)} | `
	select tag_name, name, @{label="id";expr={$_.tag_name.replace("v","")}}, @{label="version_number";expr={$_.tag_name.replace("v","")}}, @{label="text";expr={$_.tag_name.replace("v","")}}, created_at, url, @{label="asset_count";expr={$_.assets.count}}, prerelease, @{label="latest_stable";expr={$False}}, @{label="download_count";expr={0}}

# Tag the most recent stable release
$ReleaseData | ? {$_.prerelease -eq $False} | select -First 1 | % {$_.latest_stable = $True; $_.text = "$($_.text) (Latest stable)";}

# Tag the pre-releases
$ReleaseData | ? {$_.prerelease -eq $True} | % {$_.text = "$($_.text) (Pre-release)";}

# Get the asset data
$AssetData = @()
ForEach ($Release in $ReleaseData | ? { (Get-Date ($_.created_at)) -ge (get-date 2019-10-01)}) {
	$ReleaseAssets = $MultiReleases | ? {$_.tag_name -eq $Release.tag_name} | select -ExpandProperty assets | select name, @{label="display_name"; exp={$_.name}}, size, download_count, @{label="url"; exp={$_.browser_download_url}}, @{label="release_version"; exp={$Release.tag_name.replace("v","")}}
	$Release.download_count = '{0:N0}' -f ($ReleaseAssets | ? {$_.name -like "*.bin"} | select -ExpandProperty download_count | measure -Sum).sum 
	$AssetData += $ReleaseAssets
}
$AssetData | ? {$_.name -eq "multi.txt" -or $_.name -eq "MultiLuaScripts.zip"} | % {$_.display_name = "$($_.name) (v$($_.release_version))";}

# Update the data file
[ordered]@{"assets"=$AssetData; "releases"=$ReleaseData; "lastUpdate"=$(Get-Date -UFormat "%e %b %Y %H:%M")} | ConvertTo-Json -Depth 3 -Compress | Out-File ".\docs\data.json" -Encoding ascii

# Update the sitemap
$SitemapDate = get-date -UFormat "%Y-%m-%d"
$Sitemap = "<urlset xmlns=""http://www.sitemaps.org/schemas/sitemap/0.9"" xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xsi:schemaLocation=""http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"">
	<url>
		<loc>https://downloads.multi-module.org/</loc>
		<lastmod>$SitemapDate</lastmod>
	</url>
</urlset>"

$Sitemap | Out-File .\docs\sitemap.xml -Encoding ascii
