"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface Fix {
  id: string
  text: string
  description: string
  position: {
    paragraphIndex: number
    startOffset: number
    endOffset: number
    sectionTitle?: string
  }
  applied: boolean | null // null = not decided, true = accepted, false = rejected
  fixType: "edit" | "insert" // whether this is an edit to existing text or an insertion
  suggestedReplacement?: string
  errorNumber: number // For visual matching between list and document
}

interface FixesListProps {
  fixes: Fix[]
  onFixAction: (id: string, apply: boolean) => void
  onFixHover: (id: string | null) => void
  onFixSelect: (id: string) => void
  selectedFixId: string | null
  onBatchFix?: (ids: string[]) => void
}

export function FixesList({ fixes, onFixAction, onFixHover, onFixSelect, selectedFixId, onBatchFix }: FixesListProps) {
  const pendingFixes = fixes.filter((fix) => fix.applied === null)
  const appliedFixes = fixes.filter((fix) => fix.applied === true)
  const ignoredFixes = fixes.filter((fix) => fix.applied === false)

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">Suggested Fixes</h2>
        <p className="text-sm text-zinc-400">Review and apply fixes to improve your document</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {pendingFixes.length === 0 && appliedFixes.length === 0 && ignoredFixes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-white">No issues found</h3>
              <p className="text-sm text-zinc-400 mt-2">Your document looks good!</p>
            </div>
          ) : (
            <>
              {pendingFixes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-medium text-white">Pending Fixes ({pendingFixes.length})</h3>
                    {pendingFixes.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => onBatchFix && onBatchFix(pendingFixes.map((fix) => fix.id))}
                      >
                        Fix All
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {pendingFixes.map((fix) => (
                      <div
                        key={fix.id}
                        className={`p-4 rounded-md border cursor-pointer transition-all ${
                          selectedFixId === fix.id
                            ? "border-red-500 bg-red-900/30"
                            : "border-red-800 bg-red-900/20 hover:border-red-500"
                        }`}
                        onMouseEnter={() => onFixHover(fix.id)}
                        onMouseLeave={() => onFixHover(null)}
                        onClick={() => onFixSelect(fix.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
                              {fix.errorNumber}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-medium">{fix.text}</p>
                              <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400">
                                {fix.position.sectionTitle || `Paragraph ${fix.position.paragraphIndex + 1}`}
                              </Badge>
                            </div>
                            <p className="text-zinc-300 text-sm mb-2">{fix.description}</p>

                            {fix.suggestedReplacement && (
                              <div className="bg-zinc-800 p-2 rounded-md mb-2 border-l-2 border-green-500">
                                <p className="text-xs text-zinc-400 mb-1">Suggested replacement:</p>
                                <p className="text-sm text-green-400">{fix.suggestedReplacement}</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onFixSelect(fix.id)
                                }}
                              >
                                <ChevronRight className="h-3 w-3" />
                                Jump to location
                              </Button>

                              <div className="flex gap-2">
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
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {appliedFixes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-white mb-2">Applied Fixes ({appliedFixes.length})</h3>
                  <div className="space-y-2">
                    {appliedFixes.map((fix) => (
                      <div key={fix.id} className="p-3 rounded-md border border-green-800 bg-green-900/20">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">
                              {fix.errorNumber}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{fix.text}</p>
                            <div className="flex items-center text-green-500 text-sm mt-1">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Applied
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ignoredFixes.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-white mb-2">Ignored Fixes ({ignoredFixes.length})</h3>
                  <div className="space-y-2">
                    {ignoredFixes.map((fix) => (
                      <div key={fix.id} className="p-3 rounded-md border border-zinc-700 bg-zinc-800/50 opacity-60">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-600 text-white text-xs font-bold">
                              {fix.errorNumber}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{fix.text}</p>
                            <div className="flex items-center text-zinc-500 text-sm mt-1">Ignored</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
