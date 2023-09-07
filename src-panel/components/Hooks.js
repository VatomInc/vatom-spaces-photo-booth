import JSZip from "jszip"
import { PhotoDB } from "../utilities/PhotoDB"
import React, { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useNavigationType } from "react-router-dom"
import { StateBridge } from "../../src/StateBridge"

/** 
 * Gets the photo DB for a space, and re-renders components when it's updated.
 * 
 * @param {string} spaceID The space ID to get the photo DB for.
 * @param {string} userID The user ID to get the photo DB for. Can be null to get all photos in the space.
 * @returns {PhotoDB} The photo DB for the space.
 */
export const usePhotoDB = (spaceID, userID) => {

    // State
    let [ _update, setUpdate ] = useState(0)

    // Get photo db
    let photoDB = PhotoDB.forSpace(spaceID, userID)

    // Called when space ID changes
    useEffect(() => {
        
        // Create listener
        let listener = () => {
            setUpdate(u => u + 1)
        }

        // Add listener
        photoDB.addEventListener('updated', listener)

        // Remove listener
        return () => photoDB.removeEventListener('updated', listener)
        
    }, [ photoDB ])

    // Done
    return photoDB

}

/**
 * A tool which zips a list of URLs into a single zip file and then downloads it.
 * 
 */
export const useZipper = () => {

    // Current zip status
    let [ status, setStatus ] = useState('')

    // Called to start the download
    const zipAndDownload = async (urls) => {

        // Stop if already busy
        if (status) 
            return

        // Catch errors
        try {

            // Start downloading
            console.debug(`[Zipper] Downloading ${urls.length} files...`)
            let files = []
            for (let i = 0 ; i < urls.length ; i++) {

                // Update status
                setStatus(`Downloading ${i + 1} of ${urls.length} files...`)

                // Get URL
                let url = urls[i]
                if (typeof url == 'string')
                    url = new URL(url)

                // Get filename
                let filename = url.pathname.split('/').pop()
                if (!filename) {
                    console.warn(`[Zipper] Ignored URL because it has no filename: ${url}`)
                    continue
                }

                // Fix encoded characters
                filename = decodeURIComponent(filename)

                // Fetch file
                let request = await fetch(url.toString())
                let blob = await request.blob()
                let file = new File([ blob ], filename, { type: blob.type })

                // Add to list
                files.push(file)

            }

            // Update status ... add a bit of a delay because the next part may be UI-blocking
            setStatus(`Creating zip file...`)
            await new Promise(r => setTimeout(r, 100))

            // Create zip
            let zip = new JSZip()
            for (let file of files)
                zip.file(file.name, file)

            // Compress zip
            let zipBlob = await zip.generateAsync({ type: 'blob' })
            
            // Download it
            let url = URL.createObjectURL(zipBlob)
            let link = document.createElement('a')
            link.href = url
            link.download = 'PhotoBooth.zip'
            link.click()

            // Done
            setStatus('')
            console.debug(`[Zipper] Complete`)

        } catch (err) {

            // Failed
            setStatus('')
            console.error(`[Zipper] Failed: ${err.message}`)

            // Show error
            alert(`Failed to download files: ${err.message}`)

        }

    }

    // Done
    return { status, zipAndDownload }

}

/** Check if the screen is wide */
export const useIsWide = () => {

    // State
    const maxNarrowWidth = 1200
    let [ isWide, setIsWide ] = useState(window.innerWidth > maxNarrowWidth)

    // Listen for window resize
    useEffect(() => {

        // Create listener
        let listener = () => {
            setIsWide(window.innerWidth > maxNarrowWidth)
        }

        // Add listener
        window.addEventListener('resize', listener)

        // Remove listener
        return () => window.removeEventListener('resize', listener)

    }, [])

    // Done
    return isWide

}

/** 
 * Use an asynchronous result of an operation.
 *
 * @param {function} asyncFn The async function to call.
 * @param {any[]} deps The dependencies to watch for changes.
 * @returns {[ result : any, error : Error, retry : function ]} The result of the async function. First value is the result, second is any error, third is a retry function.
 */
export const useAsyncMemo = (asyncFn, deps) => {

    // State
    let [ result, setResult ] = useState()
    let [ error, setError ] = useState()
    let [ retryCounter, setRetryCounter ] = useState(0)

    // Called to retry
    const retry = () => {
        setResult(null)
        setError(null)
        setRetryCounter(c => c + 1)
    }

    // Create and run promise
    let promise = useMemo(() => Promise.resolve().then(asyncFn), [ ...deps, retryCounter ])

    // Handle state
    useEffect(() => {

        // Monitor promise
        promise.then(result => {
            setResult(result)
            setError(null)
        }).catch(err => {
            console.warn(err)
            setResult(null)
            setError(err)
        })

    }, [ promise ])

    // Done
    return [ result, error, retry ]

}

/**
 * Hook to get the current app state. Using this hook has the benefit of re-rendering when the state changes.
 * 
 * @returns {StateBridge} The current app state.
 */
export const useStateBridge = () => {

    // State
    let [ nonce, setNonce ] = useState(0)

    // Listen for changes
    useEffect(() => {

        // Update once now, in case we've missed the update
        setNonce(n => n + 1)

        // Create listener
        const listener = () => setNonce(n => n + 1)

        // Add listener
        StateBridge.shared.addEventListener("updated", listener)

        // Remove listener afterwards
        return () => StateBridge.shared.removeEventListener("updated", listener)

    }, [])

    // Done
    return StateBridge.shared

}