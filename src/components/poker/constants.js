export const GAME_STATUS = {
    SELECT:10,
    GAMING:20,
    GAMEOVER:30,
}

export const PLAYER_SIDE = {
    TOP:1,
    BOTTOM:2,
}

export const ACTION = {
    SELECT_TOP:10,
    SELECT_DOWN:20,
    SELECT_ADDCARD:21,
    SELECT_REMOVECARD:22,
    GAME_START:40,
    GAME_SELECT:30,
    GAME_SHOWCARDS:50,
    GAME_CLEAR_SELECTION:60,
    GAME_END:70,
    GAME_RESTART:80
}

const numberName = [...Array(18).keys()]

numberName[11] = 'J'
numberName[12] = 'Q'
numberName[13] = 'K'
numberName[14] = 'A'
numberName[15] = '2'
numberName[16] = 'joker'
numberName[17] = 'JOKER'

export {numberName}