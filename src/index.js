import { BasePlugin, BaseComponent } from 'vatom-spaces-plugins'
import { PhotoBoothZone } from './PhotoBoothZone'
import { PhotoBoothButton } from './PhotoBoothButton'

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
        PhotoBoothZone.register(this)

    }

    /** Called when a message is received */
    onMessage(message, fromID) {
        console.debug(`[Photo Booth] Message received:`, message)
    }

}
