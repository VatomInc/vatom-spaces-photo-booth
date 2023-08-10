import { BasePhotoComponent } from "./BasePhotoComponent"

/**
 * This Component provides a button to activate the nearest Photo Booth Zone.
 */
export class PhotoBoothCamera extends BasePhotoComponent {

    /** This is a camera component */
    isPhotoBoothCamera = true

    /** Register the component */
    static register(plugin) {

        // Register this component
        plugin.objects.registerComponent(this, {
            id: 'photocamera',
            name: 'Photo Booth Camera',
            description: 'When a user takes a photo, the nearest camera will be used.',
            settings: [
                { id: 'info', type: 'label', value: `When a user takes a photo, the nearest camera will be used.` },
                { id: 'height-offset', type: 'number', name: 'Height Offset', help: 'When the camera aims at the center of the Photo Booth Zone, this specifies how high off the ground the camera will aim at, in meters.', default: 1.8 },
            ]
        })

    }

}