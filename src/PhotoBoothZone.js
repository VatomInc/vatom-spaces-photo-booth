import { BaseComponent } from "vatom-spaces-plugins"
import { isInsizeZone, panelHTML } from "./Utilities"

/**
 * This Component provides the logic for the photo booth zone.
 */
export class PhotoBoothZone extends BaseComponent {

    /** This is a photo booth zone */
    isPhotoBoothZone = true

    /** True if the user is currently inside the zone */
    isInside = false

    /** Register the component */
    static register(plugin) {

        // Register this component
        plugin.objects.registerComponent(this, {
            id: 'photozone',
            name: 'Photo Booth Zone',
            description: 'Add this to a Zone to specify the region where users will stand when taking the photo.',
            settings: [
                { id: 'info', type: 'label', value: `This defines the region where users will stand when taking the photo.` },
                { id: 'activation-mode', name: 'Activation Mode', type: 'select', values: ['None', 'Toast', 'Menubar Button'], help: `<b>None:</b> No automatic activation. You can still trigger the Photo Booth by adding the Photo Booth Button component to another in-world item.<br/><br/><b>Toast:</b> When the user steps into the zone, a Toast will appear asking them if they want to take a photo.<br/><br/><b>Menubar Button:</b> When the user is within the zone, a menubar button is added to take a photo.` },
                { id: 'activation-text', name: 'Prompt', help: `The text displayed to prompt the user to take a photo. This is only used when the Activation Mode is set to Toast.`, type: 'text' },
            ]
        })

    }

    /** Called on load */
    onLoad() {

        // Start monitoring for location changes
        this.monitorTimer = setInterval(() => this.checkPosition(), 250)

    }

    /** Called on unload */
    onUnload() {

        // Cleanup by leaving
        if (this.isInside)
            this.onExitedZone()

        // Stop monitoring for location changes
        clearInterval(this.monitorTimer)

    }

    /** Called continuously to check if the user has entered or left the zone */
    async checkPosition() {

        // Check if changed
        let isInside = await isInsizeZone(this.fields)
        if (isInside === this.isInside)
            return

        // Changed!
        this.isInside = isInside
        if (isInside)
            this.onEnteredZone()
        else
            this.onExitedZone()

    }

    /** Called on entering the zone */
    async onEnteredZone() {
        
        // Check activation mode
        if (this.getField('activation-mode') == 'Toast') {

            // Display toast
            this.toastID = await this.plugin.menus.toast({
                text: this.getField('activation-text') || 'Would you like to take a photo?',
                buttonText: 'Take Photo',
                buttonAction: () => this.activate(),
                buttonCancelText: 'Hide',
                isSticky: true,
            })

        } else if (this.getField('activation-mode') == 'Menubar Button') {

            // Add menubar button
            this.buttonID = await this.plugin.menus.register({
                icon: this.plugin.paths.absolute('camerabutton.svg'),
                text: 'Take Photo',
                action: () => this.activate(),
            })

        } else {

            // No activation
            console.debug(`[Photo Booth] User entered a Photo Booth zone, but no activation mode is set.`)  

        }
        
    }

    /** Called on exiting the zone */
    onExitedZone() {
        
        // Remove toasts and buttons
        if (this.toastID) this.plugin.menus.closeToast(this.toastID)
        if (this.buttonID) this.plugin.menus.unregister(this.buttonID)
        this.toastID = null
        this.buttonID = null
        
    }

    /** Called when a remote message is received */
    async onMessage(data, fromID) {

        // Ignore our own messages
        let ourID = await this.plugin.user.getID()
        if (fromID == ourID)
            return

        // Check message
        console.log('msg', data, from)
        if (data.action == 'remote:activate-photo-booth') {

            // Activate as well, if we are inside the zone
            if (this.isInside) {

                // Start the process
                console.info(`[Photo Booth] Remote user ${data.username} (${data.userID}) triggered the photo booth.`)
                this.activate({ userID: data.userID, username: data.username })

            } else {

                // Ignore since we're not inside the zone
                console.debug(`[Photo Booth] Remote user ${data.username} (${data.userID}) triggered the photo booth, but we're not inside the zone.`)

            }

        }

    }

    /** 
     * Activate. This takes a photo. 
     * 
     * @param {{ userID: string, username: string }} triggeredBy If specified, this is the user who triggered the photo. if null, the photo was triggered by the current user.
     */
    async activate(triggeredBy = null) {

        // Catch errors
        try {

            // Check if this feature is supported
            if (!this.plugin.world.captureImage)
                throw new Error(`This feature is not supported in this version of Vatom Spaces.`)

            // If we're the triggering user, send out a message to others
            if (!triggeredBy) {
                
                // Notify remote users
                this.sendMessage({ 
                    action: 'remote:activate-photo-booth',
                    userID: await this.plugin.user.getID(),
                    username: await this.plugin.user.getDisplayName(),
                }, true)

            }

            // Remove toast if any
            if (this.toastID) this.plugin.menus.closeToast(this.toastID)
            this.toastID = null

            // Create overlay html
            let overlayHTML = panelHTML(`
                <style>
                    .container { 
                        position: absolute; 
                        top: 0px; 
                        left: 0px; 
                        width: 100%; 
                        height: 100%; 
                        display: flex;
                        align-items: center; 
                        justify-content: center;
                        opacity: 0;
                        transition: opacity 1s;
                    }
                    .container.linger {
                        transition: opacity 5s;
                    }
                    .container.visible {
                        opacity: 1;
                        transition: opacity 0s;
                    }
                </style>
                <div id='num3' class='container'><img src='${this.plugin.paths.absolute('num-3.png')}'/></div>
                <div id='num2' class='container'><img src='${this.plugin.paths.absolute('num-2.png')}'/></div>
                <div id='num1' class='container'><img src='${this.plugin.paths.absolute('num-1.png')}'/></div>
                <div id='num0' class='container linger' style='background-color: white; '></div>
                <script>

                    // Flash container
                    async function flash(id) {
                        document.getElementById(id).className = 'container visible'
                        await new Promise(resolve => setTimeout(resolve, 100))
                        document.getElementById(id).className = 'container'
                        await new Promise(resolve => setTimeout(resolve, 900))
                    }

                    // On load
                    window.addEventListener('load', async () => {
                        await flash('num3')
                        await flash('num2')
                        await flash('num1')
                        await flash('num0')
                        vatom.close()
                    })

                </script>
            `)

            // Show countdown UI
            console.log(`[Photo Booth] Taking photo!`)
            let overlayID = await this.plugin.menus.register({
                title: 'Photo Booth Overlay',
                section: 'overlay-top',
                panel: {
                    iframeURL: overlayHTML
                }
            })

            // Remove overlay after all it's animations complete
            setTimeout(() => this.plugin.menus.unregister(overlayID), 15 * 1000)

            // Wait for countdown to complete
            await new Promise(resolve => setTimeout(resolve, 3000))

        } catch (err) {

            // Log error
            console.error(`[Photo Booth] Error taking photo:`, err)
            this.plugin.menus.alert(err.message, "Unable to take photo", "error")

        }

    }

}