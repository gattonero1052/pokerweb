import React,{useState} from "react"
import Card from "./card"

const Selector = ()=>{
    const [cardsDict, updateDict] = useState([...Array(18).keys()].fill(0))
    console.log(cardsDict)
    return (<div>
        <div>
            <button>Confirm</button>
        </div>
        <div style={{
            display:'flex',
            width:'fit-content',
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
        }}>

        {[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(n=>(<Card key={n} number={n} cardsDictUpdater={(n,c)=>{
            cardsDict[n] = c
            updateDict([...cardsDict])
        }}/>))}
        </div>
    </div>)
}

export default Selector