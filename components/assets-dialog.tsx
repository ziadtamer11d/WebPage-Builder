"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, ExternalLink, RotateCcw } from "lucide-react"
import { AssetRegistry } from "@/lib/asset-registry"

interface Asset {
  type: "css" | "js"
  url: string
  id: string
}

interface AssetsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

// LocalStorage keys
const STORAGE_KEY_CSS = "custom_css_assets"
const STORAGE_KEY_JS = "custom_js_assets"
const STORAGE_KEY_INLINE_CSS = "custom_inline_css"
const STORAGE_KEY_INLINE_JS = "custom_inline_js"

export function AssetsDialog({ isOpen, onClose, onSave }: AssetsDialogProps) {
  const [cssAssets, setCssAssets] = useState<Asset[]>([])
  const [jsAssets, setJsAssets] = useState<Asset[]>([])
  const [newCssUrl, setNewCssUrl] = useState("")
  const [newJsUrl, setNewJsUrl] = useState("")
  const [inlineCss, setInlineCss] = useState("")
  const [inlineJs, setInlineJs] = useState("")

  // Load assets from registry and localStorage
  useEffect(() => {
    if (isOpen) {
      // Try to load from localStorage first
      const savedCss = localStorage.getItem(STORAGE_KEY_CSS)
      const savedJs = localStorage.getItem(STORAGE_KEY_JS)
      
      if (savedCss && savedJs) {
        // Load saved assets
        setCssAssets(JSON.parse(savedCss))
        setJsAssets(JSON.parse(savedJs))
        return
      }

      // Get default assets from AssetRegistry
      const defaultAssets = [
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.css",
          id: "banner-carousel-css",
        },
        {
          type: "css" as const,
          url: "https://unpkg.com/@vtmn/css-button",
          id: "vtmn-button-css",
        },
        {
          type: "css" as const,
          url: "https://unpkg.com/swiper/swiper-bundle.min.css",
          id: "swiper-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/4%20blocks.css",
          id: "four-blocks-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/8%20icons.css",
          id: "eight-icons-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/ShowroomFinal.css",
          id: "showroom-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Page%20stretch.css",
          id: "page-stretch-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/dual%20section.css",
          id: "dual-section-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/hero%20banner.css",
          id: "hero-banner-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/info%20grid%20section.css",
          id: "info-grid-section-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/faqs%20section.css",
          id: "faqs-section-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/homepage.css",
          id: "homepage-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/horizontal_wrapper.css",
          id: "horizontal-wrapper-css",
        },
        {
          type: "css" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/categories_swiper.css",
          id: "categories-swiper-css",
        },
        {
          type: "js" as const,
          url: "https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js",
          id: "algolia-search-js",
        },
        {
          type: "js" as const,
          url: "https://unpkg.com/@alpinejs/intersect@3.8.1/dist/cdn.min.js",
          id: "alpine-intersect-js",
        },
        {
          type: "js" as const,
          url: "https://unpkg.com/alpinejs@3.8.1/dist/cdn.min.js",
          id: "alpine-js",
        },
        {
          type: "js" as const,
          url: "https://unpkg.com/swiper/swiper-bundle.min.js",
          id: "swiper-js",
        },
        {
          type: "js" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.js",
          id: "banner-carousel-js",
        },
        {
          type: "js" as const,
          url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/categories_swiper.js",
          id: "categories-swiper-js",
        },
      ]

      setCssAssets(defaultAssets.filter(a => a.type === "css"))
      setJsAssets(defaultAssets.filter(a => a.type === "js"))
      
      // Load inline CSS and JS
      const savedInlineCss = localStorage.getItem(STORAGE_KEY_INLINE_CSS)
      const savedInlineJs = localStorage.getItem(STORAGE_KEY_INLINE_JS)
      
      setInlineCss(savedInlineCss || "/* Add your custom CSS here */\n")
      setInlineJs(savedInlineJs || "// Add your custom JavaScript here\n")
    }
  }, [isOpen])

  const handleAddCss = () => {
    if (newCssUrl.trim()) {
      const newAsset: Asset = {
        type: "css",
        url: newCssUrl.trim(),
        id: `custom-css-${Date.now()}`,
      }
      setCssAssets([...cssAssets, newAsset])
      setNewCssUrl("")
    }
  }

  const handleAddJs = () => {
    if (newJsUrl.trim()) {
      const newAsset: Asset = {
        type: "js",
        url: newJsUrl.trim(),
        id: `custom-js-${Date.now()}`,
      }
      setJsAssets([...jsAssets, newAsset])
      setNewJsUrl("")
    }
  }

  const handleRemoveCss = (id: string) => {
    setCssAssets(cssAssets.filter(a => a.id !== id))
  }

  const handleRemoveJs = (id: string) => {
    setJsAssets(jsAssets.filter(a => a.id !== id))
  }

  const handleUpdateCssUrl = (id: string, newUrl: string) => {
    setCssAssets(cssAssets.map(a => a.id === id ? { ...a, url: newUrl } : a))
  }

  const handleUpdateJsUrl = (id: string, newUrl: string) => {
    setJsAssets(jsAssets.map(a => a.id === id ? { ...a, url: newUrl } : a))
  }

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY_CSS, JSON.stringify(cssAssets))
    localStorage.setItem(STORAGE_KEY_JS, JSON.stringify(jsAssets))
    localStorage.setItem(STORAGE_KEY_INLINE_CSS, inlineCss)
    localStorage.setItem(STORAGE_KEY_INLINE_JS, inlineJs)
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave()
    }
    
    onClose()
  }

  // Helper function to extract friendly name from URL
  const getFriendlyName = (url: string) => {
    try {
      // Get the last part of the URL (filename)
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1]
      
      // Remove file extension
      const nameWithoutExt = filename.replace(/\.(css|js)$/i, '')
      
      // Decode URL encoding (e.g., %20 -> space)
      const decoded = decodeURIComponent(nameWithoutExt)
      
      // Replace common separators with spaces and clean up
      const cleaned = decoded
        .replace(/[-_]/g, ' ')
        .trim()
      
      return cleaned || filename
    } catch (e) {
      return url
    }
  }

  const handleResetToDefaults = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY_CSS)
    localStorage.removeItem(STORAGE_KEY_JS)
    localStorage.removeItem(STORAGE_KEY_INLINE_CSS)
    localStorage.removeItem(STORAGE_KEY_INLINE_JS)
    
    // Reload the assets by calling the useEffect logic manually
    const defaultAssets = [
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.css",
        id: "banner-carousel-css",
      },
      {
        type: "css" as const,
        url: "https://unpkg.com/@vtmn/css-button",
        id: "vtmn-button-css",
      },
      {
        type: "css" as const,
        url: "https://unpkg.com/swiper/swiper-bundle.min.css",
        id: "swiper-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/4%20blocks.css",
        id: "four-blocks-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/8%20icons.css",
        id: "eight-icons-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/ShowroomFinal.css",
        id: "showroom-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Page%20stretch.css",
        id: "page-stretch-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/dual%20section.css",
        id: "dual-section-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/hero%20banner.css",
        id: "hero-banner-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/info%20grid%20section.css",
        id: "info-grid-section-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/faqs%20section.css",
        id: "faqs-section-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/homepage.css",
        id: "homepage-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/horizontal_wrapper.css",
        id: "horizontal-wrapper-css",
      },
      {
        type: "css" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/categories_swiper.css",
        id: "categories-swiper-css",
      },
      {
        type: "js" as const,
        url: "https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js",
        id: "algolia-search-js",
      },
      {
        type: "js" as const,
        url: "https://unpkg.com/@alpinejs/intersect@3.8.1/dist/cdn.min.js",
        id: "alpine-intersect-js",
      },
      {
        type: "js" as const,
        url: "https://unpkg.com/alpinejs@3.8.1/dist/cdn.min.js",
        id: "alpine-js",
      },
      {
        type: "js" as const,
        url: "https://unpkg.com/swiper/swiper-bundle.min.js",
        id: "swiper-js",
      },
      {
        type: "js" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/Banner%20carousel.js",
        id: "banner-carousel-js",
      },
      {
        type: "js" as const,
        url: "https://decathlon-egypt.github.io/Decathlon-Egypt/CMS%20Scripts%20&%20Styles/categories_swiper.js",
        id: "categories-swiper-js",
      },
    ]

    setCssAssets(defaultAssets.filter(a => a.type === "css"))
    setJsAssets(defaultAssets.filter(a => a.type === "js"))
    setInlineCss("/* Add your custom CSS here */\n")
    setInlineJs("// Add your custom JavaScript here\n")
    
    // Call the onSave callback to refresh preview
    if (onSave) {
      onSave()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>View & Edit Scripts and Styles</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="css" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="css">CSS Files ({cssAssets.length})</TabsTrigger>
            <TabsTrigger value="js">JS Files ({jsAssets.length})</TabsTrigger>
            <TabsTrigger value="inline-css">Inline CSS</TabsTrigger>
            <TabsTrigger value="inline-js">Inline JS</TabsTrigger>
          </TabsList>

          <TabsContent value="css" className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">ℹ️ About CSS Assets</h4>
                <p className="text-sm text-blue-800">
                  These are the CSS stylesheets that will be included in your exported code. You can add custom CSS files or modify existing URLs.
                </p>
              </div>

              {/* Add new CSS */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <Label htmlFor="new-css">Add New CSS File</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="new-css"
                    value={newCssUrl}
                    onChange={(e) => setNewCssUrl(e.target.value)}
                    placeholder="https://example.com/styles.css"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCss()}
                  />
                  <Button onClick={handleAddCss} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Existing CSS files */}
              <div className="space-y-3">
                {cssAssets.map((asset, index) => (
                  <div key={asset.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Label className="text-sm font-medium">{getFriendlyName(asset.url)}</Label>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(asset.url, '_blank')}
                          className="h-8 w-8 p-0"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCss(asset.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      value={asset.url}
                      onChange={(e) => handleUpdateCssUrl(asset.id, e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="js" className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ About JavaScript Assets</h4>
                <p className="text-sm text-yellow-800">
                  These are the JavaScript files required for interactive components. Be careful when modifying these URLs as it may break functionality.
                </p>
              </div>

              {/* Add new JS */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <Label htmlFor="new-js">Add New JavaScript File</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="new-js"
                    value={newJsUrl}
                    onChange={(e) => setNewJsUrl(e.target.value)}
                    placeholder="https://example.com/script.js"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddJs()}
                  />
                  <Button onClick={handleAddJs} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Existing JS files */}
              <div className="space-y-3">
                {jsAssets.map((asset, index) => (
                  <div key={asset.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Label className="text-sm font-medium">{getFriendlyName(asset.url)}</Label>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(asset.url, '_blank')}
                          className="h-8 w-8 p-0"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveJs(asset.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      value={asset.url}
                      onChange={(e) => handleUpdateJsUrl(asset.id, e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inline-css" className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">📝 Inline CSS</h4>
                <p className="text-sm text-purple-800">
                  Add custom CSS that will be included in a &lt;style&gt; tag in your exported code. This is useful for component-specific styles.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inline-css-editor">Custom CSS Code</Label>
                <Textarea
                  id="inline-css-editor"
                  value={inlineCss}
                  onChange={(e) => setInlineCss(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="/* Your custom CSS here */"
                />
                <p className="text-xs text-gray-500">
                  This CSS will be wrapped in &lt;style&gt; tags and included in your exported HTML.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inline-js" className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-900 mb-2">⚡ Inline JavaScript</h4>
                <p className="text-sm text-orange-800">
                  Add custom JavaScript that will be included in a &lt;script&gt; tag in your exported code. Be careful as this code will execute when the page loads.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inline-js-editor">Custom JavaScript Code</Label>
                <Textarea
                  id="inline-js-editor"
                  value={inlineJs}
                  onChange={(e) => setInlineJs(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="// Your custom JavaScript here"
                />
                <p className="text-xs text-gray-500">
                  This JavaScript will be wrapped in &lt;script&gt; tags and included in your exported HTML.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between p-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleResetToDefaults}
            className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

