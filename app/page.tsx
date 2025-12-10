"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Settings as SettingsIcon, GripVertical, Copy, Check, Eye, Edit, ChevronUp, ChevronDown, Code, Smartphone, FileCode } from "lucide-react"
import { ComponentDialog } from "@/components/component-dialog"
import { AddComponentDialog } from "@/components/add-component-dialog"
import { MobileTutorialDialog } from "@/components/mobile-tutorial-dialog"
import { AssetsDialog } from "@/components/assets-dialog"
import { AssetRegistry } from "@/lib/asset-registry"
import { PreviewAssetRegistry } from "@/lib/preview-asset-registry"
import { ComponentRegistry } from "@/lib/component-registry"
import { generateHTML, parseComponents, cleanPastedCode } from "@/lib/html-generator"
import type { Component } from "@/types/component"
import type { Settings } from "@/types/settings"
import { ShowroomSettingsDialog } from "@/components/showroom-settings-dialog"
import { ModelConverterDialog } from "@/components/model-converter-dialog"
import { InventoryManagementDialog } from "@/components/inventory-management-dialog"
import Cookies from "js-cookie"
import { settingsModel } from "@/lib/settings-model"

// Cookie prefix constant
const COOKIE_PREFIX = "showroom_"

// Component type to display name mapping
const componentDisplayNames: Record<string, string> = {
  'swiper': 'Banner Carousel',
  'products-showroom': 'Products Showroom',
  'four-categories': 'Four Blocks',
  'eight-icons': 'Eight Icons',
  'style': 'Style',
  'script': 'Script',
  'custom': 'Custom'
}

export default function WebPageBuilder() {
  const [components, setComponents] = useState<Component[]>([])
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showMobileTutorial, setShowMobileTutorial] = useState(false)
  const [showAssetsDialog, setShowAssetsDialog] = useState(false)
  const [showModelConverter, setShowModelConverter] = useState(false)
  const [showInventoryManagement, setShowInventoryManagement] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set())
  const [hasSettings, setHasSettings] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [showingProducts, setShowingProducts] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [htmlCode, setHtmlCode] = useState("")
  const [activeTab, setActiveTab] = useState<'default' | 'custom'>('default')

  // Default settings fallback
  const DEFAULT_SETTINGS: Settings = {
    app_id: "TR53CBEI82",
    api_search_key: "98ef65e220d8d74a2dfac7a67f1dba11",
    index_name: "prod_en",
    currency: "EGP"
  }

  // Initialize settings from cookies
  useEffect(() => {
    // Get settings from cookies or fallback to defaults
    const app_id = Cookies.get(COOKIE_PREFIX + "app_id") || DEFAULT_SETTINGS.app_id
    const api_search_key = Cookies.get(COOKIE_PREFIX + "api_search_key") || DEFAULT_SETTINGS.api_search_key
    const index_name = Cookies.get(COOKIE_PREFIX + "index_name") || DEFAULT_SETTINGS.index_name
    const currency = Cookies.get(COOKIE_PREFIX + "currency") || DEFAULT_SETTINGS.currency

    // Always pass settings (from cookies or defaults)
    const settings: Settings = {
      app_id,
      api_search_key,
      index_name,
      currency
    }
    settingsModel.initializeSettings(settings)
    setSettings(settings)
    setHasSettings(true)
  }, [])

  // Log whenever components state changes
  useEffect(() => {
    console.log("[DEBUG] Components state updated:", components)
  }, [components])

  // Update HTML when components change
  useEffect(() => {
    if (!hasSettings) {
      return
    }

    const previewHtml = generateHTML(components, true)
    const codeHtml = generateHTML(components, false)
    setHtmlCode(codeHtml)

    // The useEffect that sets previewContainer.innerHTML is removed.
    // The preview HTML is now rendered directly in the JSX.
  }, [components, hasSettings, settings])

  // Inject Alpine.js functions globally
  useEffect(() => {
    if (!hasSettings) {
      return
    }

    // Define the functions globally
    (window as any).getProductsFromCategory = async function(prodCount: number, categoryNumber: string, priorityObjectIDs: string[] = []) {
      const settings = (window as any).settingsModel?.getSettings() || {};
      const clientAlg = (window as any).algoliasearch(settings.app_id, settings.api_search_key);
      const indexAlg = clientAlg.initIndex(settings.index_name);
      const objectIDFilters = priorityObjectIDs.map((id: string) => `objectID:${id}`).join(" OR ");

      try {
        const { hits: priorityHits } = await indexAlg.search("", {
          filters: objectIDFilters.length ? objectIDFilters : `category = ${categoryNumber}`,
          analytics: false,
        });

        if (priorityObjectIDs.length) {
          const { hits: categoryHits } = await indexAlg.search("", {
            filters: `category = ${categoryNumber}`,
            analytics: false,
          });

          const uniqueCategoryHits = categoryHits.filter(
            (hit: any) => !priorityObjectIDs.includes(hit.objectID)
          );

          return [...priorityHits, ...uniqueCategoryHits].slice(0, prodCount);
        } else {
          return priorityHits.sort((a: any, b: any) => b.popularity - a.popularity).slice(0, prodCount);
        }
      } catch (error) {
        return [];
      }
    };

    (window as any).getDiscountedProductsFromCategory = async function(prodCount: number, categoryNumber: string, priorityObjectIDs: string[] = []) {
      const settings = (window as any).settingsModel?.getSettings() || {};
      const clientAlg = (window as any).algoliasearch(settings.app_id, settings.api_search_key);
      const indexAlg = clientAlg.initIndex(settings.index_name);
      const objectIDFilters = priorityObjectIDs.map((id: string) => `objectID:${id}`).join(" OR ");

      try {
        const { hits: priorityHits } = await indexAlg.search("", {
          filters: objectIDFilters.length ? objectIDFilters : `category = ${categoryNumber} AND percentoff > 0`,
          analytics: false,
        });

        if (priorityObjectIDs.length) {
          const { hits: categoryHits } = await indexAlg.search("", {
            filters: `category = ${categoryNumber} AND percentoff > 0`,
            analytics: false,
          });

          const uniqueCategoryHits = categoryHits.filter(
            (hit: any) => !priorityObjectIDs.includes(hit.objectID)
          );

          return [...priorityHits, ...uniqueCategoryHits].slice(0, prodCount);
        } else {
          return priorityHits.sort((a: any, b: any) => b.popularity - a.popularity).slice(0, prodCount);
        }
      } catch (error) {
        return [];
      }
    };

    (window as any).getProductsManual = async function(objectIDs: string[] = []) {
      const settings = (window as any).settingsModel?.getSettings() || {};
      const clientAlg = (window as any).algoliasearch(settings.app_id, settings.api_search_key);
      const indexAlg = clientAlg.initIndex(settings.index_name);
      const objectIDFilters = objectIDs.map((id: string) => `objectID:${id}`).join(" OR ");

      try {
        const { hits } = await indexAlg.search("", {
          filters: objectIDFilters,
          analytics: false,
        });

        return hits;
      } catch (error) {
        return [];
      }
    };

    (window as any).updateImageUrl = function(url: string) {
      if (!url) return '';
      return url;
    };

    console.log('[Alpine] Functions injected globally');
  }, [hasSettings, settings]);

  const handleAddComponent = (type: string) => {
    if (type) {
      const template = ComponentRegistry.getTemplate(type)
      if (!template) {
        return
      }

      const newComponent: Component = {
        id: `${type}-${Date.now()}`,
        type,
        config: template.defaultConfig,
        html: "",  // Don't generate HTML yet
      }

      setSelectedComponent(newComponent)
      setShowAddDialog(false)
      setIsDialogOpen(true)
    }
  }

  const handleAddCustomComponent = (htmlCode: string) => {
    // Clean the pasted code first to remove any wrapper elements
    const cleanedCode = cleanPastedCode(htmlCode)
    const parsedComponents = parseComponents(cleanedCode)
    setComponents((prevComponents) => [...prevComponents, ...parsedComponents])
  }

  const handleEditComponent = (component: Component) => {
    setSelectedComponent(component)
    setIsDialogOpen(true)
  }

  const handleSaveComponent = (component: Component) => {
    const template = ComponentRegistry.getTemplate(component.type)
    if (template) {
      const generatedHtml = template.generateHTML(component.config)
      const updatedComponent = { ...component, html: generatedHtml }

      setComponents((prev) => {
        const existingIndex = prev.findIndex((c) => c.id === component.id)
        if (existingIndex >= 0) {
          const newComponents = [...prev]
          newComponents[existingIndex] = updatedComponent
          return newComponents
        } else {
          return [...prev, updatedComponent]  // Add new component here after configuration
        }
      })
    }
    setIsDialogOpen(false)
    setSelectedComponent(null)
    setShowingProducts(false)
  }

  const handleSaveComponentCode = (component: Component, newHtml: string) => {
    console.log("[handleSaveComponentCode] Starting to save code changes:", {
      componentId: component.id,
      componentType: component.type,
      newHtmlLength: newHtml.length
    })

    // Clean the pasted code first to remove any wrapper elements
    const cleanedHtml = cleanPastedCode(newHtml)
    
    // Parse the new HTML to extract updated configuration
    const parsedComponents = parseComponents(cleanedHtml)
    console.log("[handleSaveComponentCode] Parsed components:", parsedComponents)

    if (parsedComponents.length === 0) {
      console.warn("[handleSaveComponentCode] No components parsed from HTML, aborting save")
      return
    }

    // Get the parsed component's config and HTML
    const parsedComponent = parsedComponents[0]
    console.log("[handleSaveComponentCode] Using first parsed component:", {
      parsedType: parsedComponent.type,
      parsedConfig: parsedComponent.config
    })

    const updatedComponent = {
      ...component,
      config: parsedComponent.config,
      html: parsedComponent.html
    }
    console.log("[handleSaveComponentCode] Created updated component:", {
      id: updatedComponent.id,
      type: updatedComponent.type,
      configChanged: JSON.stringify(component.config) !== JSON.stringify(parsedComponent.config),
      htmlChanged: component.html !== parsedComponent.html
    })

    setComponents((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === component.id)
      console.log("[handleSaveComponentCode] Updating components state:", {
        found: existingIndex >= 0,
        index: existingIndex,
        totalComponents: prev.length
      })

      if (existingIndex >= 0) {
        const newComponents = [...prev]
        newComponents[existingIndex] = updatedComponent
        return newComponents
      }
      return prev
    })
    setIsDialogOpen(false)
    setSelectedComponent(null)
    setShowingProducts(false)
    console.log("[handleSaveComponentCode] Finished saving code changes")
  }

  const handleDeleteComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id))
    setShowingProducts(false)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(components)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setComponents(items)
    setShowingProducts(false)
  }

  const handleCopyCode = () => {
    const codeWithAssets = AssetRegistry.getCodeWithAssets(htmlCode)
    navigator.clipboard.writeText(codeWithAssets).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    })
  }

  const handleAssetsSaved = () => {
    // Clear and re-inject assets after saving
    PreviewAssetRegistry.clear()
    PreviewAssetRegistry.injectDefaultAssets()
    // Force a re-render by updating a dummy state
    setComponents([...components])
  }

  const handleShowProducts = () => {
    setShowingProducts(true)
    AssetRegistry.initializeInteractiveComponents()
    // The button will remain in loading state until components are modified or rearranged
  }

  const handleScrollToComponent = (componentId: string) => {
    // Find the component in the preview area
    const previewContainer = document.getElementById('preview')
    if (!previewContainer) {
      console.log('[Scroll] Preview container not found')
      return
    }

    // Find the component element by its ID
    let componentElement = previewContainer.querySelector(`[data-component-id="${componentId}"]`)
    
    // If not found, try alternative selectors for showroom components
    if (!componentElement && componentId.includes('products-showroom')) {
      // Try to find by showroom-component class
      componentElement = previewContainer.querySelector(`.showroom-component[data-component-id="${componentId}"]`)
      
      // If still not found, try to find any showroom component
      if (!componentElement) {
        const showroomElements = previewContainer.querySelectorAll('.showroom-component')
        if (showroomElements.length > 0) {
          // Find the showroom component that corresponds to this ID
          // This is a fallback for when the data-component-id is not properly set
          const componentIndex = components.findIndex(c => c.id === componentId)
          if (componentIndex >= 0 && showroomElements[componentIndex]) {
            componentElement = showroomElements[componentIndex]
          }
        }
      }
    }
    
    if (!componentElement) {
      console.log('[Scroll] Component element not found for ID:', componentId)
      return
    }

    console.log('[Scroll] Found component element:', componentElement)

    // Scroll to the component
    componentElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    })

    // Add highlight effect
    componentElement.classList.add('component-highlight')
    
    // Remove highlight after animation
    setTimeout(() => {
      componentElement.classList.remove('component-highlight')
    }, 2000)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Component List Sidebar */}
      <div className="w-[20%] bg-gray-50 border-r h-screen sidebar md:block hidden relative">
        {/* Top Fixed Header Section */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gray-50 border-b p-2 z-10">
          <div className="flex items-center justify-between h-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettingsDialog(true)}
              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-2 py-1"
            >
              <SettingsIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Algolia</span>
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileTutorial(true)}
                className="text-gray-500 hover:text-gray-700 h-8 w-8"
              >
                <Smartphone className="h-3 w-3" />
              </Button>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-8"
              >
                <Plus className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Middle Scrollable Components Area */}
        <div className="absolute top-20 bottom-32 left-0 right-0 overflow-y-auto">
          <div className="p-4">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="components">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {components.map((component, index) => (
                      <Draggable key={component.id} draggableId={component.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white p-3 rounded-lg mb-2 border flex items-center justify-between group ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab hover:bg-gray-50 p-1 rounded"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                              <span 
                              className="cursor-pointer hover:text-blue-600"
                              onClick={() => handleScrollToComponent(component.id)}
                            >
                              {componentDisplayNames[component.type] || component.type}
                            </span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditComponent(component)}
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                              >
                                <SettingsIcon className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteComponent(component.id)}
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Bottom Fixed Footer Section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gray-50 border-t p-2 z-10 flex flex-col gap-2">
          <Button onClick={handleCopyCode} size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full h-8 text-xs">
            {copiedCode ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Copy Code</span>
              </>
            )}
          </Button>
          <Button onClick={() => setShowAssetsDialog(true)} size="sm" variant="outline" className="w-full h-8 text-xs">
            <FileCode className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Scripts & Styles</span>
          </Button>
          <Button onClick={() => setShowModelConverter(true)} size="sm" variant="outline" className="w-full h-8 text-xs bg-purple-50 hover:bg-purple-100 border-purple-300">
            <Code className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Model Converter</span>
          </Button>
          <Button onClick={() => setShowInventoryManagement(true)} size="sm" variant="outline" className="w-full h-8 text-xs bg-green-50 hover:bg-green-100 border-green-300">
            <FileText className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Inventory</span>
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="md:w-[80%] w-full bg-white overflow-auto h-screen">
        <div className="min-h-full">
          {(() => {
            if (components.length > 0) {
              console.log("[DEBUG] Rendering preview area with components.")
              return (
                <div
                  id="preview"
                  className="preview-container"
                  dangerouslySetInnerHTML={{ __html: generateHTML(components, true) }}
                />
              )
            } else {
              console.log("[DEBUG] Rendering empty state (no components).")
              return (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center h-full">
                  <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Get Started with Your Page</p>
                  <p className="mb-6">Start fresh by adding components, or paste your existing page code to edit it.</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => setShowAddDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Component from Scratch
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddDialog(true)
                        setActiveTab('custom')
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Paste Existing Page Code
                    </Button>
                  </div>
                </div>
              )
            }
          })()}
        </div>
      </div>

      {/* Add Component Dialog */}
      <AddComponentDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSelectComponent={handleAddComponent}
        onAddCustomComponent={handleAddCustomComponent}
        activeTab={activeTab}
      />

      {/* Component Configuration Dialog */}
      {selectedComponent && (
        <ComponentDialog
          component={selectedComponent}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            setSelectedComponent(null)
          }}
          onSave={handleSaveComponent}
          onSaveCode={handleSaveComponentCode}
        />
      )}

      <MobileTutorialDialog
        isOpen={showMobileTutorial}
        onClose={() => setShowMobileTutorial(false)}
      />

      <ShowroomSettingsDialog
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
      />

      <AssetsDialog
        isOpen={showAssetsDialog}
        onClose={() => setShowAssetsDialog(false)}
        onSave={handleAssetsSaved}
      />

      <ModelConverterDialog
        isOpen={showModelConverter}
        onClose={() => setShowModelConverter(false)}
      />

      <InventoryManagementDialog
        isOpen={showInventoryManagement}
        onClose={() => setShowInventoryManagement(false)}
      />

      <style jsx global>{`
        .component-preview {
          margin: 0;
          padding: 0;
        }
        
        .component-preview > * {
          margin-top: 0;
          margin-bottom: 0;
        }

        /* Component highlight animation */
        .component-highlight {
          animation: highlight-pulse 2s ease-in-out;
        }

        @keyframes highlight-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            outline: 2px solid rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.3);
            outline: 2px solid rgba(59, 130, 246, 0.9);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            outline: 2px solid rgba(59, 130, 246, 0);
          }
        }

        /* Hide sidebar on mobile devices */
        @media (max-width: 767px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
