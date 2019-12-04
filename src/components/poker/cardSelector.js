import React,{useState} from "react"
import Card from "./card"

const Selector = ({game,side})=>{
    const [cardsUsed, updateUsed] = useState([...Array(18).keys()].fill(0))
    const clearFn = [...Array(18).keys()].fill(null)

    // console.log(cardsUsed)

    return (<div>
        <div style={{
            display:'flex',
            width:'fit-content',
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
        }}>

        {[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(n=>(<Card key={n} game = {game} number={n} side={side}/>))}
        </div>
    </div>)
}

export default Selector