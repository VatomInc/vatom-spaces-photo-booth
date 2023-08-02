import { BaseComponent } from "vatom-spaces-plugins"

/**
 * Base component for any of the photo components. Provides some useful utilities.
 */
export class BasePhotoComponent extends BaseComponent {

    /** Get nearest to the specified position */
    static getNearestToPosition(x, y, z, filterOp = null) {

        // Create default filterOp
        if (!filterOp)
            filterOp = c => c instanceof this

        // Find nearest camera
        let nearest = null
        let nearestDist = null
        plugin.objects.getComponentInstances().filter(filterOp).forEach(c => {
            let dist = Math.sqrt((c.fields.world_center_x - x) ** 2 + (c.fields.world_center_y - y) ** 2 + (c.fields.world_center_z - z) ** 2)
            if (!nearest || dist < nearestDist) {
                nearest = c
                nearestDist = dist
            }
        })

        // Done
        return nearest

    }

    /** Get the nearest to the user */
    static async getNearestToUser(filterOp = null) {

        // Get user position
        let userPos = await plugin.user.getPosition()

        // Done
        return this.getNearestToPosition(userPos.x, userPos.y, userPos.z, filterOp)

    }

    /** @returns {PhotoBoothZone} Get associated (nearest) zone. */
    get associatedZone() {

        // Stop if we're a zone, can't associate with self
        if (this.isPhotoBoothZone)
            return null

        // Get nearest zone
        return BasePhotoComponent.getNearestToPosition(this.fields.world_center_x, this.fields.world_center_y, this.fields.world_center_z, c => c.isPhotoBoothZone)

    }

}