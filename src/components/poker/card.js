import React, {useState, useEffect, useCallback} from "react"
import {save as saveGame, get as getGame, DEFAULT as defaultGame, act} from "./machine"
import {ACTION, GAME_STATUS, PLAYER_SIDE, numberName,POKER_LITERAL_IMG,POKER_SUITS_IMG,POKER_BACK,POKER_SUITS_FILTER,POKER_SUITS_COLOR} from "./constants"
import './card.css'

const Poker = ({game, side, number, cardIndex, style={}, disabled,isForShow}) => {
    const cards = side === PLAYER_SIDE.TOP ? game.selection_a : game.selection_b
    let countStr = numberName[number]
    const card_suits = isForShow?game.player_cards_selected_suit_last:game.player_cards_selected_each_suit
    const isPlayer = side===PLAYER_SIDE.BOTTOM
    const COMPUTER_DEFAULT = 1
    const cardFilter = POKER_SUITS_FILTER[isPlayer?card_suits[cardIndex]:COMPUTER_DEFAULT]
    const cardColor = POKER_SUITS_COLOR[isPlayer?card_suits[cardIndex]:COMPUTER_DEFAULT]
    const width = style.width|| '5em',height = style.height|| '10em';

    let transformY = ''
    let onEnterCard = () => {}
    let onClickCard = () => {}

    if (game.status === GAME_STATUS.GAMING) {
        if (!isForShow && isPlayer) {

            onEnterCard = (e) => {
                if(e.buttons===1){
                    game = act(game, ACTION.GAME_SELECT, [number, cardIndex])
                }
            }

            onClickCard = (e)=>{e.preventDefault();game = act(game, ACTION.GAME_SELECT, [number, cardIndex])}
        }else if(!isForShow && !isPlayer){
            onClickCard = ()=>{
                game = act(game, ACTION.GAME_TOGGLE_COMPUTER)
            }

            // if(style.transform){
            //     if(!isPlayer&&!game.show_computer_cards){
            //         style.transform+=' rotateY(180deg)'
            //     }
            // }
        }
    }
    return (
        <div className={`card-wrapper ${!isPlayer&&!isForShow&&!game.show_computer_cards?'flipped':''}`} onMouseDown={onClickCard} onMouseEnter={onEnterCard} style={{
            opacity: disabled ? '.5' : '1',
            ...style,
            width,height,
            bottom:!isForShow && isPlayer && game.player_cards_selected_each[cardIndex] ?'20px':'auto',
        }}>

            <div className='card-front' style={{
                background:`url('${POKER_LITERAL_IMG[number]}') 0% 0% / cover, linear-gradient(${cardColor}, rgb(40,40,40) ${number<16?80:150}%)`,
                backgroundBlendMode: 'lighten',
                // width,height,
            }}>
                <div className='card-literal'></div>
                <div className='card-hover' style={{width,height,}}></div>
                <div className='card-suit' style={{
                    display:number<16?'inherit':'none',
                    width:'100%',
                    height:'100%',
                    // width,height,
                    background:`url('${POKER_SUITS_IMG[isPlayer?game.player_cards_selected_each_suit[cardIndex]:COMPUTER_DEFAULT]}') 0% 0% / cover`,
                    filter:`${cardFilter} `,
                }}></div>
            </div>

            <div className='card-back' style={{
                background:`url('${POKER_BACK}') 0 0 repeat`
            }}>

            </div>
        </div>)
}

export default Poker