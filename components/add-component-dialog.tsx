"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FerrisWheelIcon as Carousel, Grid, Star, Code, ShoppingCart, HelpCircle } from "lucide-react"

export interface AddComponentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectComponent: (type: string) => void
  onAddCustomComponent: (htmlCode: string) => void
  activeTab?: 'default' | 'custom'
}

export function AddComponentDialog({
  isOpen,
  onClose,
  onSelectComponent,
  onAddCustomComponent,
  activeTab = 'default'
}: AddComponentDialogProps) {
  const [currentTab, setCurrentTab] = useState<'default' | 'custom'>(activeTab)
  const [customCode, setCustomCode] = useState("")

  useEffect(() => {
    setCurrentTab(activeTab)
  }, [activeTab])

  const contentComponents = [
    {
      type: "swiper",
      name: "Swiper Carousel",
      description: "Responsive image carousel with navigation and pagination",
      icon: Carousel,
      preview: "Image slider with multiple slides",
      category: "content"
    },
    {
      type: "new-banner",
      name: "New Banner",
      description: "Large multi-slide banner with overlay text and CTA",
      icon: Carousel,
      preview: "Horizontal banner slider with multiple slides",
      category: "content"
    },
    {
      type: "four-categories",
      name: "Four Categories",
      description: "Grid layout with 4 category images and links",
      icon: Grid,
      preview: "2x2 grid of category images",
      category: "content"
    },
    {
      type: "eight-icons",
      name: "Eight Icons",
      description: "Grid layout with 8 icon images and subtitles",
      icon: Star,
      preview: "8 icons with titles and links",
      category: "content"
    },
    {
      type: "products-showroom",
      name: "Products Showroom",
      description: "Dynamic product showcase with category filtering and sale options",
      icon: ShoppingCart,
      preview: "Product carousel with dynamic loading",
      category: "content"
    },
  ]

  const informationalComponents = [
    {
      type: "hero-banner",
      name: "Hero Banner",
      description: "Large banner with image, title, and subtitle",
      icon: Star,
      preview: "Full-width hero banner with overlay text",
      category: "informational"
    },
    {
      type: "dual-panel-section",
      name: "Dual Panel Section",
      description: "Section with text and optional image panel",
      icon: Grid,
      preview: "Text panel and optional image panel side by side",
      category: "informational"
    },
    {
      type: "info-grid-section",
      name: "Info Grid Section",
      description: "Grid of info items with icon, title, and subtitles (draggable)",
      icon: Star,
      preview: "Grid of info items with drag-and-drop tabs",
      category: "informational"
    },
    {
      type: "faqs-section",
      name: "FAQs Section",
      description: "Frequently Asked Questions with reorderable Q&A pairs",
      icon: HelpCircle,
      preview: "FAQs accordion with questions and answers",
      category: "informational"
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Component</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={activeTab} value={currentTab} onValueChange={(value) => setCurrentTab(value as 'default' | 'custom')} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="default">Pre-built Components</TabsTrigger>
            <TabsTrigger value="custom">Custom Code</TabsTrigger>
          </TabsList>

          <TabsContent value="default" className="mt-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="informational">Informational</TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contentComponents.map((component) => {
                    const IconComponent = component.icon
                    return (
                      <Card
                        key={component.type}
                        className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
                        onClick={() => {
                          onSelectComponent(component.type)
                          onClose()
                        }}
                      >
                        <CardHeader className="text-center pb-2">
                          <div className="mx-auto mb-2 p-3 bg-blue-50 rounded-full w-fit">
                            <IconComponent className="w-8 h-8 text-blue-600" />
                          </div>
                          <CardTitle className="text-lg">{component.name}</CardTitle>
                          <CardDescription className="text-sm">{component.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="text-center text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            {component.preview}
                          </div>
                          <Button className="w-full mt-3" size="sm">
                            Add Component
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
              <TabsContent value="informational">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {informationalComponents.map((component) => {
                    const IconComponent = component.icon
                    return (
                      <Card
                        key={component.type}
                        className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
                        onClick={() => {
                          onSelectComponent(component.type)
                          onClose()
                        }}
                      >
                        <CardHeader className="text-center pb-2">
                          <div className="mx-auto mb-2 p-3 bg-blue-50 rounded-full w-fit">
                            <IconComponent className="w-8 h-8 text-blue-600" />
                          </div>
                          <CardTitle className="text-lg">{component.name}</CardTitle>
                          <CardDescription className="text-sm">{component.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="text-center text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            {component.preview}
                          </div>
                          <Button className="w-full mt-3" size="sm">
                            Add Component
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium">Add Custom HTML Component</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-code">HTML Code</Label>
                <Textarea
                  id="custom-code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="Paste your HTML code here... The system will automatically detect and separate multiple components."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You can paste multiple components at once</li>
                  <li>• The system will automatically detect component boundaries</li>
                  <li>• Make sure your HTML tags are properly closed</li>
                  <li>• Each component will be wrapped with special comments for easy editing</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    onAddCustomComponent(customCode)
                    setCustomCode("")
                    onClose()
                  }} 
                  disabled={!customCode.trim()}
                >
                  Add Component(s)
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
