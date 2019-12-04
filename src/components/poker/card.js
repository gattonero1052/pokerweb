import React, {useState, useEffect} from "react"
import {save as saveGame, get as getGame, DEFAULT as defaultGame, act} from "./machine"
import {ACTION, GAME_STATUS, PLAYER_SIDE, numberName} from "./constants"

const Poker = ({game, side, number, index, style, disabled}) => {
    const cards = side === PLAYER_SIDE.TOP ? game.selection_a : game.selection_b
    let countStr = numberName[number]
    let transform = ''
    let onClickCard = () => {}

    if (game.status === GAME_STATUS.GAMING) {
        if (side == PLAYER_SIDE.BOTTOM) {
            transform = game.player_cards_selected_each[index] ? 'translateY(-30px)' : ''
            onClickCard = () => {
                game = act(game, ACTION.GAME_SELECT, [number, index])
            }
        }
    }

    if(game.status === GAME_STATUS.SELECT){
        countStr = `${number}${cards[number] > 0 ? ' x ' + cards[number] : ''}`
    }

    return (
        <div onClick={onClickCard} style={{
            position: 'relative',
            opacity: disabled ? '.5' : '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '2em',
            margin: '10px',
            transform,
            color: 'black',
            border: '3px solid black',
            width: '5em',
            height: '10em'
            , ...style
        }}>

            {game.status !== GAME_STATUS.SELECT ? '' :
                <div style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px'
                }}>
                    <button onClick={() => {
                        game = act(game, ACTION.SELECT_ADDCARD, [number, 1, side])
                    }}>+
                    </button>
                    <button onClick={() => {
                        game = act(game, ACTION.SELECT_REMOVECARD, [number, 1, side])
                    }}>-
                    </button>
                </div>
            }
            {countStr}
        </div>)
}

export default Poker