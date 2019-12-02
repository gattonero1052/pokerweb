import React,{useState} from "react"
import Card from "./card"

const Selector = ({cardPool,disabled, confirmCallback, bindClear})=>{
    const [cardsUsed, updateUsed] = useState([...Array(18).keys()].fill(0))
    const clearFn = [...Array(18).keys()].fill(null)

    bindClear(()=>{clearFn.forEach(f=>{if(f){f()}})})

    // console.log(cardsUsed)

    return (<div>
        <div>
            <button {...(disabled?{disabled:true}:{})} onClick={()=>{confirmCallback(cardsUsed)}}>确定</button>
        </div>
        <div style={{
            display:'flex',
            width:'fit-content',
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
        }}>

        {[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(n=>(<Card bindClear={f=>clearFn[n]=f} maxSelect = {cardPool[n]} disabled={disabled} key={n} number={n} cardsDictUpdater={(n,c)=>{
            cardsUsed[n] = c
            updateUsed([...cardsUsed])
        }}/>))}
        </div>
    </div>)
}

export default Selector