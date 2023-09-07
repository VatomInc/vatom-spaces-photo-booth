import React from 'react'
import { useIsWide, usePhotoDB, useStateBridge, useZipper } from '../components/Hooks'
import { MenubarButton, Screen } from '../components/SharedUI'
import { useNavigate, useParams } from 'react-router-dom'

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

    // Get state bridge
    const bridge = useStateBridge()

    // Called when the user wants to download all images
    const downloadAll = async () => {

        // Stop if no photos
        if (photoDB.photos.length == 0)
            return alert('No photos available to download.')

        // Start zipping
        zipper.zipAndDownload(photoDB.photos.map(photo => photo.url))

    }

    // Render UI
    return <Screen
        title={"Photo Booth"}
        subtitle={zipper.status || photoDB.statusText || (photoDB.photos.length == 1 ? '1 photo' : `${photoDB.photos.length} photos`)}
        titlebarRight={<>

            {/* Copy/share URL button, only on the global page */}
            { !userID ? <MenubarButton icon={require('../assets/share.svg')} onClick={() => {
                prompt("Copy this URL to share all photos:", window.location.href)
            }} /> : null }

            {/* Download all button, only if viewing everything */}
            { userID ? null : 
                <MenubarButton icon={require('../assets/downloads.svg')} onClick={downloadAll} />
            }

        </>}
    >

        {/* Warning message */}
        {photoDB.photos.length == 0 ? <div style={{ textAlign: 'center', color: '#999', margin: 50 }}>No photos</div> : null }

        {/* Show photos */}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            { photoDB.photos.map(photo => <PhotoIcon key={photo.name} photo={photo} hidden={bridge.state['hide-photo:' + photo.name]} /> )}
        </div>

    </Screen>

}

/** Photo icon */
const PhotoIcon = props => {

    // Check if on a wide screen or not
    const isWide = useIsWide()

    // Get navigator
    const navigate = useNavigate()

    // Get route info
    const { userID } = useParams()
    if (userID?.startsWith('vatominc_'))
        userID = userID.substring(9)

    // Called when the user clicks the icon
    const onClick = () => {
        navigate(userID
            ? `/space/${props.photo.spaceID}/user/${userID}/photo/${encodeURIComponent(props.photo.name)}`
            : `/space/${props.photo.spaceID}/photo/${encodeURIComponent(props.photo.name)}`
        )
    }

    // Stop if hidden
    if (props.hidden)
        return null

    // Return UI
    return <div style={{
        display: 'inline-block',
        width: isWide ? 'calc(12.5% - 2px)' : 'calc(25% - 2px)',
        aspectRatio: '4 / 3',
        margin: 1,
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: `url(${props.photo.thumbnail?.url || props.photo.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    }} onClick={onClick} /> 

}