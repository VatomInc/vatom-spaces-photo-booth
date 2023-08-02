import { getDistanceBetweenComponents, isInsizeZone } from "./Utilities"
import { BasePhotoComponent } from "./BasePhotoComponent"

/**
 * This Component provides a button to activate the nearest Photo Booth Zone.
 */
export class PhotoBoothButton extends BasePhotoComponent {

    /** Register the component */
    static register(plugin) {

        // Register this component
        plugin.objects.registerComponent(this, {
            id: 'photobutton',
            name: 'Photo Booth Button',
            description: 'When a user clicks this object, the nearest Photo Booth Zone will be activated.',
            settings: [
                { id: 'info', type: 'label', value: `When a user clicks this object, the nearest Photo Booth Zone will be activated.` },
            ]
        })

    }

    /** Called on click */
    onClick() {

        // Stop if no zone
        if (!this.associatedZone) {
            console.warn("No Photo Booth Zone found")
            this.plugin.menus.alert("No Photo Booth Zone found nearby.", "There was a problem", "error")
            return
        }

        // Activate the zone
        this.associatedZone.activate()

    }

}