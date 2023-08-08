import React, { useState } from 'react'
import { usePhotoDB, useSpaceID, useZipper } from '../components/Hooks'
import { MenubarButton, PhotoIcon, Screen } from '../components/SharedUI'
import { useParams } from 'react-router-dom'

/** Renders the list of photos for a space or user */
export const PhotoList = props => {

    // Get route info
    const { spaceID, userID } = useParams()

    // Get photo database
    const photoDB = usePhotoDB(spaceID, userID)

    // Get zipper tool
    const zipper = useZipper()

    // Called when the user wants to download all images
    const downloadAll = async () => {

        // Start zipping
        zipper.zipAndDownload(photoDB.photos.map(photo => photo.url))

    }

    // Called when the user wants to close the popup
    const close = () => {
        window.parent.postMessage({ action: 'closePopup' }, '*')
    }

    // Render UI
    return <Screen
        title="Photo Booth"
        subtitle={zipper.status || photoDB.statusText || (photoDB.photos.length == 1 ? '1 photo' : `${photoDB.photos.length} photos`)}
        titlebarRight={<>

            {/* Download all button */}
            <MenubarButton icon={require('../assets/downloads.svg')} onClick={downloadAll} />

            {/* Close popup button, only if we're inside the plugin popup window */}
            { props.insidePopup ? <MenubarButton icon={require('../assets/close.png')} onClick={close} /> : null }

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