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
            text: 'My Photos',
            icon: this.paths.absolute('camerabutton.svg'),
            action: () => this.openPhotoList(),
        })

        // Register Insert menu items
        this.menus.register({
            section: 'insert-object',
            text: 'Photo Booth',
            icon: this.paths.absolute('camerabutton.svg'),
            action: () => this.insertPhotoBooth()
        })
        this.menus.register({
            section: 'insert-object',
            text: 'Photo Booth > Camera',
            icon: this.paths.absolute('camerabutton.svg'),
            action: () => this.insertPhotoBoothCamera()
        })

        // Register settings
        this.menus.register({
            section: 'plugin-settings',
            title: 'Photo Booth',
            panel: {
                fields: [
                    { id: 'about-section', type: 'section', value: 'About' },
                    { id: 'info', type: 'label', value: `This plugin allows you to create a photo booth experience in your space.` },
                    { id: 'text-section', type: 'section', value: 'Text' },
                    { id: 'no-photos-text', type: 'text', name: 'No photos', help: `Displayed in the photo list when the user has not taken any photos yet.` },
                ]
            }
        })

        // Register File menu option to copy the share link
        this.menus.register({
            section: 'file-menu',
            text: 'Photo Booth Dashboard',
            icon: this.paths.absolute('camerabutton.svg'),
            action: async () => {
                let spaceID = (await this.world.getID()).split(':')[0]
                await this.app.openURL(`${this.paths.absolute('ui-build/index.html')}#/space/${spaceID}/photos`)
            }
        })

    }

    /** Called when a message is received */
    onMessage(message, fromID) {

        // Pass messages to the panel interface
        if (PanelInterface.handleMessage(message))
            return

        // Check message
        if (message.action == 'closePopup') {

            // Close popup
            this.menus.closePopup(this.currentPopupID)
            this.currentPopupID = null

        } else {

            // Unknown message
            console.debug(`[Photo Booth] Unknown message received:`, message)

        }

    }

    /** Open photo list UI */
    async openPhotoList() {

        // Get space and user ID
        let spaceID = (await this.world.getID()).split(':')[0]
        let userID = await this.user.getID()

        // Show panel
        this.currentPopupID = await this.menus.displayPopup({
            panel: {
                hideTitlebar: true,
                iframeURL: this.paths.absolute('ui-build/index.html') + `#/space/${spaceID}/user/${userID}/photos`
            }
        })

        // Create UI
        // let panel = await PanelInterface.openPanel('Photo Booth', 'large', `
        //     <style>
        //         #photo-list {
        //             position: absolute;
        //             top: 0px;
        //             left: 0px;
        //             width: 100%;
        //             height: 100%;
        //             overflow-x: hidden;
        //             overflow-y: auto;
        //             display: flex;
        //             flex-direction: row;
        //             flex-wrap: wrap;
        //             justify-content: space-between;
        //             align-items: flex-start;
        //         }
        //         .notice {
        //             text-align: center;
        //             color: #999;
        //             margin: 50px;
        //             flex: 1 1 1px;
        //         }
        //         .photo {
        //             display: inline-block;
        //             position: relative;
        //             width: calc(25vw - 30px);
        //             height: calc(20vw - 30px);
        //             margin: 10px;
        //             cursor: pointer;
        //             overflow: hidden;
        //             box-shadow: 0px 2px 4px rgba(0,0,0,0.2);
        //             border-radius: 5px;
        //         }
        //         .photo.spacer {
        //             height: 0px;
        //             box-shadow: none;
        //             margin-top: 0px;
        //             margin-bottom: 0px;
        //         }
        //         .photo > img {
        //             position: absolute;
        //             top: 0%;
        //             left: 0%;
        //             width: 100%;
        //             height: 100%;
        //             object-fit: cover;
        //         }
        //     </style>
        //     <div id="photo-list">
        //         <div class='notice'>Loading...</div>
        //     </div>
        // `)

        // // Load photos
        // let userID = await this.user.getID()
        // let userIDSafe = userID.replace(/[^0-9A-Za-z]/g, '_')
        // let photos = await this.storage.list('plugin', userIDSafe)
        
        // // Sort by name
        // photos.sort((a, b) => b.name.localeCompare(a.name))

        // // Create output html
        // let htmlOutput = ''
        // for (let photo of photos) {

        //     // Add item
        //     htmlOutput += `<a class='photo' href="${photo.url}" target='_blank' download>
        //         <img src="${photo.url}" />
        //     </a>`

        // }

        // // Add notice if no photos found
        // if (!photos.length) {

        //     // Add notice
        //     htmlOutput = `<div class='notice'>${this.getField('no-photos-msg') || "No photos found. Look around for a nearby photo booth to take pictures."}</div>`

        // } else {

        //     // Fix alignment of the last row
        //     for (let i = 0 ; i < 4 ; i++)
        //         htmlOutput += `<div class='photo spacer'></div>`

        // }

        // // Send to UI
        // panel.updateElement('#photo-list', htmlOutput)

    }

    /** Called when the user selects Insert > Objects > Photo Booth. */
    async insertPhotoBooth() {

        // Get user position
        let userPos = await this.user.getPosition()

        // Create object
        let objectID = await this.objects.create({

            // Object info
            name: 'Photo Booth',
            type: 'zone',
            show_wireframe: true,
            clientOnly: false,

            // Transform
            x:      userPos.x,
            height: userPos.y + 1.5,
            y:      userPos.z,
            scale_x: 5,
            scale_y: 3.5,
            scale_z: 5,

            // Components
            components: [
                { id: 'com.vatom.photobooth:photozone' }
            ],

            // Photo Booth settings
            "component:com.vatom.photobooth:photozone:activation-mode": "Toast",
            "component:com.vatom.photobooth:photozone:use-nearby-camera": true,

        })

    }

    /** Called when the user selects Insert > Objects > Photo Booth > Camera. */
    async insertPhotoBoothCamera() {

        // Get user position
        let userPos = await this.user.getPosition()

        // Create object
        let objectID = await this.objects.create({

            // Object info
            name: 'Photo Booth - Camera',
            type: 'cube',
            color: '#00F',
            clientOnly: false,

            // Transform
            x:      userPos.x,
            height: userPos.y + 1.5,
            y:      userPos.z,
            scale_x: 0.2,
            scale_y: 0.2,
            scale_z: 0.2,

            // Components
            components: [
                { id: 'com.vatom.photobooth:photocamera' }
            ],

        })

    }

}