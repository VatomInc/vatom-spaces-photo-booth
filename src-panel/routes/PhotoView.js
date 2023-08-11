import React, { useEffect, useMemo, useState } from 'react'
import { useAsyncMemo, usePhotoDB } from '../components/Hooks'
import { MenubarButton, Screen } from '../components/SharedUI'
import { useParams } from 'react-router-dom'

/** Renders a single photo */
export const PhotoView = props => {

    // Get route info
    const { spaceID, userID, photoName } = useParams()
    if (userID?.startsWith('vatominc_'))
        userID = userID.substring(9)

    // Get photo DB
    const photoDB = usePhotoDB(spaceID)
    const photo = photoDB.photos.find(photo => photo.name == photoName)

    // Download image
    const [ photoBlob, photoError ] = useAsyncMemo(async () => {

        // Stop if no photo
        if (!photo?.url)
            return

        // Attempt to download file
        const response = await fetch(photo.url)
        const blob = await response.blob()
        return blob

    }, [ photo ])

    // Get image blob URL
    const photoBlobURL = useMemo(() => photoBlob ? URL.createObjectURL(photoBlob) : null, [ photoBlob ])

    // Get status text
    let statusText = ''
    if (photoError)
        statusText = 'Failed to load'
    else if (photoBlob)
        statusText = (photoBlob.size / 1024 / 1024).toFixed(2) + ' MB'
    else
        statusText = 'Loading...'

    // Called when the user clicks the download button
    const downloadPhoto = async () => {
        const a = document.createElement('a')
        a.href = photoBlobURL
        a.download = photo.name
        a.click()
    }

    // Get path to the previous page
    const backURL = userID 
        ? `/space/${spaceID}/user/${userID}/photos`
        : `/space/${spaceID}/photos`

    // Render UI
    return <Screen
        title="Photo"
        subtitle={statusText}
        backURL={backURL}
        titlebarRight={<>

            {/* Download button */}
            { photoBlobURL ? <MenubarButton icon={require('../assets/downloads.svg')} onClick={downloadPhoto} /> : null}

        </>}
    >

        {/* Big photo view */}
        { photoBlobURL ? <img style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
        }} src={photoBlobURL} /> : null}

    </Screen>

}