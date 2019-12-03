import React,{useState} from "react"
import Card from "./card"

const CardShower = ({direction, disabled, cards})=>{
    const [selfDisabled, updateDisabled] = useState(disabled)
    const [round, updateRound] = useState(1)

    //Number, showed round, selected
    //[3,0,0] not showed yet
    //[3,0,1] not showed yet, but selected
    //[3,2,1] showed in the second round (round starts with 1)
    const [cardsHistory, updateHistory] = useState([...cards.map(n=>[n,0,0])])
    // const selectCallbacks = [...Array(18).keys()].fill(null)
    const showCard = ()=>{
        cardsHistory.forEach(history=>{
            history[1] = history[2]?round:0
        })

        updateHistory([...cardsHistory])

        updateRound(round+1)
    }

    return (<div>
        <div>
            <button onClick={showCard}>出牌</button>
            <button>清空</button>
        </div>
        <div style={{
            display:'flex',
            width:'fit-content',
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
        }}>
            {cardsHistory.filter(c=>!c).map(card=>(<Card
            onPlaySelect = {(selected)=>{
                cardsHistory[card][2]=selected
                updateHistory([...cardsHistory])}}
            // bindSelectCallback={f=>selectCallbacks[card]=f}
            key={card} 
            number={card}
            isPlaying={true}
            playDirection={direction} />))}
        </div>
    </div>)
}

export default CardShower