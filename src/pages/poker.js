import React, {useState} from "react"
import CardSelector from "../components/poker/cardSelector"
import Layout from "../components/layout"

const STATUS = {
    SELECT_A: 0,
    SELECT_B: 1,
    GAMING: 2,
    GAME_OVER: 3
}

const SIDE = {
    A: 0,//ABOVE
    B: 1//BELOW
}

const DefaultCardPool = [...Array(18).keys()].map(n => n < 16 ? 4 : 1)

const Poker = () => {
    const [gameStatus, updateStatus] = useState(STATUS.SELECT_A)
    const [ADisabled, updateA] = useState(0)
    const [BDisabled, updateB] = useState(1)
    const [cardPool, updateCardPool] = useState([...DefaultCardPool])
    const [side, updateSide] = useState(SIDE.A)
    const [playerFirst, updateFirst] = useState(true)

    let clearA, clearB

    return (
      <div>
          <button onClick={() => {
              clearB()
              updateCardPool([...DefaultCardPool])
              updateB(1)
              updateA(0)
              updateStatus(STATUS.SELECT_A)
          }} {...(gameStatus == STATUS.SELECT_B ? {} : {disabled: true})}>重选上面的牌
          </button>


          <CardSelector cardPool={cardPool} disabled={ADisabled} bindClear={f => clearA = f}
                        confirmCallback={(cardsUsed) => {
                            updateA(1)
                            updateB(0)
                            updateStatus(STATUS.SELECT_B)
                            cardsUsed.forEach((e, i) => cardPool[i] -= e)
                            updateCardPool(cardPool)
                        }
                        }/>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
              <button  style={{margin:'0 10px'}} onClick={() => updateSide(SIDE.A)}>选上面</button>
              <div  style={{margin:'0 30px'}}>我准备拿{side == SIDE.A ? '上' : '下'}面的牌</div>
              <button style={{margin:'0 10px'}} onClick={() => updateSide(SIDE.b)}>选下面</button>
              <input onChange={() => updateFirst(!playerFirst)} type="checkbox" checked={playerFirst}/>我{playerFirst ? '先' : '后'}出
          </div>
          <CardSelector cardPool={cardPool} disabled={BDisabled} bindClear={f => clearB = f}
                        confirmCallback={(cardsUsed) => {
                            updateB(1)
                            updateStatus(STATUS.GAMING)
                            cardsUsed.forEach((e, i) => cardPool[i] -= e)
                            updateCardPool(cardPool)
                        }
                        }/>
      </div>)
}

export default Poker