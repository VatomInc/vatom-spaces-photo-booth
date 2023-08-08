import React from 'react'
import ReactDOM from 'react-dom/client'
import { PhotoList } from './routes/PhotoList'
import { RouterProvider, createHashRouter } from 'react-router-dom'

/** Create router */
const router = createHashRouter([
    { path: '/space/:spaceID/photos', element: <PhotoList /> },
    { path: '/space/:spaceID/user/:userID/photos', element: <PhotoList insidePopup /> },
])

/** Main app */
const App = () => {

    // Render routes
    return <RouterProvider router={router} />

}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(<App />)