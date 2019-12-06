import React, {useState} from "react"
import Card from "./card"
import {ACTION, GAME_STATUS, PLAYER_SIDE, POKER_LITERAL_IMG, POKER_SUITS_COLOR,DRAG_TYPE} from "./constants";
import {act} from "./machine";
import './cardSelector.css'
import { useDrag } from 'react-dnd'

const CardPlacer = ({game, number, side}) => {
    const cardColor = POKER_SUITS_COLOR[number % 4]
    const cards = side === PLAYER_SIDE.TOP ? game.selection_a : game.selection_b
    const added = !!(cards[number])
    let countStr = `${cards[number] > 0 ? 'x' + cards[number] : ''}`
    const [{isDragging}, drag] = useDrag({
        item: { number, type:DRAG_TYPE.CARD },
        collect:monitor=>({isDragging:!!monitor.isDragging()}),
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult() // 这里不需要 result
            if (item) {
                game = act(game, ACTION.SELECT_REMOVECARD, [number, 1, side])
            }
        },
    })

    return (<div style={{
        flex: 1}}>
        <div className='card-placer' style={{
            height: '20vh',
            width: 'auto',
        }}>
            <div ref={drag}
                 className={`card-placer-add ${added?'':'empty'}`}
                 onClick={() => {
                     game = act(game, ACTION.SELECT_ADDCARD, [number, 1, side])
                 }}
                 style={{
                     opacity:added?'.5':'.2',
                     border:added?'5px solid black':'',
                     boxShadow: [...Array(cards[number]).keys()].map(i=>`${i*3}px ${i*3}px black`),
                     background: `url('${POKER_LITERAL_IMG[number]}') 0% 0% / cover, linear-gradient(${cardColor}, rgb(40,40,40) ${number < 16 ? 80 : 150}%)`,
                 }}>
                <div className={`card-place-add-number`}>{countStr}</div>
                <div></div>
            </div>
        </div>
    </div>)
}

const Selector = ({game, side}) => {
    const [cardsUsed, updateUsed] = useState([...Array(18).keys()].fill(0))
    const clearFn = [...Array(18).keys()].fill(null)

    // console.log(cardsUsed)

    return (<div>
        <div style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        }}>

            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(n => (
                <CardPlacer key={n} game={game} number={n} side={side}/>))}
        </div>
    </div>)
}

export default Selector