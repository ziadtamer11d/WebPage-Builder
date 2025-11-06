"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  Trash2, 
  GripVertical,
  ChevronDown,
  ChevronUp,
  Filter,
  AlertCircle,
  Download
} from "lucide-react"
import { settingsModel } from "@/lib/settings-model"

interface Product {
  objectID: string
  id_code_model: string
  product_name?: string
  name?: string
  image_urls?: string[]
  image_url?: string
  images?: string[]
  thumbnail?: string
  image?: any
  prix?: number
  regular?: number
  currency?: string
  percentoff?: number
  available?: boolean | string
  brand?: string
  category?: string
  category_name?: string
  genders?: string[]
  nature?: string
  practices?: string[]
  [key: string]: any
}

interface FacetCounts {
  [facet: string]: {
    [value: string]: number
  }
}

interface ModelConverterDialogProps {
  isOpen: boolean
  onClose: () => void
}

const FACET_KEYS = ['available', 'brand', 'category', 'category_name', 'genders', 'nature', 'practices']

const FACET_DISPLAY_NAMES: Record<string, string> = {
  'available': 'Available',
  'brand': 'Brand',
  'category': 'Category',
  'category_name': 'Category Name',
  'genders': 'Genders',
  'nature': 'Nature',
  'practices': 'Practices'
}

export function ModelConverterDialog({ isOpen, onClose }: ModelConverterDialogProps) {
  const [modelCodesInput, setModelCodesInput] = useState("")
  const [foundProducts, setFoundProducts] = useState<Product[]>([])
  const [notFoundCodes, setNotFoundCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedState, setCopiedState] = useState<'idle' | 'objectids' | 'modelcodes' | 'array'>('idle')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  
  // Filter states
  const [showFilters, setShowFilters] = useState(true)
  const [facetsData, setFacetsData] = useState<FacetCounts>({})
  const [currentFilters, setCurrentFilters] = useState<Record<string, string[]>>({})
  const [facetSearch, setFacetSearch] = useState("")
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(new Set(['brand', 'available']))

  // Compute facets from products
  const computeFacetsFromHits = useCallback((hits: Product[], facetKeys: string[] = FACET_KEYS) => {
    const facetValueToModels: Record<string, Record<string, Set<string>>> = {}
    facetKeys.forEach(key => { facetValueToModels[key] = {} })

    hits.forEach(hit => {
      const modelCode = hit.id_code_model ?? hit.objectID
      facetKeys.forEach(key => {
        const raw = hit[key]
        if (raw === undefined || raw === null) return
        const values = Array.isArray(raw) ? raw : [raw]
        values.forEach(v => {
          const val = String(v)
          if (!facetValueToModels[key][val]) {
            facetValueToModels[key][val] = new Set()
          }
          facetValueToModels[key][val].add(modelCode)
        })
      })
    })

    const result: FacetCounts = {}
    facetKeys.forEach(key => {
      result[key] = {}
      Object.keys(facetValueToModels[key]).forEach(val => {
        result[key][val] = facetValueToModels[key][val].size
      })
    })
    return result
  }, [])

  // Convert model codes to ObjectIDs
  const convertToObjectIDs = async () => {
    if (!modelCodesInput.trim()) {
      alert('Please enter model codes')
      return
    }

    const modelCodes = [...new Set(
      modelCodesInput
        .split(/[\n,]/)
        .map(code => code.trim())
        .filter(code => code.length > 0)
    )]

    if (modelCodes.length === 0) {
      alert('No valid model codes found')
      return
    }

    setIsLoading(true)
    setFoundProducts([])
    setNotFoundCodes([])

    try {
      const settings = settingsModel.getSettings()
      const clientAlg = (window as any).algoliasearch(settings.app_id, settings.api_search_key)
      const indexAlg = clientAlg.initIndex(settings.index_name)

      const foundProductsTemp: Product[] = []
      const notFoundCodesTemp: string[] = []
      const processedObjectIDs = new Set<string>()

      for (const modelCode of modelCodes) {
        try {
          const searchResult = await indexAlg.search('', {
            filters: `id_code_model:${modelCode}`,
            hitsPerPage: 1,
            analytics: false,
          })

          if (searchResult.hits && searchResult.hits.length > 0) {
            const hit = searchResult.hits[0] as Product
            if (!processedObjectIDs.has(hit.objectID)) {
              foundProductsTemp.push(hit)
              processedObjectIDs.add(hit.objectID)
            }
          } else {
            notFoundCodesTemp.push(modelCode)
          }
        } catch (error) {
          console.error(`Error searching for model ${modelCode}:`, error)
          notFoundCodesTemp.push(modelCode)
        }
      }

      setFoundProducts(foundProductsTemp)
      setNotFoundCodes(notFoundCodesTemp)
      
      // Compute facets from found products
      const facets = computeFacetsFromHits(foundProductsTemp)
      setFacetsData(facets)
    } catch (error) {
      console.error('Algolia error:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters to products
  const applyFilters = useCallback((products: Product[], filters: Record<string, string[]>) => {
    if (Object.keys(filters).length === 0) {
      return products
    }

    return products.filter(product => {
      return Object.entries(filters).every(([facet, values]) => {
        if (values.length === 0) return true
        
        const productValue = product[facet]
        if (productValue === undefined || productValue === null) return false
        
        const productValues = Array.isArray(productValue) ? productValue : [productValue]
        return productValues.some(v => values.includes(String(v)))
      })
    })
  }, [])

  // Handle filter change
  const handleFilterChange = useCallback((facet: string, value: string, checked: boolean) => {
    setCurrentFilters(prev => {
      const newFilters = { ...prev }
      if (!newFilters[facet]) {
        newFilters[facet] = []
      }
      
      if (checked) {
        if (!newFilters[facet].includes(value)) {
          newFilters[facet].push(value)
        }
      } else {
        newFilters[facet] = newFilters[facet].filter(v => v !== value)
        if (newFilters[facet].length === 0) {
          delete newFilters[facet]
        }
      }
      
      return newFilters
    })
  }, [])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setCurrentFilters({})
  }, [])

  // Get filtered products - memoized to prevent infinite loops
  const filteredProducts = useMemo(() => {
    return applyFilters(foundProducts, currentFilters)
  }, [foundProducts, currentFilters, applyFilters])

  // Get product image URL
  const getProductImageUrl = (product: Product): string | null => {
    if (product.image_urls && product.image_urls.length > 0) {
      return updateImageUrl(product.image_urls[0])
    }
    if (product.image_url) {
      return updateImageUrl(product.image_url)
    }
    if (product.images && product.images.length > 0) {
      return updateImageUrl(product.images[0])
    }
    if (product.thumbnail) {
      return updateImageUrl(product.thumbnail)
    }
    if (product.image && typeof product.image === 'object') {
      if (product.image.url) return updateImageUrl(product.image.url)
      if (product.image.src) return updateImageUrl(product.image.src)
    }
    if (product.image && typeof product.image === 'string') {
      return updateImageUrl(product.image)
    }
    return null
  }

  const updateImageUrl = (url: string): string => {
    if (!url) return ''
    const newParams = "format=auto&quality=60&f=300x300"
    if (url.indexOf("?") > -1) {
      const urlParts = url.split("?")
      return `${urlParts[0]}?${newParams}`
    } else {
      return `${url}?${newParams}`
    }
  }

  // Get price display
  const getPriceDisplay = (product: Product) => {
    const currency = product.currency || 'EGP'
    const currentPrice = product.prix
    const originalPrice = product.regular
    
    if (!currentPrice && !originalPrice) {
      return <span className="text-xs text-gray-500">Price N/A</span>
    }

    const isDiscounted = currentPrice && originalPrice && (currentPrice < originalPrice)

    if (isDiscounted) {
      const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      return (
        <div className="flex flex-wrap items-center justify-center gap-1">
          <Badge variant="destructive" className="text-xs">
            {currency}{currentPrice}
          </Badge>
          <span className="text-xs line-through text-gray-400">
            {currency}{originalPrice}
          </span>
          <span className="text-xs font-bold text-red-600">-{discountPercent}%</span>
        </div>
      )
    } else {
      const displayPrice = currentPrice || originalPrice
      return (
        <Badge variant="secondary" className="bg-yellow-400 text-gray-900 text-xs">
          {currency}{displayPrice}
        </Badge>
      )
    }
  }

  // Copy functions
  const copyModelCodes = () => {
    const codes = filteredProducts.map(p => p.id_code_model).filter(Boolean).join('\n')
    navigator.clipboard.writeText(codes).then(() => {
      setCopiedState('modelcodes')
      setTimeout(() => setCopiedState('idle'), 2000)
    })
  }

  const copyObjectIDs = () => {
    const ids = filteredProducts.map(p => p.objectID).join('\n')
    navigator.clipboard.writeText(ids).then(() => {
      setCopiedState('objectids')
      setTimeout(() => setCopiedState('idle'), 2000)
    })
  }

  const copyAsArray = () => {
    const ids = filteredProducts.map(p => `'${p.objectID}'`)
    const arrayString = `[${ids.join(', ')}]`
    navigator.clipboard.writeText(arrayString).then(() => {
      setCopiedState('array')
      setTimeout(() => setCopiedState('idle'), 2000)
    })
  }

  const clearAll = () => {
    setModelCodesInput("")
    setFoundProducts([])
    setNotFoundCodes([])
    setCurrentFilters({})
    setFacetsData({})
  }

  // Remove product
  const removeProduct = (index: number) => {
    setFoundProducts(prev => prev.filter((_, i) => i !== index))
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newProducts = [...foundProducts]
    const draggedProduct = newProducts[draggedIndex]
    newProducts.splice(draggedIndex, 1)
    newProducts.splice(index, 0, draggedProduct)
    
    setFoundProducts(newProducts)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Toggle facet expansion
  const toggleFacet = (facet: string) => {
    setExpandedFacets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(facet)) {
        newSet.delete(facet)
      } else {
        newSet.add(facet)
      }
      return newSet
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔄 Model Code to ObjectID Converter
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Filter Sidebar */}
          {foundProducts.length > 0 && (
            <div className={`${showFilters ? 'w-64' : 'w-12'} transition-all duration-300 border-r flex flex-col`}>
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className={`font-semibold ${!showFilters && 'hidden'}`}>Facets</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-6 w-6 p-0"
                >
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                </Button>
              </div>
              
              {showFilters && (
                <>
                  <div className="p-3 border-b">
                    <Input
                      placeholder="Search facets..."
                      value={facetSearch}
                      onChange={(e) => setFacetSearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="w-full h-8 text-xs"
                    >
                      Clear All Filters
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                      {Object.entries(facetsData).map(([facetKey, facetValues]) => {
                        const sortedValues = Object.entries(facetValues)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, expandedFacets.has(facetKey) ? undefined : 5)
                        
                        if (sortedValues.length === 0) return null

                        const matchesSearch = facetSearch === '' || 
                          FACET_DISPLAY_NAMES[facetKey].toLowerCase().includes(facetSearch.toLowerCase()) ||
                          sortedValues.some(([value]) => value.toLowerCase().includes(facetSearch.toLowerCase()))

                        if (!matchesSearch) return null

                        return (
                          <div key={facetKey} className="border rounded-lg p-2">
                            <button
                              onClick={() => toggleFacet(facetKey)}
                              className="flex items-center justify-between w-full mb-2 hover:text-blue-600"
                            >
                              <span className="text-sm font-semibold">
                                {FACET_DISPLAY_NAMES[facetKey]}
                              </span>
                              {expandedFacets.has(facetKey) ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                            
                            {expandedFacets.has(facetKey) && (
                              <div className="space-y-1">
                                {sortedValues.map(([value, count]) => (
                                  <div key={value} className="flex items-center gap-2">
                                    <Checkbox
                                      id={`${facetKey}-${value}`}
                                      checked={currentFilters[facetKey]?.includes(value) || false}
                                      onCheckedChange={(checked) => 
                                        handleFilterChange(facetKey, value, checked as boolean)
                                      }
                                    />
                                    <label
                                      htmlFor={`${facetKey}-${value}`}
                                      className="flex-1 text-xs cursor-pointer hover:text-blue-600"
                                    >
                                      {value}
                                    </label>
                                    <Badge variant="secondary" className="text-xs h-5">
                                      {count}
                                    </Badge>
                                  </div>
                                ))}
                                {Object.keys(facetValues).length > 5 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleFacet(facetKey)}
                                    className="w-full h-6 text-xs text-blue-600"
                                  >
                                    {expandedFacets.has(facetKey) ? 'Show less' : `Show ${Object.keys(facetValues).length - 5} more`}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 space-y-4 border-b">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>How it works:</strong> Enter model codes and this tool will search Algolia using the <code className="bg-blue-100 px-1 py-0.5 rounded">id_code_model</code> field to find the corresponding ObjectIDs.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelCodes">Enter Model Codes (one per line or comma-separated)</Label>
                <Textarea
                  id="modelCodes"
                  value={modelCodesInput}
                  onChange={(e) => setModelCodesInput(e.target.value)}
                  placeholder="Enter model codes here:&#10;8636987&#10;8550300&#10;8576080&#10;..."
                  className="font-mono text-sm min-h-[120px]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={convertToObjectIDs}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Convert to ObjectIDs
                    </>
                  )}
                </Button>
                
                {foundProducts.length > 0 && (
                  <>
                    <Button
                      onClick={copyModelCodes}
                      variant="outline"
                      disabled={filteredProducts.length === 0}
                    >
                      {copiedState === 'modelcodes' ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Model Codes
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={copyObjectIDs}
                      variant="outline"
                      disabled={filteredProducts.length === 0}
                    >
                      {copiedState === 'objectids' ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy ObjectIDs
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={copyAsArray}
                      variant="outline"
                      disabled={filteredProducts.length === 0}
                    >
                      {copiedState === 'array' ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Copy as Array
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={clearAll}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Results Area */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {foundProducts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="default" className="bg-green-600">
                        Found: {filteredProducts.length}
                      </Badge>
                      {notFoundCodes.length > 0 && (
                        <Badge variant="destructive">
                          Not Found: {notFoundCodes.length}
                        </Badge>
                      )}
                      {Object.keys(currentFilters).length > 0 && (
                        <Badge variant="outline">
                          {Object.keys(currentFilters).length} filter(s) active
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {filteredProducts.map((product, index) => {
                        const imageUrl = getProductImageUrl(product)
                        return (
                          <div
                            key={product.objectID}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-move ${
                              draggedIndex === index ? 'opacity-50' : ''
                            }`}
                          >
                            <button
                              onClick={() => removeProduct(index)}
                              className="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 h-5 w-5 flex items-center justify-center"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            
                            <div className="absolute top-1 left-1 z-10 bg-white/90 rounded-full px-2 py-0.5 text-xs font-bold text-gray-600">
                              {index + 1}
                            </div>

                            <div className="aspect-square bg-gray-100 flex items-center justify-center p-2 cursor-grab active:cursor-grabbing">
                              <GripVertical className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-gray-300 opacity-0 group-hover:opacity-100" />
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={product.product_name || product.name || 'Product'}
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <div className="text-xs text-gray-400">No Image</div>
                              )}
                            </div>

                            <div className="p-2 space-y-1">
                              <div className="text-xs font-medium line-clamp-2 min-h-[2rem]">
                                {product.product_name || product.name || 'Unknown Product'}
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <Badge variant="outline" className="text-xs justify-center">
                                  {product.objectID}
                                </Badge>
                                <Badge variant="secondary" className="text-xs justify-center">
                                  {product.id_code_model}
                                </Badge>
                              </div>

                              <div className="flex justify-center">
                                {getPriceDisplay(product)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {notFoundCodes.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-900 mb-2">Model Codes Not Found:</h4>
                            <div className="flex flex-wrap gap-1">
                              {notFoundCodes.map(code => (
                                <Badge key={code} variant="destructive" className="text-xs">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

