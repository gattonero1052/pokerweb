import React,{useState, useEffect} from "react"

const Poker = ({number, disabled= false,style = {}, cardsDictUpdater})=>{
    const [count, updateCount] = useState(0)

    let countStr = count?'x'+count:''
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
                cardsDictUpdater(number, count)
                updateCount(Math.min(4,count+1))}}>+</button>
            <button onClick={()=>{
                cardsDictUpdater(number, count)
                updateCount(Math.max(0,count-1))}}>-</button>
        </div>
        
    {`${number}${countStr}`}
  </div>)
}

export default Poker