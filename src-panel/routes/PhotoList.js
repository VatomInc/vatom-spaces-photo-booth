import React, { useState } from 'react'
import { useIsWide, usePhotoDB, useSpaceID, useZipper } from '../components/Hooks'
import { MenubarButton, Screen } from '../components/SharedUI'
import { useParams } from 'react-router-dom'

/** Renders the list of photos for a space or user */
export const PhotoList = props => {

    // Get route info
    const { spaceID, userID } = useParams()
    if (userID?.startsWith('vatominc_'))
        userID = userID.substring(9)

    // Get photo database
    const photoDB = usePhotoDB(spaceID, userID)

    // Get zipper tool
    const zipper = useZipper()

    // Check if inside popup
    const insidePopup = window.parent !== window || window.opener !== window

    // Called when the user wants to download all images
    const downloadAll = async () => {

        // Stop if no photos
        if (photoDB.photos.length == 0)
            return alert('No photos available to download.')

        // Start zipping
        zipper.zipAndDownload(photoDB.photos.map(photo => photo.url))

    }

    // Called when the user wants to close the popup
    const close = () => {
        window.parent.postMessage({ action: 'closePopup' }, '*')
    }

    // Render UI
    return <Screen
        title={userID ? "My Photos" : "Photo Booth"}
        subtitle={zipper.status || photoDB.statusText || (photoDB.photos.length == 1 ? '1 photo' : `${photoDB.photos.length} photos`)}
        titlebarRight={<>

            {/* Copy/share URL button, only on the global page */}
            {/* { !userID ? <MenubarButton icon={require('../assets/share.svg')} onClick={() => {
                prompt("Copy this URL to share all photos:", window.location.href)
            }} /> : null } */}

            {/* Download all button */}
            <MenubarButton icon={require('../assets/downloads.svg')} onClick={downloadAll} />

            {/* Close popup button, only if we're inside the plugin popup window */}
            { insidePopup ? <MenubarButton icon={require('../assets/close.png')} onClick={close} /> : null }

        </>}
    >

        {/* Warning message */}
        {photoDB.photos.length == 0 ? <div style={{ textAlign: 'center', color: '#999', margin: 50 }}>No photos</div> : null }

        {/* Show photos */}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            { photoDB.photos.map(photo => <PhotoIcon key={photo.userID + photo.name} photo={photo} /> )}
        </div>

    </Screen>

}

/** Photo icon */
const PhotoIcon = props => {

    // Check if on a wide screen or not
    const isWide = useIsWide()

    // Return UI
    return <a style={{
        display: 'inline-block',
        width: isWide ? 'calc(12.5% - 2px)' : 'calc(25% - 2px)',
        aspectRatio: '4 / 3',
        margin: 1,
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: `url(${props.photo.thumbnailURL || props.photo.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    }} href={props.photo.url} target='_blank' download={props.photo.name} /> 

}