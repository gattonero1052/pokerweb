import React, {useCallback, useEffect, useState} from "react"
import Card from "./card"
import {ACTION, GAME_STATUS, PLAYER_SIDE} from "./constants"
import {save as saveGame, get as getGame, DEFAULT as defaultGame,act} from "./machine"
import {onlyToPass} from "./algo"

const CardTaker = ({side, game}) => {
    const [showingCards, updateShowingCards] = useState([])
    const isPlayer = side == PLAYER_SIDE.BOTTOM
    const cards = isPlayer?game.player_cards:game.computer_cards
    const cardsShow = isPlayer?game.player_cards_show:game.computer_cards_show
    const cardWidth = 25*0.78125, cardNumberWidth = 25*0.2604

    const showArea =  <div style={{
        display:'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height:'25vh',
        width:'auto',
        margin:'5vh',
        zoom:isPlayer?'1':'.6',
    }}>
        {cardsShow.map((card,i) => (<Card
          style={{
              height:'25vh',
              width:`${cardWidth}vh`,
          }}
          key={i}
          cardIndex={i}
          number={card}
          isForShow = {true}
          game={game}
        />))}
    </div>

    return (<div style={{width:'100%'}}>

        {isPlayer?showArea:''}

        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height:'25vh',
            width:'100%',
            zoom:isPlayer?'1':'.6'
        }}>
            {cards.map((card,i) => (<Card
              style={{
                  transform:`translateX(${i*cardNumberWidth-(cardNumberWidth*(cards.length-1))/2}vh)`,
                  zIndex:i+10,
                  width:`${cardWidth}vh`,
                  position:'absolute',
                  height:'25vh'}}
              key={i}
              cardIndex={i}
              side={side}
              number={card}
              game={game}/>))}
        </div>

        {side==PLAYER_SIDE.TOP?showArea:''}
    </div>)
}

export default CardTaker