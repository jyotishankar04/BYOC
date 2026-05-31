"use client"

import { useState, useCallback, useRef } from "react"

interface UseDragAndDropOptions {
  onDrop: (files: File[]) => void
}

export function useDragAndDrop({ onDrop }: UseDragAndDropOptions) {
  const [isDragging, setIsDragging] = useState(false)
  // Counter tracks nested dragenter/dragleave events from child elements
  const counter = useRef(0)

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.dataTransfer.types.includes("Files")) return
    counter.current++
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    counter.current--
    if (counter.current === 0) setIsDragging(false)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDropHandler = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    counter.current = 0
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) onDrop(files)
  }, [onDrop])

  return {
    isDragging,
    dragProps: {
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop: onDropHandler,
    },
  }
}
