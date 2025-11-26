import { ComponentRegistry } from "./component-registry"
import { AssetRegistry } from "./asset-registry"
import { PreviewComponentRegistry } from "./preview-component-registry"
import { PreviewAssetRegistry } from "./preview-asset-registry"
import { settingsModel } from "./settings-model"
import { parseUTMFromURL, removeUTMFromURL } from "./utm-utils"
import type { Component as ComponentType } from "@/types/component"

/**
 * Cleans pasted HTML code by removing common wrapper elements and unnecessary content
 * @param html - The raw HTML string to clean
 * @returns Cleaned HTML string
 */
export function cleanPastedCode(html: string): string {
  // Remove <div id="ZA_body_fix">...</div> wrapper if present
  // Handle various formats: <div id="ZA_body_fix">, <div id='ZA_body_fix'>, <div id=ZA_body_fix>
  const originalLength = html.length
  
  // Find the opening <div id="ZA_body_fix"> tag
  const openingTagRegex = /<div\s+id\s*=\s*["']?ZA_body_fix["']?[^>]*>/i
  const openingMatch = html.match(openingTagRegex)
  
  if (openingMatch) {
    const openingTag = openingMatch[0]
    const openingTagIndex = html.indexOf(openingTag)
    
    // Find the corresponding closing </div> tag by counting opening and closing divs
    let divCount = 0
    let closingTagIndex = -1
    
    for (let i = openingTagIndex; i < html.length; i++) {
      if (html.substring(i, i + 4) === '<div') {
        divCount++
      } else if (html.substring(i, i + 6) === '</div>') {
        divCount--
        if (divCount === 0) {
          closingTagIndex = i + 6 // Include the full </div> tag
          break
        }
      }
    }
    
    if (closingTagIndex !== -1) {
      // Remove the opening tag and closing tag, keeping the content in between
      const beforeOpening = html.substring(0, openingTagIndex)
      const content = html.substring(openingTagIndex + openingTag.length, closingTagIndex - 6)
      const afterClosing = html.substring(closingTagIndex)
      
      html = beforeOpening + content + afterClosing
      console.log('[cleanPastedCode] Removed ZA_body_fix wrapper, original length:', originalLength, 'cleaned length:', html.length)
    }
  }
  
  // Also handle cases where there might be different attribute orders
  const alternativeOpeningRegex = /<div[^>]*id\s*=\s*["']?ZA_body_fix["']?[^>]*>/i
  const alternativeMatch = html.match(alternativeOpeningRegex)
  
  if (alternativeMatch && !openingMatch) {
    const openingTag = alternativeMatch[0]
    const openingTagIndex = html.indexOf(openingTag)
    
    // Find the corresponding closing </div> tag by counting opening and closing divs
    let divCount = 0
    let closingTagIndex = -1
    
    for (let i = openingTagIndex; i < html.length; i++) {
      if (html.substring(i, i + 4) === '<div') {
        divCount++
      } else if (html.substring(i, i + 6) === '</div>') {
        divCount--
        if (divCount === 0) {
          closingTagIndex = i + 6 // Include the full </div> tag
          break
        }
      }
    }
    
    if (closingTagIndex !== -1) {
      // Remove the opening tag and closing tag, keeping the content in between
      const beforeOpening = html.substring(0, openingTagIndex)
      const content = html.substring(openingTagIndex + openingTag.length, closingTagIndex - 6)
      const afterClosing = html.substring(closingTagIndex)
      
      html = beforeOpening + content + afterClosing
      console.log('[cleanPastedCode] Removed ZA_body_fix wrapper (alternative), original length:', originalLength, 'cleaned length:', html.length)
    }
  }
  
  // Remove any leading/trailing whitespace
  html = html.trim()
  
  return html
}

export interface Component {
  id: string
  type: string
  displayName?: string
  config: any
  html: string
}

export function generateHTML(components: Component[], isPreview: boolean = false): string {
  const currentSettings = settingsModel.getSettings()

  if (!currentSettings) {
    return "<!-- Error: No settings found -->"
  }

  const registry = isPreview ? PreviewComponentRegistry : ComponentRegistry
  const assetRegistry = isPreview ? PreviewAssetRegistry : AssetRegistry

  const htmlParts = components.map((component) => {
    const template = registry.getTemplate(component.type)
    
    // For custom components or unknown types, use the original HTML
    if (!template) {
      const htmlWithId = addComponentIdToFirstElement(component.html, component.id)
      return `<!-- COMPONENT_START ${component.id} -->\n${htmlWithId}\n<!-- COMPONENT_END ${component.id} -->`
    }

    if (component.type === "products-showroom") {
      const html = template.generateHTML(component.config)

      const newConfig = {
        ...component.config,
        currency: currentSettings.currency
      }

      const htmlWithId = addComponentIdToFirstElement(html, component.id)
      return `<!-- COMPONENT_START ${component.id} -->\n${htmlWithId}\n<!-- COMPONENT_END ${component.id} -->`
    }

    const html = template.generateHTML(component.config)
    const htmlWithId = addComponentIdToFirstElement(html, component.id)
    return `<!-- COMPONENT_START ${component.id} -->\n${htmlWithId}\n<!-- COMPONENT_END ${component.id} -->`
  })

  const combinedHTML = htmlParts.join("\n\n")
  
  if (isPreview) {
    assetRegistry.injectDefaultAssets()
    return combinedHTML
  }
  
  return combinedHTML
}

function detectComponentType(html: string): string {
  if (html.includes('class="swiper mySwiper"') || 
      (html.includes('class="swiper-slide"') && html.includes('picture'))) {
    return "swiper"
  }
  if (html.includes('class="four_categories_wrapper"') || 
      (html.includes('four_categories_box') && html.includes('four_categories_category_wrapper'))) {
    return "four-categories"
  }
  if (html.includes('class="icons-wrapper"')) {
    return "eight-icons"
  }
  if (html.includes('showroom-products-wrapper') || 
      html.includes('showroom-heading') || 
      html.includes('showroom-banner-wrapper')) {
    return "products-showroom"
  }
  if (html.includes('class="hero-banner-section"')) {
    return "hero-banner"
  }
  if (html.includes('class="dual-panel-section"')) {
    return "dual-panel-section"
  }
  if (html.includes('class="info-grid-section"')) {
    return "info-grid-section"
  }
  if (html.includes('class="faqs-section-wrapper"')) {
    return "faqs-section"
  }
  return "Custom"
}

function extractComponentConfig(html: string, type: string): any {
  const config: any = {}
  
  switch (type) {
    case "swiper":
      if (!html.includes('class="swiper mySwiper"')) {
        const linkMatch = html.match(/<a href="([^"]*)"[^>]*>/);
        const sourceMatches = html.match(/<source[^>]*media="[^"]*"[^>]*srcset="([^"]*)"[^>]*>/g);
        const imgMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/);
        const imgMatchAltFirst = html.match(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/);

        // Try both patterns to handle different attribute orders
        let imgSrc = ""
        let imgAlt = ""
        
        if (imgMatch) {
          // src comes first: match[1] = src, match[2] = alt
          imgSrc = imgMatch[1]
          imgAlt = imgMatch[2]
        } else if (imgMatchAltFirst) {
          // alt comes first: match[1] = alt, match[2] = src
          imgSrc = imgMatchAltFirst[2]
          imgAlt = imgMatchAltFirst[1]
        }

        if (linkMatch && sourceMatches && (imgMatch || imgMatchAltFirst)) {
          const desktopSource = sourceMatches.find(s => s.includes('min-width: 768px'));
          const mobileSource = sourceMatches.find(s => s.includes('max-width: 767px'));

          const desktopImage = desktopSource?.match(/srcset="([^"]*)"/)?.[1] || imgSrc;
          const mobileImage = mobileSource?.match(/srcset="([^"]*)"/)?.[1] || desktopImage;

          const fullLinkUrl = linkMatch[1] || ""
          const utmParams = parseUTMFromURL(fullLinkUrl)
          const cleanLinkUrl = removeUTMFromURL(fullLinkUrl)

          config.slides = [{
            linkUrl: cleanLinkUrl,
            desktopImage: desktopImage || "",
            mobileImage: mobileImage || "",
            altText: imgAlt || "",
            utmSource: utmParams.utmSource || "",
            campaignName: utmParams.campaignName || ""
          }];
        } else {
          config.slides = [];
        }
      } else {
        const slideMatches = html.matchAll(/<div class="swiper-slide">[\s\S]*?href="([^"]*)"[\s\S]*?srcset="([^"]*)"[\s\S]*?srcset="([^"]*)"[\s\S]*?src="([^"]*)"[\s\S]*?alt="([^"]*)"[\s\S]*?<\/div>/g)
        const slides = Array.from(slideMatches).map(match => {
          const fullLinkUrl = match[1] || ""
          const utmParams = parseUTMFromURL(fullLinkUrl)
          const cleanLinkUrl = removeUTMFromURL(fullLinkUrl)
          
          return {
            linkUrl: cleanLinkUrl,
            desktopImage: match[2] || match[4] || "",
            mobileImage: match[3] || "",
            altText: match[5] || "",
            utmSource: utmParams.utmSource || "",
            campaignName: utmParams.campaignName || ""
          }
        })
        config.slides = slides
      }
      break

    case "four-categories":
      const titleMatch = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
      config.title = titleMatch ? titleMatch[1].trim() : ""
      
      const bgColorMatch = html.match(/background-color:\s*([^"'\s;]*)/)
      config.backgroundColor = bgColorMatch ? bgColorMatch[1] : ""
      
      const categoryWrappers = html.match(/<div class="four_categories_category_wrapper">[\s\S]*?<\/div>\s*<\/div>/g) || []
      config.categories = categoryWrappers.map(wrapper => {
        const linkMatch = wrapper.match(/href="([^"]*)"/)
        const imgMatch = wrapper.match(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"/)
        const imgMatchAltFirst = wrapper.match(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"/)
        
        // Try both patterns to handle different attribute orders
        let imageUrl = ""
        let altText = ""
        
        if (imgMatch) {
          // src comes first: match[1] = src, match[2] = alt
          imageUrl = imgMatch[1]
          altText = imgMatch[2]
        } else if (imgMatchAltFirst) {
          // alt comes first: match[1] = alt, match[2] = src
          imageUrl = imgMatchAltFirst[2]
          altText = imgMatchAltFirst[1]
        }
        
        const fullLinkUrl = linkMatch ? linkMatch[1] : ""
        const utmParams = parseUTMFromURL(fullLinkUrl)
        const cleanLinkUrl = removeUTMFromURL(fullLinkUrl)
        
        return {
          linkUrl: cleanLinkUrl,
          imageUrl: imageUrl,
          altText: altText,
          utmSource: utmParams.utmSource || "",
          campaignName: utmParams.campaignName || ""
        }
      })

      while (config.categories.length < 4) {
        config.categories.push({
          linkUrl: "",
          imageUrl: "",
          altText: "",
          utmSource: "",
          campaignName: ""
        })
      }
      break

    case "eight-icons":
      const iconsTitleMatch = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
      config.title = iconsTitleMatch ? iconsTitleMatch[1].trim() : ""
      
      const iconWrappers = html.match(/<a[^>]*class="icon-wrapper"[\s\S]*?<\/a>/g) || []
      config.icons = iconWrappers.map(wrapper => {
        const linkMatch = wrapper.match(/href="([^"]*)"/)
        const imgMatch = wrapper.match(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"/)
        const imgMatchAltFirst = wrapper.match(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"/)
        const subtitleMatch = wrapper.match(/<span>([^<]*)<\/span>/)
        
        // Try both patterns to handle different attribute orders
        let imageUrl = ""
        let altText = ""
        
        if (imgMatch) {
          // src comes first: match[1] = src, match[2] = alt
          imageUrl = imgMatch[1]
          altText = imgMatch[2]
        } else if (imgMatchAltFirst) {
          // alt comes first: match[1] = alt, match[2] = src
          imageUrl = imgMatchAltFirst[2]
          altText = imgMatchAltFirst[1]
        }
        
        const fullLinkUrl = linkMatch ? linkMatch[1] : ""
        const utmParams = parseUTMFromURL(fullLinkUrl)
        const cleanLinkUrl = removeUTMFromURL(fullLinkUrl)
        
        return {
          linkUrl: cleanLinkUrl,
          imageUrl: imageUrl,
          altText: altText,
          subtitle: subtitleMatch ? subtitleMatch[1] : "",
          utmSource: utmParams.utmSource || "",
          campaignName: utmParams.campaignName || ""
        }
      })

      while (config.icons.length < 8) {
        config.icons.push({
          linkUrl: "",
          imageUrl: "",
          altText: "",
          subtitle: "",
          utmSource: "",
          campaignName: ""
        })
      }
      break

    case "products-showroom":
      // Check if it's a tabbed showroom
      const isTabbedShowroom = html.includes('showroom-buttons-list') || html.includes('x-data="{ activeTab:')
      config.tabbedMode = isTabbedShowroom

      if (isTabbedShowroom) {
        // Parse tabbed showroom
        const titleMatch = html.match(/<h2[^>]*id="showroom-title"[^>]*>([\s\S]*?)<\/h2>/)
        config.title = titleMatch ? titleMatch[1].trim() : ""
        config.mode = "title"
        config.direction = html.includes('showroom-container-rtl') ? "rtl" : "ltr"

        // Extract tabs
        const tabs: any[] = []
        const buttonMatches = html.matchAll(/<button[^>]*class="showroom-button"[^>]*>([\s\S]*?)<\/button>/g)
        const tabNames = Array.from(buttonMatches).map(match => match[1].trim())

        // Find each tab's content
        tabNames.forEach((tabName) => {
          const tabSection = html.match(new RegExp(`<!-- ${tabName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} Tab -->([\\s\\S]*?)(?=<!-- \\w+ Tab -->|<!-- Tabbed Showroom End -->)`, 'i'))
          
          if (tabSection) {
            const tabHtml = tabSection[1]
            let categoryNumber = ""
            let objectIds = ""

            // Try different product function patterns
            let intersectMatch = tabHtml.match(/x-intersect[^"]*"[^"]*(?:getProductsFromCategory|getDiscountedProductsFromCategory)\((\d+),\s*['"]?(\d+)['"]?(?:,\s*\[(.*?)\])?\)/);
            if (intersectMatch) {
              categoryNumber = intersectMatch[2]
              objectIds = intersectMatch[3] ? intersectMatch[3].split(',')
                .map((id: string) => id.trim())
                .filter((id: string) => id)
                .map((id: string) => id.replace(/['"]/g, ''))
                .join(',') : ""
            } else {
              intersectMatch = tabHtml.match(/x-intersect[^"]*"[^"]*getProductsManual\(\[(.*?)\]\)/);
              if (intersectMatch) {
                categoryNumber = ""
                objectIds = intersectMatch[1] ? intersectMatch[1].split(',')
                  .map((id: string) => id.trim())
                  .filter((id: string) => id)
                  .map((id: string) => id.replace(/['"]/g, ''))
                  .join(',') : ""
              }
            }

            tabs.push({
              name: tabName,
              categoryNumber,
              objectIds
            })
          }
        })

        config.tabs = tabs
      } else {
        // Parse regular showroom
        config.direction = html.includes('showroom-container-rtl') ? "rtl" : "ltr"

        // Detect mode by checking for banner images first
        const hasBannerImages = html.match(/x-data=["'][^"']*desktopBannerImage:\s*['"]([^'"]*)['"]/);
        const titleMatch = html.match(/<h2[^>]*id="showroom-title"[^>]*>([\s\S]*?)<\/h2>/)
        const titleText = titleMatch ? titleMatch[1].trim() : ""
        
        // If has banner images OR no title text, it's image mode
        if (hasBannerImages || (html.includes('showroom-heading') && !titleText)) {
          config.mode = "image"
          
          const bannerConfig: any = {}
          
          // Try to extract from x-data attribute first
          const xDataMatch = html.match(/x-data=["'][^"']*desktopBannerImage:\s*['"]([^'"]*)['"]/);
          const xDataMobileMatch = html.match(/x-data=["'][^"']*mobileBannerImage:\s*['"]([^'"]*)['"]/);
          const xDataAltMatch = html.match(/x-data=["'][^"']*bannerAlt:\s*['"]([^'"]*)['"]/);
          
          if (xDataMatch || xDataMobileMatch) {
            bannerConfig.desktopImage = xDataMatch ? xDataMatch[1] : ""
            bannerConfig.mobileImage = xDataMobileMatch ? xDataMobileMatch[1] : bannerConfig.desktopImage
            bannerConfig.altText = xDataAltMatch ? xDataAltMatch[1] : ""
          } else {
            // Fallback to parsing from img tags
            const desktopImageMatch = html.match(/showroom-desktop-banner[\s\S]*?<img[^>]*:?alt="([^"]*)"[^>]*:?src="([^"]*)"[^>]*class="showroom-banner-image"/);
            if (desktopImageMatch) {
              bannerConfig.altText = desktopImageMatch[1]
              bannerConfig.desktopImage = desktopImageMatch[2]
            }
            
            const mobileImageMatch = html.match(/showroom-mobile-banner[\s\S]*?<img[^>]*:?alt="[^"]*"[^>]*:?src="([^"]*)"[^>]*class="showroom-banner-image"/);
            bannerConfig.mobileImage = mobileImageMatch ? mobileImageMatch[1] : bannerConfig.desktopImage
          }
          
          // Try multiple patterns to find the banner link
          let bannerLinkMatch = html.match(/<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?showroom-banner-wrapper/);
          if (!bannerLinkMatch) {
            // Try alternative pattern - link might be before template tag
            bannerLinkMatch = html.match(/<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?showroom-desktop-banner/);
          }
          const fullBannerLink = bannerLinkMatch ? bannerLinkMatch[1] : ""
          const bannerUtmParams = parseUTMFromURL(fullBannerLink)
          bannerConfig.linkUrl = removeUTMFromURL(fullBannerLink)
          bannerConfig.utmSource = bannerUtmParams.utmSource || ""
          bannerConfig.campaignName = bannerUtmParams.campaignName || ""
          
          config.bannerConfig = bannerConfig
        } else {
          // Title mode
          config.mode = "title"
          config.title = titleText
        }

        // Try to match different product function patterns (including getDiscountedProductsFromCategory)
        let intersectMatch = html.match(/x-intersect[^"]*"[^"]*(?:getProductsFromCategory|getDiscountedProductsFromCategory)\((\d+),\s*['"]?(\d+)['"]?(?:,\s*\[(.*?)\])?\)/);
        if (intersectMatch) {
          config.categoryNumber = intersectMatch[2]
          config.objectIds = intersectMatch[3] ? intersectMatch[3].split(',')
            .map(id => id.trim())
            .filter(id => id)
            .map(id => id.replace(/['"]/g, ''))
            .join(',') : ""
        } else {
          // Try to match getProductsManual
          intersectMatch = html.match(/x-intersect[^"]*"[^"]*getProductsManual\(\[(.*?)\]\)/);
          if (intersectMatch) {
            config.categoryNumber = ""
            config.objectIds = intersectMatch[1] ? intersectMatch[1].split(',')
              .map(id => id.trim())
              .filter(id => id)
              .map(id => id.replace(/['"]/g, ''))
              .join(',') : ""
          }
        }
      }

      // Sale is now auto-detected by the template, no need to store it in config
      break

    case "hero-banner": {
      const imageMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*class="hero-banner-image"/)
      config.image = imageMatch ? imageMatch[1] : ""
      const titleMatch = html.match(/<h2[^>]*class="hero-banner-title"[^>]*>([\s\S]*?)<\/h2>/)
      config.title = titleMatch ? titleMatch[1].trim() : ""
      const subtitleMatch = html.match(/<div[^>]*class="hero-banner-subtitle"[^>]*>([\s\S]*?)<\/div>/)
      config.subtitle = subtitleMatch ? subtitleMatch[1].trim() : ""
      break
    }
    case "dual-panel-section": {
      const titleMatch = html.match(/<h2[^>]*class="section-text-title"[^>]*>([\s\S]*?)<\/h2>/)
      config.title = titleMatch ? titleMatch[1].trim() : ""
      const descMatch = html.match(/<p[^>]*class="section-text-description"[^>]*>([\s\S]*?)<\/p>/)
      config.description = descMatch ? descMatch[1].trim() : ""
      config.imageEnabled = html.includes('class="section-image')
      const imageMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*class="media-content"/)
      config.image = imageMatch ? imageMatch[1] : ""
      break
    }
    case "info-grid-section": {
      const titleMatch = html.match(/<h2[^>]*class="info-grid-section-title"[^>]*>([\s\S]*?)<\/h2>/)
      config.title = titleMatch ? titleMatch[1].trim() : ""
      const itemMatches = html.match(/<li class="info-grid-list-item">[\s\S]*?<\/li>/g) || []
      config.items = itemMatches.map(itemHtml => {
        const iconMatch = itemHtml.match(/<img[^>]*src="([^"]*)"[^>]*class="info-grid-list-item-icon-image"/)
        const titleMatch = itemHtml.match(/<div class="info-grid-list-item-title">([\s\S]*?)<\/div>/)
        const subtitleMatches = Array.from(itemHtml.matchAll(/<div class="info-grid-list-item-subtitle">([\s\S]*?)<\/div>/g)).map(m => m[1].trim())
        return {
          icon: iconMatch ? iconMatch[1] : "",
          title: titleMatch ? titleMatch[1].trim() : "",
          subtitles: subtitleMatches
        }
      })
      break
    }
    case "faqs-section": {
      const titleMatch = html.match(/<h2[^>]*class="faqs-header"[^>]*>([\s\S]*?)<\/h2>/)
      config.title = titleMatch ? titleMatch[1].trim() : ""
      const faqMatches = html.match(/<details class="question-wrapper">[\s\S]*?<\/details>/g) || []
      config.faqs = faqMatches.map(faqHtml => {
        const questionMatch = faqHtml.match(/<summary class="question-text">([\s\S]*?)<\/summary>/)
        const answerMatch = faqHtml.match(/<p class="answer-text">([\s\S]*?)<\/p>/)
        return {
          question: questionMatch ? questionMatch[1].trim() : "",
          answer: answerMatch ? answerMatch[1].trim() : ""
        }
      })
      break
    }
    case "Custom":
      config.html = html
      break
  }
  
  return config
}

export function parseComponents(html: string): ComponentType[] {
  const components: ComponentType[] = []
  
  // Clean the pasted code first - removes <div id="ZA_body_fix"> wrapper and other common elements
  html = cleanPastedCode(html)

  // Remove scripts, styles, and links
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '')
  
  // Parse components in order of appearance
  const allComponents: Array<{type: string, html: string, id: string, order: number, originalHtml: string}> = []
  
  // First, find all components with special comments and mark their positions
  const commentRegex = /<!-- COMPONENT_START (.*?) -->([\s\S]*?)<!-- COMPONENT_END \1 -->/g
  let match
  let commentIndex = 0
  
  while ((match = commentRegex.exec(html)) !== null) {
    const id = match[1]
    const componentHtml = match[2].trim()
    const type = detectComponentType(componentHtml)
    
    allComponents.push({
      type,
      html: componentHtml,
      id,
      order: match.index, // Use the actual position in the HTML
      originalHtml: componentHtml
    })
  }
  
  // Now find all other complete HTML structures (components without special comments)
  // We'll parse the entire HTML and identify complete tag structures
  // First, collect the ranges of commented components to exclude them
  const excludeRanges: Array<{start: number, end: number}> = []
  allComponents.forEach(comp => {
    const start = html.indexOf(comp.html)
    if (start !== -1) {
      excludeRanges.push({
        start: start,
        end: start + comp.html.length
      })
    }
  })
  
  const completeStructures = findCompleteHtmlStructures(html, excludeRanges)
  
  // Add complete structures that don't overlap with commented components
  // We need to determine their actual position in the HTML to maintain order
  completeStructures.forEach((structure) => {
    const type = detectComponentType(structure.html)
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    allComponents.push({
      type,
      html: structure.html,
      id,
      order: structure.start, // Use the actual position in HTML for ordering
      originalHtml: structure.html
    })
  })
  
  // Sort components by their position in the original HTML
  allComponents.sort((a, b) => a.order - b.order)
  
  // Debug logging to verify order
  console.log('[parseComponents] Component order:', allComponents.map(c => ({ type: c.type, order: c.order, position: c.order })))
  
  // Convert to final component format
  allComponents.forEach((comp) => {
    const config = extractComponentConfig(comp.html, comp.type)
    
    components.push({
      id: comp.id,
      type: comp.type,
      config,
      html: comp.originalHtml // Use the original HTML to preserve formatting
    })
  })

  return components
}

function findCompleteHtmlStructures(html: string, excludeRanges: Array<{start: number, end: number}> = []): Array<{html: string, start: number, end: number}> {
  const structures: Array<{html: string, start: number, end: number}> = []
  let currentIndex = 0
  
  while (currentIndex < html.length) {
    // Skip whitespace and comments
    while (currentIndex < html.length && /[\s\n\r]/.test(html[currentIndex])) {
      currentIndex++
    }
    
    if (currentIndex >= html.length) break
    
    // Skip HTML comments
    if (html.substring(currentIndex, currentIndex + 4) === '<!--') {
      const commentEnd = html.indexOf('-->', currentIndex)
      if (commentEnd === -1) break
      currentIndex = commentEnd + 3
      continue
    }
    
    // Look for opening tag
    const tagMatch = html.substring(currentIndex).match(/<([a-zA-Z][a-zA-Z0-9-_]*)[^>]*>/)
    if (!tagMatch) {
      currentIndex++
      continue
    }
    
    const tagName = tagMatch[1].toLowerCase()
    const tagStart = currentIndex + tagMatch.index!
    
    // Skip self-closing tags
    if (tagMatch[0].endsWith('/>')) {
      currentIndex = tagStart + tagMatch[0].length
      continue
    }
    
    // Find the corresponding closing tag
    let depth = 0
    let closingTagIndex = -1
    
    for (let i = tagStart; i < html.length; i++) {
      if (html.substring(i, i + 1) === '<') {
        if (html.substring(i, i + 2) === '</') {
          // Closing tag
          const closingTagMatch = html.substring(i).match(/<\/([a-zA-Z][a-zA-Z0-9-_]*)[^>]*>/)
          if (closingTagMatch && closingTagMatch[1].toLowerCase() === tagName) {
            depth--
            if (depth === 0) {
              closingTagIndex = i + closingTagMatch[0].length
              break
            }
          }
        } else {
          // Opening tag
          const openingTagMatch = html.substring(i).match(/<([a-zA-Z][a-zA-Z0-9-_]*)[^>]*>/)
          if (openingTagMatch && openingTagMatch[1].toLowerCase() === tagName) {
            depth++
          }
        }
      }
    }
    
    if (closingTagIndex !== -1) {
      const componentHtml = html.substring(tagStart, closingTagIndex).trim()
      
      // Check if this range overlaps with any excluded ranges
      const isOverlapping = excludeRanges.some(range => 
        (tagStart >= range.start && tagStart < range.end) ||
        (closingTagIndex > range.start && closingTagIndex <= range.end) ||
        (tagStart <= range.start && closingTagIndex >= range.end)
      )
      
      if (!isOverlapping && componentHtml.length > 0) {
        structures.push({
          html: componentHtml,
          start: tagStart,
          end: closingTagIndex
        })
      }
      
      currentIndex = closingTagIndex
    } else {
      currentIndex++
    }
  }
  
  return structures
}

function cleanHtml(html: string): string {
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '')
  html = html.replace(/\s+style="[^"]*"/g, '')
  html = html.replace(/\s+x-[^=\s>]+(="[^"]*")?/g, '')
  html = html.replace(/\s+(async|defer)/g, '')
  html = html.replace(/\s+class=""/g, '')
  html = html.replace(/\s+data-[^=\s>]+(="[^"]*")?/g, '')
  html = html.replace(/\s+aria-[^=\s>]+(="[^"]*")?/g, '')
  
  return html.trim()
}

function addComponentIdToFirstElement(html: string, componentId: string): string {
  // Find the first HTML element (not comment or text)
  const firstElementMatch = html.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/)
  
  if (!firstElementMatch) {
    return html
  }

  const firstElement = firstElementMatch[0]
  const tagName = firstElementMatch[1]
  
  // Check if the element already has a data-component-id attribute
  if (firstElement.includes('data-component-id=')) {
    return html
  }

  // For showroom components, try to find the main showroom-component div
  if (componentId.includes('products-showroom')) {
    const showroomMatch = html.match(/<div[^>]*class="showroom-component"[^>]*>/)
    if (showroomMatch) {
      const showroomElement = showroomMatch[0]
      if (!showroomElement.includes('data-component-id=')) {
        const newShowroomElement = showroomElement.replace(
          /<div([^>]*class="showroom-component"[^>]*)>/,
          `<div$1 data-component-id="${componentId}">`
        )
        return html.replace(showroomElement, newShowroomElement)
      }
    }
  }

  // Add data-component-id attribute to the first element
  const newFirstElement = firstElement.replace(
    new RegExp(`<${tagName}([^>]*)>`),
    `<${tagName}$1 data-component-id="${componentId}">`
  )

  return html.replace(firstElement, newFirstElement)
}
