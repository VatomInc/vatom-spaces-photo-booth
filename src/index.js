import { BasePlugin, BaseComponent } from 'vatom-spaces-plugins'
import { PhotoBoothZone } from './PhotoBoothZone'
import { PhotoBoothButton } from './PhotoBoothButton'
import { panelHTML } from './Utilities'
import { PanelInterface } from './PanelInterface'
import { PhotoBoothCamera } from './PhotoBoothCamera'

/**
 * This is the main entry point for your plugin.
 *
 * All information regarding plugin development can be found at
 * https://developer.vatom.com/spaces/plugins-in-spaces/guide-create-plugin
 *
 * @license MIT
 * @author Vatom Inc.
 */
export default class PhotoBoothPlugin extends BasePlugin {

    /** Plugin info */
    static id = "com.vatom.photobooth"
    static name = "Photo Booth"

    /** Called on load */
    onLoad() {

        // Register components
        PhotoBoothButton.register(this)
        PhotoBoothCamera.register(this)
        PhotoBoothZone.register(this)

        // Register photo button
        this.menus.register({
            text: 'Photo Booth',
            icon: this.paths.absolute('camerabutton.svg'),
            action: () => this.openPhotoList(),
        })

    }

    /** Called when a message is received */
    onMessage(message, fromID) {

        // Pass messages to the panel interface
        if (PanelInterface.handleMessage(message))
            return

        console.debug(`[Photo Booth] Message received:`, message)

    }

    /** Open photo list UI */
    async openPhotoList() {

        // Create UI
        let panel = await PanelInterface.openPanel('Photo Booth', 'large', `
            <style>
                #photo-list {
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    height: 100%;
                    overflow-x: hidden;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .notice {
                    text-align: center;
                    color: #999;
                    margin: 50px;
                    flex: 1 1 1px;
                }
                .photo {
                    display: inline-block;
                    position: relative;
                    width: calc(25vw - 30px);
                    height: calc(20vw - 30px);
                    margin: 10px;
                    cursor: pointer;
                    overflow: hidden;
                    box-shadow: 0px 2px 4px rgba(0,0,0,0.2);
                    border-radius: 5px;
                }
                .photo.spacer {
                    height: 0px;
                    box-shadow: none;
                    margin-top: 0px;
                    margin-bottom: 0px;
                }
                .photo > img {
                    position: absolute;
                    top: 0%;
                    left: 0%;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            </style>
            <div id="photo-list">
                <div class='notice'>Loading...</div>
            </div>
        `)

        // Load photos
        let userID = await this.user.getID()
        let userIDSafe = userID.replace(/[^0-9A-Za-z]/g, '_')
        let photos = await this.storage.list('plugin', userIDSafe)
        
        // Sort by name
        photos.sort((a, b) => b.name.localeCompare(a.name))

        // Create output html
        let htmlOutput = ''
        for (let photo of photos) {

            // Add item
            htmlOutput += `<a class='photo' href="${photo.url}" target='_blank' download>
                <img src="${photo.url}" />
            </a>`

        }

        // Add notice if no photos found
        if (!photos.length) {

            // Add notice
            htmlOutput = `<div class='notice'>No photos found.</div>`

        } else {

            // Fix alignment of the last row
            for (let i = 0 ; i < 4 ; i++)
                htmlOutput += `<div class='photo spacer'></div>`

        }

        // Send to UI
        panel.updateElement('#photo-list', htmlOutput)

    }

}
