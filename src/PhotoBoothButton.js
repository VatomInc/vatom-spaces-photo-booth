import { BaseComponent } from "vatom-spaces-plugins"
import { getDistanceBetweenComponents, isInsizeZone } from "./Utilities"

/**
 * This Component provides a button to activate the nearest Photo Booth Zone.
 */
export class PhotoBoothButton extends BaseComponent {

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

        // Find the nearest photo zone
        let nearestZone = this.plugin.objects.getComponentInstances().filter(c => c.isPhotoBoothZone).reduce((prev, current) => {

            // If no previous, use current
            if (!prev)
                return current

            // Get distance to current
            let prevDist = getDistanceBetweenComponents(this, prev)
            let currentDist = getDistanceBetweenComponents(this, current)

            // Return the closest
            return prevDist < currentDist ? prev : current

        }, null)

        // Stop if no zone
        if (!nearestZone) {
            console.warn("No Photo Booth Zone found")
            this.plugin.menus.alert("No Photo Booth Zone found nearby.", "There was a problem", "error")
        }

        // Activate the zone
        nearestZone.activate()

    }

}