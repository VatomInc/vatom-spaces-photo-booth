# Photo Booth 🔌

This [Vatom Spaces](https://vatom.com) plugin allows users to take a group photo together.

## Setup

### Step 1: Install the plugin

You can get the plugin from the Marketplace (once published) or by sideloading it from the source code.

> To sideload, clone the repo, then run `npm install`, then `npm run login`, then `npm run sideload <yourSpaceName>`.

### Step 2: Create a Photo Booth Zone

Go to `Insert > Objects > Photo Booth` to create a new photo booth zone. You can position and scale the zone until it fits the area you want to use as a photo booth. You can configure it by opening it in the Editor and selecting the Components tab.

> By default, it will show a Toast message when a user enters asking if they want to take a photo.

### Step 3: (optional) Add a Camera

Go to `Insert > Objects > Photo Booth > Camera` to insert a Camera. You can position it where you want, and hide it as well.

> When a photo is taken, the nearest Camera will be used to position the camera, and it will look at the center of the Photo Booth zone. If no camera is nearby, the user's current viewport camera will be used.

### Step 4: (optional) Add a trigger button

By default the Photo Booth Zone will show a Toast asking users to take a photo when they are inside the zone. If you set the activation mode to "None" on the zone, you can instead add a trigger button to the scene. Add any image or model to be your button, then in the Editor > Components tab, add the `Photo Booth Button` component. 

When a user clicks the button, the Photo Booth Zone nearest to the button is triggered.

## Development

- Ensure you have [Node](https://nodejs.org) installed
- Install dependencies with `npm install`
- Login to the Vatom CLI with `npm run login`
- Build and load the plugin into your space with `npm run sideload -- myspace` (replace `myspace` with your space alias name)
- When ready, publish to the Marketplace with `npm run publish`

> **Note:** You can only sideload plugins in a space you are the owner of.
