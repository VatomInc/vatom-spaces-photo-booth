import { BaseComponent } from "vatom-spaces-plugins"

/**
 * Base component for any of the photo components. Provides some useful utilities.
 */
export class BasePhotoComponent extends BaseComponent {

    /** Get the nearest zone to the user */
    static async getNearestToUser() {

        // Get user position
        let userPos = await plugin.user.getPosition()

        // Done
        return this.getNearestToPosition(userPos.x, userPos.y, userPos.z)

    }

    /** Get nearest to the specified position */
    static getNearestToPosition(x, y, z) {

        // Find nearest camera
        let nearest = null
        let nearestDist = null
        plugin.objects.getComponentInstances().filter(c => c instanceof this).forEach(c => {
            let dist = Math.sqrt((c.fields.world_center_x - x) ** 2 + (c.fields.world_center_y - y) ** 2 + (c.fields.world_center_z - z) ** 2)
            if (!nearest || dist < nearestDist) {
                nearest = c
                nearestDist = dist
            }
        })

        // Done
        return nearest

    }

}