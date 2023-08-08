import JSZip from "jszip"
import { PhotoDB } from "../utilities/PhotoDB"
import { useEffect, useState } from "react"

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