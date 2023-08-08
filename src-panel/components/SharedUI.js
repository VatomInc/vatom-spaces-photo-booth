import React from 'react'

/** Screen with titlebar */
export const Screen = props => {

    // Render UI
    return <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
    
        {/* Header bar */}
        <div style={{ position: 'absolute', zIndex: 2, top: 0, left: 0, width: '100%', height: 60, borderBottom: '1px solid #333', backgroundColor: '#111', display: 'flex', alignItems: 'center', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}>

            {/* Left buttons */}
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', display: 'flex', alignItems: 'center', paddingLeft: 14 }}>
                {props.titlebarLeft}
            </div>

            {/* Center text */}
            <div style={{ flex: '1 1 1px' }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>{props.title}</div>
                <div style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 3 }}>{props.subtitle}</div>
            </div>

            {/* Right buttons */}
            <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', display: 'flex', alignItems: 'center', paddingRight: 14 }}>
                {props.titlebarRight}
            </div>

        </div>

        {/* Content area */}
        <div style={{ position: 'absolute', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)', overflowX: 'hidden', overflowY: 'auto' }}>
            {props.children}
        </div>

    </div>

}

/** Menubar button */
export const MenubarButton = props => {

    // Render UI
    return <div
        style={{ 
            width: 32, 
            alignSelf: 'stretch', 
            cursor: 'pointer',
            backgroundImage: `url(${props.icon})`,
            backgroundSize: '16px 16px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
        }}
        onClick={props.onClick}
    />

}