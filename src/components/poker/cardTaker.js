import React, {useCallback, useEffect, useState} from "react"
import Card from "./card"
import {ACTION, GAME_STATUS, PLAYER_SIDE} from "./constants"
import {save as saveGame, get as getGame, DEFAULT as defaultGame,act} from "./machine"
import {onlyToPass} from "./algo"

const CardTaker = ({side, game}) => {
    const [showingCards, updateShowingCards] = useState([])
    const isPlayer = side == PLAYER_SIDE.BOTTOM

    const showArea =  <div style={{
        display:'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height:'25vh',
        width:'100vw'
    }}>
        {(isPlayer?game.player_cards_show:game.computer_cards_show).map((card,i) => (<Card
          style={{
              height:'20vh',
              width:'15vh',
          }}
          key={i}
          number={card}
          game={game}
        />))}
    </div>

    return (<div>

        {side==PLAYER_SIDE.BOTTOM?showArea:''}

        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height:'25vh',
            width:'100vw'
        }}>
            {(isPlayer?game.player_cards:game.computer_cards).map((card,i) => (<Card
              style={{height:'25vh'}}
              key={i}
              index={i}
              side={side}
              number={card}
              game={game}/>))}
        </div>

        {side==PLAYER_SIDE.TOP?showArea:''}
    </div>)
}

export default CardTaker