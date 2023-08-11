import React from 'react'
import ReactDOM from 'react-dom/client'
import { PhotoList } from './routes/PhotoList'
import { HashRouter, Route, RouterProvider, Routes, createHashRouter } from 'react-router-dom'
import { PhotoView } from './routes/PhotoView'

/** Main app */
const App = () => {

    // Render routes
    return <HashRouter>

        {/* App routes */}
        <Routes>
            <Route path='/space/:spaceID/photos' element={<PhotoList />} />
            <Route path='/space/:spaceID/user/:userID/photos' element={<PhotoList />} />
            <Route path='/space/:spaceID/photo/:photoName' element={<PhotoView />} />
            <Route path='/space/:spaceID/user/:userID/photo/:photoName' element={<PhotoView />} />
        </Routes>
    
    </HashRouter>

}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(<App />)