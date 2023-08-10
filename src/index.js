import { BasePlugin, BaseComponent } from 'vatom-spaces-plugins'
import { PhotoBoothZone } from './PhotoBoothZone'
import { PhotoBoothButton } from './PhotoBoothButton'
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
            text: 'Photo Booth: Share URL',
            icon: this.paths.absolute('camerabutton.svg'),
            action: () => this.sharePhotoBoothURL()
        })

        // Register File menu option to delete all photos
        this.menus.register({
            section: 'file-menu',
            text: 'Photo Booth: Delete Photos',
            icon: this.paths.absolute('camerabutton.svg'),
            action: () => this.deleteAllPhotos()
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
        let userID = (await this.user.getID()).split(':')[1]

        // Show panel
        this.currentPopupID = await this.menus.displayPopup({
            panel: {
                hideTitlebar: true,
                iframeURL: this.paths.absolute('ui-build/index.html') + `#/space/${spaceID}/photos`
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

    /** Called to share the photo booth URL */
    async sharePhotoBoothURL() {
                
        // Get photos URL
        let spaceID = (await this.world.getID()).split(':')[0]
        let url = `${this.paths.absolute('ui-build/index.html')}#/space/${spaceID}/photos`

        // Allow the user to copy it
        await this.menus.prompt({
            icon: 'info',
            title: 'Share Photo Booth URL',
            text: `Copy the URL below to share the photo booth externally.`,
            initialValue: url,
        })
        
    }

    /** Called to delete all photos in the photo booth */
    async deleteAllPhotos() {

        // Confirm
        let confirm = await this.menus.confirm("Are you sure you want to permanently delete all photos in the Photo Booth?", "Delete All Photos")
        if (!confirm)
            return

        // Catch errors
        let toastID = null
        try {

            // Show status
            toastID = await this.menus.toast({ text: "Deleting photos...", isSticky: true })

            // Get all photos
            let allFiles = await this.storage.list('plugin')
            let photos = allFiles.filter(f => f.name.startsWith('Photo '))

            // Delete each one
            for (let i = 0 ; i < photos.length ; i++) {

                // Update toast
                await this.menus.toast({ id: toastID, text: `Deleting photos (${i+1} of ${photos.length})...`, isSticky: true })

                // Delete it
                let photo = photos[i]
                await this.storage.delete('plugin', photo.name)

            }

            // Final update to the toast
            await this.menus.toast({ id: toastID, text: `Finished deleting ${photos.length} photos.`, isSticky: true })
            await new Promise(c => setTimeout(c, 5000))

        } catch (err) {

            // Show error
            console.warn(`[Photo Booth] Error deleting photos: ${err.message}`)
            await this.menus.alert(err.message, "Error deleting photos", "error")

        } finally {

            // Close toast
            if (toastID)
                await this.menus.closeToast(toastID)

        }

    }

}