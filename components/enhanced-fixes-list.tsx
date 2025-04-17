"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export interface Fix {
  id: string
  text: string
  description: string
  position: {
    paragraphIndex: number
    startOffset: number
    endOffset: number
  }
  applied: boolean | null // null = not decided, true = accepted, false = rejected
  section?: string // Section reference (e.g., "User Requirements")
  lineNumber?: number // Line number in the document
  suggestedReplacement?: string // Suggested replacement text
  fixType: "edit" | "insert" | "remove" // Type of fix
  errorNumber?: number // For visual matching between list and document
}

interface FixesListProps {
  fixes: Fix[]
  onFixAction: (id: string, apply: boolean) => void
  onFixHover: (id: string | null) => void
  onFixSelect: (id: string) => void
  selectedFixId: string | null
}

export function EnhancedFixesList({ fixes, onFixAction, onFixHover, onFixSelect, selectedFixId }: FixesListProps) {
  const [selectedFixes, setSelectedFixes] = useState<Set<string>>(new Set())
  const [showAppliedFixes, setShowAppliedFixes] = useState(true)

  // Handle checkbox selection
  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newSelectedFixes = new Set(selectedFixes)
    if (checked) {
      newSelectedFixes.add(id)
    } else {
      newSelectedFixes.delete(id)
    }
    setSelectedFixes(newSelectedFixes)
  }

  // Apply all selected fixes
  const applySelectedFixes = () => {
    selectedFixes.forEach((id) => {
      onFixAction(id, true)
    })
    setSelectedFixes(new Set())
  }

  // Filter fixes based on their applied status
  const filteredFixes = showAppliedFixes ? fixes : fixes.filter((fix) => fix.applied !== true)

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-applied"
              checked={showAppliedFixes}
              onCheckedChange={(checked) => setShowAppliedFixes(!!checked)}
            />
            <label htmlFor="show-applied" className="text-sm text-zinc-300 cursor-pointer">
              Show applied fixes
            </label>
          </div>

          {selectedFixes.size > 0 && (
            <Button size="sm" onClick={applySelectedFixes} className="bg-green-700 hover:bg-green-600 text-white">
              Apply {selectedFixes.size} selected
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredFixes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-white">No issues found</h3>
              <p className="text-sm text-zinc-400 mt-2">Your document looks good!</p>
            </div>
          ) : (
            filteredFixes.map((fix, index) => (
              <div
                key={fix.id}
                className={`p-4 rounded-md border cursor-pointer transition-all ${
                  fix.applied === true
                    ? "border-green-800 bg-green-900/20"
                    : fix.applied === false
                      ? "border-zinc-700 bg-zinc-800/50 opacity-60"
                      : selectedFixId === fix.id
                        ? "border-red-500 bg-red-900/30"
                        : "border-red-800 bg-red-900/20"
                }`}
                onMouseEnter={() => onFixHover(fix.id)}
                onMouseLeave={() => onFixHover(null)}
                onClick={() => onFixSelect(fix.id)}
              >
                <div className="flex items-start gap-3">
                  {fix.applied !== true && (
                    <div className="mt-1">
                      <Checkbox
                        checked={selectedFixes.has(fix.id)}
                        onCheckedChange={(checked) => {
                          handleCheckboxChange(fix.id, !!checked)
                          // Use the event from the parameter instead of referencing a global event
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5"
                      />
                    </div>
                  )}

                  <div className="flex-shrink-0 mt-0.5">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-900 text-white font-bold text-xs">
                      {fix.errorNumber || index + 1}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium">{fix.text}</p>
                      {fix.section && (
                        <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                          {fix.section}
                        </Badge>
                      )}
                    </div>

                    <p className="text-zinc-300 text-sm mb-2">{fix.description}</p>

                    {fix.suggestedReplacement && (
                      <div className="mt-2 mb-3">
                        <div className="flex items-center text-xs text-zinc-400 mb-1">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Suggested replacement:
                        </div>
                        <div className="bg-zinc-800 p-2 rounded border border-zinc-700 text-sm text-green-400">
                          {fix.suggestedReplacement}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
                      {fix.fixType === "edit" && (
                        <Badge variant="outline" className="border-amber-800 text-amber-500">
                          Edit Required
                        </Badge>
                      )}
                      {fix.fixType === "insert" && (
                        <Badge variant="outline" className="border-blue-800 text-blue-500">
                          Insert Content
                        </Badge>
                      )}
                      {fix.fixType === "remove" && (
                        <Badge variant="outline" className="border-red-800 text-red-500">
                          Remove Content
                        </Badge>
                      )}

                      {fix.lineNumber && <span className="text-zinc-500">Line {fix.lineNumber}</span>}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto h-6 px-2 text-zinc-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFixSelect(fix.id)
                        }}
                      >
                        Jump to
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>

                  {fix.applied === null && (
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 hover:bg-green-900/30 text-green-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFixAction(fix.id, true)
                        }}
                      >
                        Yes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-zinc-600 hover:bg-zinc-800 text-zinc-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFixAction(fix.id, false)
                        }}
                      >
                        No
                      </Button>
                    </div>
                  )}
                  {fix.applied === true && (
                    <div className="flex items-center text-green-500 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Applied
                    </div>
                  )}
                  {fix.applied === false && <div className="flex items-center text-zinc-500 text-sm">Ignored</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
