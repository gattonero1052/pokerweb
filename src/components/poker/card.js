import React,{useState, useEffect} from "react"

let numberName = [...Array(18).keys()]

numberName[11] = 'J'
numberName[12] = 'Q'
numberName[13] = 'K'
numberName[14] = 'A'
numberName[15] = '2'
numberName[16] = 'joker'
numberName[17] = 'JOKER'

const Poker = ({bindClear, maxSelect, number, disabled= false,style = {}, cardsDictUpdater})=>{
    const [count, updateCount] = useState(0)

    bindClear(()=>{updateCount(0)})

    let countStr = count?' x '+count:''
    return (
    <div style={{
        position:'relative',
        opacity:disabled?'.5':'1',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        fontSize:'2em',
        margin:'10px',
        color:'black',
        border:'3px solid black',
        width:'5em',
        height:'10em'
    ,...style}}>
        <div style={{
            position:'absolute',
            top:'5px',
            right:'5px'
        }}>
            <button onClick={()=>{
                let newCount = Math.min(maxSelect,count+1)
                cardsDictUpdater(number, newCount)
                updateCount(newCount)}}>+</button>
            <button onClick={()=>{
                let newCount = Math.max(0,count-1)
                cardsDictUpdater(number, newCount)
                updateCount(newCount)}}>-</button>
        </div>
        
    {`${numberName[number]}${countStr}`}
  </div>)
}

export default Poker