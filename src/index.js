import { BasePlugin, BaseComponent } from 'vatom-spaces-plugins'
import { PhotoBoothZone } from './PhotoBoothZone'
import { PhotoBoothButton } from './PhotoBoothButton'
import { PanelInterface } from './PanelInterface'
import { PhotoBoothCamera } from './PhotoBoothCamera'
import { StateBridge } from './StateBridge'

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
    async onLoad() {

        // Register components
        PhotoBoothButton.register(this)
        PhotoBoothCamera.register(this)
        PhotoBoothZone.register(this)

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
                    { id: 'icon-section', type: 'section', value: 'Settings' },
                    { id: 'hide-gallery', type: 'checkbox', name: 'Hide gallery', help: `If enabled, users will not be able to view the photo gallery. The button at the bottom will be hidden, and the option to view photos after taking them will be removed. Admins can still view the gallery with the File > Photo Booth menu option.` },
                    { id: 'icon-title', type: 'text', name: 'Icon title', default: 'Photo Booth', help: `The title of the photo booth icon in the bottom action bar.` },
                ]
            }
        })

        // Register File menu option to copy the share link
        this.menus.register({
            section: 'file-menu',
            text: 'Photo Booth',
            icon: this.paths.absolute('camerabutton.svg'),
            action: () => this.openPhotoList(true)
        })

        // Register File menu option to delete all photos
        this.menus.register({
            section: 'file-menu',
            text: 'Photo Booth: Delete Photos',
            icon: this.paths.absolute('camerabutton.svg'),
            action: () => this.deleteAllPhotos()
        })

        // Update dynamic UI
        this.updateUI()

        // Update shared state
        StateBridge.shared.updateState({
            isAdmin: await this.user.isAdmin(),
        })

    }

    /** Called when any plugin settings change */
    onSettingsUpdated() {

        // Update UI
        this.updateUI()

    }

    /** Update dynamic UI */
    updateUI() {

        // Register user's photo button
        this.getField('hide-gallery') ? this.menus.unregister(this.id + ':photo-booth-button') : this.menus.register({
            id: this.id + ':photo-booth-button',
            text: this.getField('icon-title') || 'Photo Booth',
            icon: this.paths.absolute('camerabutton.svg'),
            action: () => this.openPhotoList(false),
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
        let admin = await this.user.isAdmin()

        // Show panel
        this.currentPopupID = await this.menus.displayPopup({
            panel: {
                width: 1670,
                height: 1000,
                hideTitlebar: true,
                iframeURL: this.paths.absolute('ui-build/index.html') + (admin
                    ? `#/space/${spaceID}/photos`
                    : `#/space/${spaceID}/user/${userID}/photos`
                )
            }
        })

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

    /**
     * Delete a single photo.
     */
    deletePhoto = StateBridge.shared.register('deletePhoto', async (photo) => {

        // Confirm with user
        let confirm = await this.menus.confirm(`Are you sure you want to permanently delete this photo?`, "Delete Photo")
        if (!confirm)
            return

        // Start the process
        this.deletePhoto2(photo)
        return true

    })

    async deletePhoto2(photo) {

        // Mark photo as removed
        StateBridge.shared.updateState({ ['hide-photo:' + photo.name]: true })

        // Try to remove it
        try {

            // Delete photos
            let promises = []
            promises.push(this.storage.delete('plugin', photo.name))
            if (photo.thumbnail?.name) promises.push(this.storage.delete('plugin', photo.thumbnail.name))
            await Promise.all(promises)

        } catch (err) {

            // Failed, show error
            console.warn(`[Photo Booth] Error deleting photo: ${err.message}`)
            this.menus.alert(err.message, "Error deleting photo", "error")

            // Unmark photo as removed
            StateBridge.shared.updateState({ ['hide-photo:' + photo.name]: false })

        }

        // Done
        return true

    }

}