"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  Upload, 
  RefreshCw, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  X,
  Trash2,
  Plus
} from "lucide-react"
import Cookies from "js-cookie"

const COOKIE_PREFIX = "showroom_"

interface StoreStockItem {
  modelCode: string
  lifeCycle: number | ""
  totalStock: number
}

interface ETLItem {
  modelCode: string
}

interface NotAvailableItem {
  modelCode: string
  status: string
  stock: number
}

interface InventoryData {
  storeStock: StoreStockItem[]
  algoliaRecords: string[]
  etl: string[]
  oldEtl: string[]
  amiProducts: string[]
  productsToBeRemoved: string[]
  localizationTracker: string[]
  notAvailableOnline: NotAvailableItem[]
}

const STORAGE_KEY = "inventory_data"

export function InventoryManagementDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("store-stock")
  const [isLoading, setIsLoading] = useState(false)
  const [inventoryData, setInventoryData] = useState<InventoryData>({
    storeStock: [],
    algoliaRecords: [],
    etl: [],
    oldEtl: [],
    amiProducts: [],
    productsToBeRemoved: [],
    localizationTracker: [],
    notAvailableOnline: []
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setInventoryData(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load inventory data:", e)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventoryData))
    }
  }, [inventoryData, isOpen])

  const getAlgoliaSettings = () => {
    return {
      app_id: Cookies.get(COOKIE_PREFIX + "app_id") || "TR53CBEI82",
      api_key: Cookies.get(COOKIE_PREFIX + "api_search_key") || "98ef65e220d8d74a2dfac7a67f1dba11",
      index_name: Cookies.get(COOKIE_PREFIX + "index_name") || "prod_en"
    }
  }

  const fetchAlgoliaData = async () => {
    setIsLoading(true)
    try {
      const settings = getAlgoliaSettings()
      const endpoint = `https://${settings.app_id}-dsn.algolia.net/1/indexes/${settings.index_name}/browse`
      
      const data: string[] = []
      let cursor: string | null = null

      do {
        const url = cursor ? `${endpoint}?cursor=${cursor}` : endpoint
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "X-Algolia-API-Key": settings.api_key,
            "X-Algolia-Application-Id": settings.app_id
          }
        })

        if (!response.ok) {
          throw new Error(`Algolia API error: ${response.statusText}`)
        }

        const result = await response.json()
        
        result.hits.forEach((record: any) => {
          if (record.id_code_model) {
            data.push(record.id_code_model)
          }
        })

        cursor = result.cursor || null
      } while (cursor)

      setInventoryData(prev => ({ ...prev, algoliaRecords: data }))
      alert(`Successfully fetched ${data.length} model codes from Algolia`)
    } catch (error: any) {
      alert(`Error fetching Algolia data: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    result.push(current.trim())
    
    return result
  }

  const handleStoreStockImport = (text: string) => {
    const lines = text.trim().split("\n").filter(line => line.trim())
    if (lines.length < 2) {
      alert("Invalid CSV format. Expected: Model Code, Life Cycle, Total Stock")
      return
    }

    const headers = parseCSVLine(lines[0])
    const modelCodeIdx = headers.findIndex(h => h.toLowerCase().includes("model") && h.toLowerCase().includes("code"))
    const lifeCycleIdx = headers.findIndex(h => h.toLowerCase().includes("life") && h.toLowerCase().includes("cycle"))
    const stockIdx = headers.findIndex(h => (h.toLowerCase().includes("total") && h.toLowerCase().includes("stock")) || h.toLowerCase().includes("stock"))

    if (modelCodeIdx === -1 || stockIdx === -1) {
      alert("CSV must contain 'Model Code' and 'Total Stock' (or 'Stock') columns")
      return
    }

    const items: StoreStockItem[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length <= Math.max(modelCodeIdx, stockIdx)) continue
      
      const modelCode = values[modelCodeIdx]?.replace(/^"|"$/g, "") || ""
      const lifeCycleValue = lifeCycleIdx >= 0 ? (values[lifeCycleIdx]?.replace(/^"|"$/g, "") || "") : ""
      const lifeCycle = lifeCycleValue ? (parseInt(lifeCycleValue) || "") : ""
      const stockValue = values[stockIdx]?.replace(/^"|"$/g, "") || "0"
      const stock = parseInt(stockValue) || 0

      if (modelCode && stock > 0) {
        items.push({ modelCode, lifeCycle, totalStock: stock })
      }
    }

    setInventoryData(prev => ({ ...prev, storeStock: items }))
    alert(`Imported ${items.length} store stock items`)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      handleStoreStockImport(text)
    }
    reader.readAsText(file)
  }

  const updateInventory = () => {
    if (inventoryData.algoliaRecords.length === 0) {
      alert("Please fetch Algolia data first")
      return
    }

    // Backup ETL to old ETL
    const oldEtl = [...inventoryData.etl]

    // Create maps and sets
    const storeStockMap = new Map<string, number>()
    inventoryData.storeStock.forEach(item => {
      storeStockMap.set(item.modelCode, item.totalStock)
    })

    const etlSet = new Set(inventoryData.etl)
    const oldEtlSet = new Set(oldEtl)
    const algoliaSet = new Set(inventoryData.algoliaRecords)
    const amiProductsSet = new Set(inventoryData.amiProducts)
    const productsToBeRemovedSet = new Set(inventoryData.productsToBeRemoved)
    const localizationSet = new Set(inventoryData.localizationTracker)

    // Step 1: Remove from ETL if found in Store Stock
    const modelsToRemoveFromETL = inventoryData.etl.filter(model => storeStockMap.has(model))
    const newEtl = inventoryData.etl.filter(model => !storeStockMap.has(model))

    // Step 2: Add models to ETL from Algolia records not in Store Stock
    const modelsToAddToETL: string[] = []
    algoliaSet.forEach(model => {
      if (!storeStockMap.has(model) && !newEtl.includes(model)) {
        modelsToAddToETL.push(model)
      }
    })

    // Step 3: Add models from "Products to be removed" to ETL if not already present
    productsToBeRemovedSet.forEach(model => {
      if (!newEtl.includes(model)) {
        modelsToAddToETL.push(model)
      }
    })

    const finalEtl = [...newEtl, ...modelsToAddToETL]

    // Step 4: Build "Not available online" data
    const notAvailableOnline: NotAvailableItem[] = []
    storeStockMap.forEach((stock, model) => {
      if (!algoliaSet.has(model)) {
        let status = ""
        if (amiProductsSet.has(model)) {
          status = "AMI"
        } else if (productsToBeRemovedSet.has(model)) {
          status = "In products to be removed"
        } else if (localizationSet.has(model)) {
          status = "In localization Tracker"
        } else if (oldEtlSet.has(model)) {
          status = "In old ETL"
        }
        notAvailableOnline.push({ modelCode: model, status, stock })
      }
    })

    setInventoryData(prev => ({
      ...prev,
      etl: finalEtl,
      oldEtl: oldEtl,
      notAvailableOnline: notAvailableOnline
    }))

    alert(`Inventory updated!\n- ETL: ${finalEtl.length} models\n- Not available online: ${notAvailableOnline.length} models`)
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No data to export")
      return
    }

    let csv = ""
    if (Array.isArray(data[0])) {
      // Array of arrays
      csv = data.map(row => row.map((cell: any) => `"${cell}"`).join(",")).join("\n")
    } else if (typeof data[0] === "string") {
      // Array of strings
      csv = data.join("\n")
    } else {
      // Array of objects
      const headers = Object.keys(data[0])
      csv = headers.join(",") + "\n"
      csv += data.map(row => headers.map(h => `"${row[h] || ""}"`).join(",")).join("\n")
    }

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const addManualItem = (type: "ami" | "remove" | "localization", modelCode: string) => {
    if (!modelCode.trim()) return

    const key = type === "ami" ? "amiProducts" : type === "remove" ? "productsToBeRemoved" : "localizationTracker"
    setInventoryData(prev => ({
      ...prev,
      [key]: [...prev[key as keyof InventoryData] as string[], modelCode.trim()]
    }))
  }

  const removeItem = (type: "ami" | "remove" | "localization" | "etl", index: number) => {
    const key = type === "ami" ? "amiProducts" : 
                type === "remove" ? "productsToBeRemoved" : 
                type === "localization" ? "localizationTracker" : "etl"
    
    setInventoryData(prev => {
      const arr = [...(prev[key as keyof InventoryData] as string[])]
      arr.splice(index, 1)
      return { ...prev, [key]: arr }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Inventory Management</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="store-stock">Store Stock</TabsTrigger>
            <TabsTrigger value="algolia">Algolia Records</TabsTrigger>
            <TabsTrigger value="etl">ETL List</TabsTrigger>
            <TabsTrigger value="not-available">Not Available Online</TabsTrigger>
            <TabsTrigger value="other-lists">Other Lists</TabsTrigger>
          </TabsList>

            <TabsContent value="store-stock" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button onClick={() => {
                    const csv = "Model Code,Life Cycle,Total Stock\n" + 
                      inventoryData.storeStock.map(item => 
                        `${item.modelCode},${item.lifeCycle},${item.totalStock}`
                      ).join("\n")
                    const blob = new Blob([csv], { type: "text/csv" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "store_stock.csv"
                    a.click()
                    URL.revokeObjectURL(url)
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div>
                  <Label>Or paste CSV data:</Label>
                  <Textarea
                    placeholder="Model Code,Life Cycle,Total Stock&#10;12345,1,10&#10;67890,2,5"
                    rows={5}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleStoreStockImport(e.target.value)
                      }
                    }}
                  />
                </div>
                <ScrollArea className="h-64 border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Model Code</th>
                        <th className="p-2 text-left">Life Cycle</th>
                        <th className="p-2 text-left">Total Stock</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.storeStock.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{item.modelCode}</td>
                          <td className="p-2">{item.lifeCycle}</td>
                          <td className="p-2">{item.totalStock}</td>
                          <td className="p-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newStock = [...inventoryData.storeStock]
                                newStock.splice(idx, 1)
                                setInventoryData(prev => ({ ...prev, storeStock: newStock }))
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="algolia" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={fetchAlgoliaData} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Fetch from Algolia
                  </Button>
                  <Button onClick={() => exportToCSV(inventoryData.algoliaRecords, "algolia_records.csv")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Total records: {inventoryData.algoliaRecords.length}
                </div>
                <ScrollArea className="h-96 border rounded">
                  <div className="p-2 space-y-1">
                    {inventoryData.algoliaRecords.map((code, idx) => (
                      <div key={idx} className="text-sm font-mono">{code}</div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="etl" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={updateInventory}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Inventory
                  </Button>
                  <Button onClick={() => exportToCSV(inventoryData.etl, "etl_list.csv")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Total models: {inventoryData.etl.length}
                </div>
                <ScrollArea className="h-96 border rounded">
                  <div className="p-2 space-y-1">
                    {inventoryData.etl.map((code, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm font-mono">
                        <span>{code}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem("etl", idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="not-available" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => exportToCSV(
                    inventoryData.notAvailableOnline.map(item => [item.modelCode, item.status, item.stock]),
                    "not_available_online.csv"
                  )}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Total models: {inventoryData.notAvailableOnline.length}
                </div>
                <ScrollArea className="h-96 border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Model Code</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.notAvailableOnline.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2 font-mono">{item.modelCode}</td>
                          <td className="p-2">{item.status || "-"}</td>
                          <td className="p-2">{item.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="other-lists" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold">AMI Products</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter model code"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addManualItem("ami", (e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }}
                    />
                    <Button onClick={() => exportToCSV(inventoryData.amiProducts, "ami_products.csv")}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <ScrollArea className="h-32 border rounded mt-2">
                    <div className="p-2 space-y-1">
                      {inventoryData.amiProducts.map((code, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-mono">{code}</span>
                          <Button size="sm" variant="ghost" onClick={() => removeItem("ami", idx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <Label className="text-lg font-semibold">Products to be Removed</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter model code"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addManualItem("remove", (e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }}
                    />
                    <Button onClick={() => exportToCSV(inventoryData.productsToBeRemoved, "products_to_be_removed.csv")}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <ScrollArea className="h-32 border rounded mt-2">
                    <div className="p-2 space-y-1">
                      {inventoryData.productsToBeRemoved.map((code, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-mono">{code}</span>
                          <Button size="sm" variant="ghost" onClick={() => removeItem("remove", idx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <Label className="text-lg font-semibold">Localization Tracker</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter model code"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addManualItem("localization", (e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }}
                    />
                    <Button onClick={() => exportToCSV(inventoryData.localizationTracker, "localization_tracker.csv")}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <ScrollArea className="h-32 border rounded mt-2">
                    <div className="p-2 space-y-1">
                      {inventoryData.localizationTracker.map((code, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-mono">{code}</span>
                          <Button size="sm" variant="ghost" onClick={() => removeItem("localization", idx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

