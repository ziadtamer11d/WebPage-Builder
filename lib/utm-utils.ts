/**
 * Utility functions for handling UTM parameters
 */

export interface UTMParams {
  utmSource?: string
  campaignName?: string
}

/**
 * Builds UTM query string from parameters
 * @param utmSource - The UTM source value
 * @param campaignName - The campaign name (will be formatted as eg_nc-{campaignName}_f-cv_)
 * @returns UTM query string or empty string if both params are not provided
 */
export function buildUTMParams(utmSource?: string, campaignName?: string): string {
  // Return empty string if either param is empty (both must be filled or both empty)
  const sourceProvided = utmSource && utmSource.trim() !== ""
  const campaignProvided = campaignName && campaignName.trim() !== ""
  
  // Only build UTM params if BOTH are provided
  if (!sourceProvided || !campaignProvided) {
    return ""
  }

  const params: string[] = []

  // Add UTM source
  params.push(`utm_source=${encodeURIComponent(utmSource.trim())}`)

  // Always add utm_medium=decathlon
  params.push("utm_medium=decathlon")

  // Add campaign with fixed format
  const formattedCampaign = `eg_nc-${campaignName.trim()}_f-cv_`
  params.push(`utm_campaign=${encodeURIComponent(formattedCampaign)}`)

  return `?${params.join("&")}`
}

/**
 * Appends UTM parameters to a URL
 * @param url - The base URL
 * @param utmSource - The UTM source value
 * @param campaignName - The campaign name
 * @returns URL with UTM parameters appended
 */
export function appendUTMToURL(url: string, utmSource?: string, campaignName?: string): string {
  if (!url) return url

  const utmParams = buildUTMParams(utmSource, campaignName)
  if (!utmParams) return url

  // Check if URL already has query parameters
  if (url.includes("?")) {
    // URL has existing params, replace ? with &
    return url + utmParams.replace("?", "&")
  } else {
    // URL has no params, keep the ?
    return url + utmParams
  }
}

/**
 * Parses UTM parameters from a URL
 * @param url - The URL to parse
 * @returns UTMParams object
 */
export function parseUTMFromURL(url: string): UTMParams {
  if (!url) return {}

  try {
    const urlObj = new URL(url, "https://example.com") // Use base for relative URLs
    const params = new URLSearchParams(urlObj.search)

    const utmSource = params.get("utm_source") || undefined
    const utmCampaign = params.get("utm_campaign") || undefined

    // Extract campaign name from the formatted campaign string
    let campaignName: string | undefined = undefined
    if (utmCampaign) {
      // Match pattern: eg_nc-{campaignName}_f-cv_
      const match = utmCampaign.match(/^eg_nc-(.+?)_f-cv_$/)
      if (match && match[1]) {
        campaignName = match[1]
      }
    }

    return {
      utmSource,
      campaignName
    }
  } catch (e) {
    return {}
  }
}

/**
 * Removes UTM parameters from a URL
 * @param url - The URL to clean
 * @returns URL without UTM parameters
 */
export function removeUTMFromURL(url: string): string {
  if (!url) return url

  try {
    const urlObj = new URL(url, "https://example.com")
    const params = new URLSearchParams(urlObj.search)

    // Remove UTM parameters
    params.delete("utm_source")
    params.delete("utm_medium")
    params.delete("utm_campaign")

    const queryString = params.toString()
    const baseUrl = url.split("?")[0]

    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  } catch (e) {
    return url
  }
}

