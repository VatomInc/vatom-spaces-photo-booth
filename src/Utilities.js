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
 */
export async function isInsizeZone(zoneFields) {

    // Get user's position
    let userPos = await getPlugin().user.getPosition()

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

/** Wrap HTML for displaying inside a menu/popup */
export function panelHTML(html) {

    // Generate a random ID
    let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Wrapper
    let wrapper = `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>
                    html, head {
                        overflow: hidden;
                        width: 100%; height: 100%; 
                        margin: 0px;
                        padding: 0px;
                        cursor: default;
                        font-family: Inter, Helvetica Neue, Helvetica, Arial; 
                    }
                </style>
                <script>
                    window.vatom = {
                        close: () => window.parent.postMessage({ action: 'panelHTML:close', id: "${id}" }, '*'),
                    }
                </script>
            </head>
            <body>
                INSERT_CONTENT_HERE
            </body>
        </html>`

    // Minify it
    wrapper = wrapper.replace(/\s+/g, ' ')

    // Insert content
    html = wrapper.replace('INSERT_CONTENT_HERE', html.trim())

    // Convert to data URI
    let data = encodeURIComponent(html)
    return `data:text/html;charset=utf-8,${data}`

}