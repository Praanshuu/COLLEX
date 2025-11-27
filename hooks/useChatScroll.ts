"use client"

import { useEffect, useRef, useState } from "react"

export function useChatScroll<T>(dep: T) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
    const [showScrollButton, setShowScrollButton] = useState(false)

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
            setShouldAutoScroll(isAtBottom)
            setShowScrollButton(!isAtBottom)
        }
    }

    useEffect(() => {
        if (shouldAutoScroll) {
            scrollToBottom()
        }
    }, [dep, shouldAutoScroll])

    return {
        scrollRef,
        scrollToBottom,
        handleScroll,
        showScrollButton,
        isAtBottom: shouldAutoScroll
    }
}
