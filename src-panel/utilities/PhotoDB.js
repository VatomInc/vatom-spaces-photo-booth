/**
 * Photo database access.
 * 
 * @event updated Triggered when something changes.
 */
export class PhotoDB extends EventTarget {

    /** Loaded instances */
    static instances = {}

    /** Space ID associated with this instance */
    spaceID = ''

    /** User ID to fetch photos for. Can be blank to fetch all photos in the space. */
    userID = ''

    /** Current status text, blank when idle */
    statusText = ''

    /** All photos */
    photos = []

    /** Get the instance for a specific space */
    static forSpace(spaceID, userID) {

        // Check if an instance exists already
        let key = `${spaceID}:${userID || ''}`
        if (PhotoDB.instances[key]) 
            return PhotoDB.instances[key]

        // Create a new instance
        let instance = new PhotoDB(spaceID, userID)
        PhotoDB.instances[key] = instance
        return instance

    }

    /** Constructor */
    constructor(spaceID, userID) {
        super()

        // Save space ID
        this.spaceID = spaceID
        this.userID = userID

        // Start fetching
        this.fetchPhotos()

    }

    /** @private Fetch photos for a specific space */
    async fetchPhotos() {

        // Catch errors
        try {

            // Fetch folders in the space
            this.statusText = 'Fetching users...'
            this.dispatchEvent(new Event('updated'))
            let json = await fetch('https://us-central1-ydangle-high-fidelity-test-2.cloudfunctions.net/pluginApiListPublicFiles', { 
                method: 'POST', 
                body: JSON.stringify({
                    pluginID: 'com.vatom.photobooth',
                    spaceID: this.spaceID
                })
            }).then(r => r.json())

            // Go through folders
            this.photos = []
            let numFetched = 0
            for (let folder of json.items) {

                // Show status
                this.statusText = `Fetching photos for ${folder.name} (${Math.round(numFetched / json.items.length * 100)}%)...`
                this.dispatchEvent(new Event('updated'))
                numFetched += 1

                // Stop if not a folder or not a user ID
                if (!folder.isFolder) continue
                if (!folder.name.startsWith('vatominc_')) continue

                // Fetch photos for user
                let userID = folder.name.substring('vatominc_'.length)
                let userPhotos = await this.fetchPhotosForUser(userID)
                
                // Add photos and update UI
                this.photos = [ ...this.photos, ...userPhotos ]

                // Sort photos by date descending
                this.photos.sort((a, b) => b.date - a.date)

            }

            // Complete
            this.statusText = ''
            this.dispatchEvent(new Event('updated'))

        } catch (err) {

            // Show error
            console.error('[PhotoDB] Error during photo fetch:', err)
            this.statusText = `Error during fetch`
            this.dispatchEvent(new Event('updated'))

        }

    }

    /** @private Fetch photos for a user */
    async fetchPhotosForUser(userID) {

        // Check for specific userID
        if (this.userID && this.userID !== userID)
            return []

        // Fetch files in the space
        let json = await fetch('https://us-central1-ydangle-high-fidelity-test-2.cloudfunctions.net/pluginApiListPublicFiles', { 
            method: 'POST', 
            body: JSON.stringify({
                pluginID: 'com.vatom.photobooth',
                spaceID: this.spaceID,
                path: `vatominc_${userID}`
            })
        }).then(r => r.json())

        // Go through each file
        let photos = []
        for (let file of json.items) {

            // Skip folders and bad files
            if (file.isFolder) continue
            if (!file.name.startsWith('Photo ')) continue

            // Skip if thumbnail
            if (file.name.includes('thumbnail'))
                continue

            // Extract info from filename by splitting on spaces and dots
            let parts = file.name.split(/[\s\.]+/)

            // Add it
            photos.push({
                ...file,
                thumbnailURL: file.url,
                userID,
                date: new Date(parts[1]).getTime(),
            })

        }

        // For photos with a thumbnail, use those
        for (let file of json.items) {

            // Skip folders and bad files
            if (file.isFolder) continue
            if (!file.name.startsWith('Photo ')) continue

            // Skip if not thumbnail
            if (!file.name.includes('thumbnail'))
                continue

            // Extract info from filename by splitting on spaces and dots
            let parts = file.name.split(/[\s\.]+/)

            // Find the photo
            let photo = photos.find(p => p.name.startsWith(`Photo ${parts[1]}`))
            if (!photo) continue

            // Add thumbnail
            photo.thumbnailURL = file.url

        }

        // Done
        return photos

    }

}