import { BasePlugin } from 'vatom-spaces-plugins'

/** 
 * Get plugin instance.
 * 
 * Note: The plugin instance is exposed globally as `plugin`, this is just a convenience method.
 * 
 * @returns {BasePlugin} The plugin instance
 */
export function getPlugin() {
    return self.plugin
}

/**
 * Checks if the user is inside a zone.
 * 
 * @param {Object} zoneFields The zone fields
 * @param {Object} userPos The user's position, result of `plugin.user.getPosition()`. Can be null to fetch it automatically.
 */
export async function isInsizeZone(zoneFields, userPos = null) {

    // Get user's position
    if (!userPos)
        userPos = await getPlugin().user.getPosition()

    // Check if insize the zone
    let minX = zoneFields.world_center_x - zoneFields.world_bounds_x/2
    let minY = zoneFields.world_center_y - zoneFields.world_bounds_y/2
    let minZ = zoneFields.world_center_z - zoneFields.world_bounds_z/2
    let maxX = zoneFields.world_center_x + zoneFields.world_bounds_x/2
    let maxY = zoneFields.world_center_y + zoneFields.world_bounds_y/2
    let maxZ = zoneFields.world_center_z + zoneFields.world_bounds_z/2
    return userPos.x > minX && userPos.x < maxX && userPos.y > minY && userPos.y < maxY && userPos.z > minZ && userPos.z < maxZ

}

/**
 * Gets the distance between two components.
 */
export function getDistanceBetweenComponents(obj1, obj2) {

    // Get positions
    return Math.sqrt(
        (obj1.fields.world_center_x - obj2.fields.world_center_x) ** 2 +
        (obj1.fields.world_center_y - obj2.fields.world_center_y) ** 2 +
        (obj1.fields.world_center_z - obj2.fields.world_center_z) ** 2
    )

}