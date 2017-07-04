import Hammer from 'hammerjs';
import nipplejs from 'nipplejs';
import Utils from './utils';
import Renderer from './renderer';
import Settings from './settings';

Utils.addCSS(
    `
    .hide-cursor {
        cursor: none;
    }

    #move-div {
        width: 200px;
        height: calc(100% - 100px);
        left: 0px;
        bottom: 0px;
        margin: 0;
        padding: 0;
        position: absolute;
        z-index : 50;
        visibility :hidden;
    }

    #look-div {
        width: calc(100% - 200px);
        height: calc(100% - 100px);
        right: 0px;
        bottom: 0px;
        margin: 0;
        padding: 0;
        position: absolute;
        z-index : 50;
        opacity: 0.01;
    }

    #console-div {
        width: 100%;
        height: 100px;
        right: 0px;
        top: 0px;
        margin: 0;
        padding: 0;
        position: absolute;
        z-index : 50;
        opacity: 0.01;
    }

    .show-joystick {
        visibility: visible;
    }
    `
);

let showCursor = true;
let cursorMovement = {
    x: 0,
    y: 0
};
let pressed = {};
let upevents = [];
let downevents = [];
let timeout;

window.addEventListener('keyup', (event) => {
    delete pressed[event.keyCode];
    for (let l = 0; l < upevents.length; l++) {
        if (upevents[l].key === event.keyCode) {
            upevents[l].event();
        }
    }
    for (let l = 0; l < downevents.length; l++) {
        if (downevents[l].pressed) {
            downevents[l].pressed = false;
        }
    }
}, false);

window.addEventListener('keydown', (event) => {
    pressed[event.keyCode] = true;
    for (let l = 0; l < downevents.length; l++) {
        if (downevents[l].key === event.keyCode && (!downevents[l].pressed)) {
            downevents[l].event();
            downevents[l].pressed = true;
        }
    }
}, false);

window.addEventListener('mousemove', (evt) => {
    cursorMovement = {
        x: evt.movementX,
        y: evt.movementY
    };
    if (timeout !== undefined) {
        window.clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
        cursorMovement = {
            x: 0,
            y: 0
        };
    }, 50);
}, false);

if (Utils.isMobile()) {
    // touch mouse input
    const lookDiv = Utils.addElement('div', 'look-div');
    const look = new Hammer(lookDiv);
    look.get('pan').set({
        direction: Hammer.DIRECTION_ALL
    });
    look.on('panmove panend', (ev) => {
        cursorMovement = {
            x: 0,
            y: 0
        };
        if (ev.type === 'panmove') {
            cursorMovement = {
                x: ev.velocityX * 100,
                y: ev.velocityY * 100
            };
        }
    });

    // WASD input with virtual joystick
    const moveDiv = Utils.addElement('div', 'move-div');
    const move = nipplejs.create({
        zone: moveDiv,
        mode: 'static',
        position: { left: '80px', bottom: '80px' },
        color: 'white'
    });
    move.on('move', (evt, data) => {
        if (data.angle && data.distance && data.distance > 20) {
            delete pressed[Settings.forward];
            delete pressed[Settings.backwards];
            delete pressed[Settings.left];
            delete pressed[Settings.right];
            const a = data.angle.degree;

            if ((a >= 337.5 && a < 360) || (a >= 0 && a < 22.5)) {
                pressed[Settings.right] = true;
            }

            if (a >= 22.5 && a < 67.5) {
                pressed[Settings.right] = true;
                pressed[Settings.forward] = true;
            }

            if (a >= 67.5 && a < 112.5) {
                pressed[Settings.forward] = true;
            }

            if (a >= 112.5 && a < 157.5) {
                pressed[Settings.forward] = true;
                pressed[Settings.left] = true;
            }

            if (a >= 157.5 && a < 202.5) {
                pressed[Settings.left] = true;
            }

            if (a >= 202.5 && a < 247.5) {
                pressed[Settings.left] = true;
                pressed[Settings.backwards] = true;
            }

            if (a >= 247.5 && a < 292.5) {
                pressed[Settings.backwards] = true;
            }

            if (a >= 292.5 && a < 337.5) {
                pressed[Settings.backwards] = true;
                pressed[Settings.right] = true;
            }
        }
    }).on('end', () => {
        delete pressed[Settings.forward];
        delete pressed[Settings.backwards];
        delete pressed[Settings.left];
        delete pressed[Settings.right];
    });
    moveDiv.firstChild.classList.add('show-joystick');
}

const Input = {
    cursorMovement() {
        return cursorMovement;
    },

    toggleCursor(show) {
        if (show === undefined) {
            showCursor = !showCursor;
        } else {
            showCursor = show;
        }
        if (showCursor) {
            document.body.classList.remove('hide-cursor');
            document.exitPointerLock();
        } else {
            document.body.classList.add('hide-cursor');
            Renderer.canvas.requestPointerLock();
        }
    },

    clearInputEvents() {
        pressed = {};
        upevents = [];
        downevents = [];
    },

    addKeyDownEvent(key, event) {
        downevents.push({
            /* eslint-disable */
            key: key,
            event: event,
            /* eslint-disable */
            pressed: false
        });
    },

    addKeyUpEvent(key, event) {
        upevents.push({
             /* eslint-disable */
            key: key,
            event: event
             /* eslint-disable */
        });
    },

    isDown(keyCode){
        return pressed[keyCode];
    }
}

export {Input as default };

