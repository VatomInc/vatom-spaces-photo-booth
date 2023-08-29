import React, { useEffect, useMemo, useState } from 'react'
import { useAsyncMemo, usePhotoDB } from '../components/Hooks'
import { MenubarButton, Screen } from '../components/SharedUI'
import { useNavigate, useParams } from 'react-router-dom'

/** Renders a single photo */
export const PhotoView = props => {

    // Use navigate
    const navigate = useNavigate()

    // Get route info
    const { spaceID, userID, photoName } = useParams()
    if (userID?.startsWith('vatominc_'))
        userID = userID.substring(9)

    // Get photo DB
    const photoDB = usePhotoDB(spaceID, userID)
    const photo = photoDB.photos.find(photo => photo.name == photoName)
    const photoIndex = photoDB.photos.indexOf(photo)

    // True if downloading photo
    const [ isDownloading, setIsDownloading ] = useState(false)

    // Get status text
    let statusText = '?'
    if (isDownloading)
        statusText = 'Downloading...'
    else if (photo?.date)
        statusText = new Date(photo?.date).toLocaleString()

    // Called when the user clicks the download button
    const downloadPhoto = async () => {

        // Only do once
        if (isDownloading) return
        setIsDownloading(true)

        // Catch errors
        try {

            // Download it
            let blob = await fetch(photo.url).then(r => r.blob())

            // Trigger download dialog
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = photo.name
            a.click()

        } catch (err) {

            // Show error
            console.warn('Unable to download photo: ', err)
            alert('Unable to download: ' + err.message)

        } finally {

            // Done
            setIsDownloading(false)

        }

    }

    // Get path to the previous page
    const backURL = userID 
        ? `/space/${spaceID}/user/${userID}/photos`
        : `/space/${spaceID}/photos`

    // Called when the user clicks the previous photo button
    const goPreviousPhoto = () => {
        const previousPhoto = photoDB.photos[photoIndex - 1]
        navigate(userID 
            ? `/space/${spaceID}/user/${userID}/photo/${encodeURIComponent(previousPhoto.name)}`
            : `/space/${spaceID}/photo/${encodeURIComponent(previousPhoto.name)}`
        )
    }

    // Called when the user clicks the next photo button
    const goNextPhoto = () => {
        const nextPhoto = photoDB.photos[photoIndex + 1]
        navigate(userID
            ? `/space/${spaceID}/user/${userID}/photo/${encodeURIComponent(nextPhoto.name)}`
            : `/space/${spaceID}/photo/${encodeURIComponent(nextPhoto.name)}`
        )
    }

    // Render UI
    return <Screen
        title="Photo"
        subtitle={statusText}
        backURL={backURL}
        titlebarRight={<>

            {/* Download button */}
            { photo?.url ? <MenubarButton icon={require('../assets/downloads.svg')} onClick={downloadPhoto} /> : null}

        </>}
    >

        {/* Big photo view */}
        { photo?.url ? <img key={photo.url} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
        }} src={photo.url} /> : null}

        {/* Previous photo button */}
        {photoIndex > 0 ? <img src={require('../assets/left-chevron.svg')} style={{ position: 'absolute', top: 'calc(50% - 30px)', left: 20, height: 60, cursor: 'pointer', filter: 'drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.5))' }} onClick={goPreviousPhoto} /> : null}

        {/* Next photo button */}
        {photoIndex < photoDB.photos.length-1 ? <img src={require('../assets/right-chevron.svg')} style={{ position: 'absolute', top: 'calc(50% - 30px)', right: 20, height: 60, cursor: 'pointer', filter: 'drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.5))' }} onClick={goNextPhoto} /> : null}

    </Screen>

}