import React, {useState, useEffect} from "react"
import CardSelector from "../components/poker/cardSelector"
import Layout from "../components/layout"
import CardTaker from "../components/poker/cardTaker"
import {ACTION, GAME_STATUS, PLAYER_SIDE, DRAG_TYPE} from "../components/poker/constants"
import './poker.css'

import {
    save as saveGame,
    get as getGame,
    DEFAULT as defaultGame,
    act,asyncAct,
    getRoot as getGameRoot, getCards
} from "../components/poker/machine"
import {build, findNext, matchNext, onlyToPass} from "../components/poker/algo"
import {DndProvider, useDrop} from 'react-dnd'
import HTML5Backend from "react-dnd-html5-backend";
import {graphql, useStaticQuery} from "gatsby";
import Img from "gatsby-image";

const DefaultCardPool = [...Array(18).keys()].map(n => [n < 16 ? 4 : 1, 0, 0])

const Match = ({game}) => {
    const confirmCards = () => {
        if (!game.player_cards_selected.length && game.player_first && game.round===0) {
            alert('选牌先')
            return
        }

        let res = act(game, ACTION.GAME_SHOWCARDS)
        if (!res) {
            alert('不能这么出')
        } else {
            game = res
        }
        game = act(game, ACTION.GAME_CLEAR_SELECTION)

        if (game.node.end) {
            game = act(game, ACTION.GAME_END)
            alert(`你${game.player_cards.length?'输':'赢'}了!`)
        }
    }

    const restart = async () => {
        game = await asyncAct(game, ACTION.GAME_RESTART,[0])
    }

    const exchangeRestart = async()=>{
        game = await asyncAct(game, ACTION.GAME_RESTART,[1])
    }

    return (
        <div>
            <div style={{width: '100%', position: "absolute", top: 0}}>
                <CardTaker side={PLAYER_SIDE.TOP} game={game}/>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '35vh',
                zIndex: '1000',
                width: '100%',

            }}>
                {
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <button className='poker-button' onClick={exchangeRestart}>换边开始
                        </button>
                        <button className='poker-button' onClick={restart}>重新开始
                        </button>
                        <button style={{
                            display: game.status == GAME_STATUS.GAMEOVER ? 'none' : 'flex',
                        }} className='poker-button'
                                onClick={confirmCards}>出牌
                        </button>
                        <button style={{
                            display: game.status == GAME_STATUS.GAMEOVER ? 'none' : 'flex',
                        }} className='poker-button'
                                onClick={() => {
                                    game = act(game, ACTION.GAME_CLEAR_SELECTION)
                                }}>清空
                        </button>
                        <button className='poker-button' onClick={() => {
                            game = act(game, ACTION.GAME_RESELECT)
                        }}>重新选择卡牌
                        </button>
                    </div>
                }
            </div>

            <div style={{width: '100%', position: "absolute", bottom: '30px'}}>
                <CardTaker side={PLAYER_SIDE.BOTTOM} game={game}/>
            </div>
        </div>
    )
}

const SelectCards = () => {
    let [game, updateGame] = useState(defaultGame)
    // let [maxHeap, updateMaxHeap] = useState(10)

    const stopAnimation = () => {
        setTimeout(() => {
            game = act(game, ACTION.SELECT_STOP_ANIMATION)
        }, 2000)
    }

    const checkCardsSelected = () => {
        let acount = game.selection_a.filter(Boolean).length,
            bcount = game.selection_b.filter(Boolean).length
        if (!acount && !bcount) {
            game = act(game, ACTION.SELECT_ALERT_BOTH)
            stopAnimation()
            return false
        }

        if (!acount) {
            game = act(game, ACTION.SELECT_ALERT_A)
            stopAnimation()
            return false
        }

        if (!bcount) {
            game = act(game, ACTION.SELECT_ALERT_B)
            stopAnimation()
            return false
        }
        return true
    }

    const [{isOver, canDrop}, drop] = useDrop({
        accept: [DRAG_TYPE.CARD],
        drop: () => ({}),
        collect: monitor => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    })

    //load game when mount, do not remember selected cards
    useEffect(() => {
        let ngame = getGame(false)
        if(ngame.status!==GAME_STATUS.SELECT)
            ngame = getGame(true)

        ngame.loading = false
        ngame.update = updateGame.bind(this)
        // game.player_cards_selected = []

        let root = getGameRoot()

        if (root) {
            game = act(game,ACTION.GAME_RESELECT)
        }

        updateGame(ngame)
    }, [])

    return (
        <div>
            <div style={{
                zIndex:10,
                position:'fixed',
                height:'100vh',
                width:'100vw',
                display:game.loading?'flex':'none',
                justifyContent:`center`,
                alignItems:`center`,
                background:'rgba(0,0,0,.5)'
            }}>
                <LoadingSVG/>
            </div>

            <div ref={drop}
                 style={{
                     fontFamily: 'Microsoft YaHei UI, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
                     position: 'absolute',
                     zIndex: 1,
                     display: game.status === GAME_STATUS.SELECT ? 'flex' : 'none',
                     flexDirection: 'column',
                     backgroundColor: 'transparent',
                     justifyContent: 'space-between',
                     alignItems: 'space-around',
                     width: '100%',
                     height: '100vh',
                     color: '#999',
                 }}>

                <div
                    className={`${game.selection_animating && game.selection_alert.indexOf(PLAYER_SIDE.TOP) > -1 ? 'blink' : ''}`}>
                    <CardSelector game={game} side={PLAYER_SIDE.TOP}/>
                    <div className={`poker-tip`}>请选择对手的牌</div>
                </div>

                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                    <button className='poker-button' onClick={async () => {
                        if (checkCardsSelected()) {
                            game = await asyncAct(game, ACTION.GAME_START)

                            if(game.node.minmax===-1){
                                alert('抱歉，无法计算该残局')
                            }
                        }
                    }}>开始
                    </button>

                    <button className='poker-button' onClick={() => {
                        if (checkCardsSelected()) {
                            game = act(game, ACTION.SELECT_EXCHANGE)
                        }
                    }}>交换选择
                    </button>

                    <button className='poker-button'
                            style={{width: '150px'}}
                            onClick={async () => {
                                if (checkCardsSelected()) {
                                    let node,res
                                    game = act(game,ACTION.START_LOADING)
                                    node = await build(getCards(game.selection_b), getCards(game.selection_a),game.player_first,(game.maxheap)*100000)
                                    game = act(game,ACTION.END_LOADING)

                                    if(node.minmax===-1){
                                        alert('形势过于复杂，无法计算')
                                    }else{
                                        res = !!node.minmax
                                        alert(res?'有机会赢':'没机会赢')
                                    }

                                }
                            }}>我的赢面
                    </button>


                    <div style={{lineHeight: '40px', fontSize: '30px', margin: '0 10px'}}>我先手出牌</div>

                    <div onClick={() => {
                        game = act(game, ACTION.SELECT_TOGGLE_FIRST)
                    }} className={`poker-checkbox ${game.player_first ? 'checked' : ''}`}></div>

                    <div style={{display:'flex',lineHeight: '40px', fontSize: '30px', margin: '0 10px 0 50px'}}>计算难度(1-40)：</div>

                    <div className='poker-input'>
                        <input type="number" min="1" max="40"
                               value={game.maxheap}
                               onChange={(e)=>{
                                game = act(game,ACTION.CHANGE_MAXHEAP,[Number(e.target.value)])
                            }}
                        />
                    </div>

                </div>
                <div
                    className={`${game.selection_animating && game.selection_alert.indexOf(PLAYER_SIDE.BOTTOM) > -1 ? 'blink' : ''}`}>
                    <div className={`poker-tip`}>请选择您的牌</div>
                    <CardSelector game={game} side={PLAYER_SIDE.BOTTOM}/>
                </div>
            </div>
            <div
                style={{display: game.status == GAME_STATUS.GAMING || game.status == GAME_STATUS.GAMEOVER ? 'inherit' : 'none'}}>
                <Match game={game}/>
            </div>
        </div>
    )
}

const BG = () => {
    const data = useStaticQuery(graphql`
        query {
            placeholderImage: file(relativePath: { eq: "bg.png" }) {
                childImageSharp {
                    # Specify a fixed image and fragment.
                    # The default width is 400 pixels
                    fluid  {
                        ...GatsbyImageSharpFluid
                    }
                }
            }
        }
    `)
    return (
        <Img
            fluid={data.placeholderImage.childImageSharp.fluid}
            alt="Gatsby Docs are awesome"
        />
    )
}

const LoadingSVG = ()=>(<div>
    <svg style={{
        margin: `auto`,
        background: `transparent`,
        display: `block`,
        shapeRendering: `auto`
    }} width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <g transform="rotate(0 50 50)">
            <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
                <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.9166666666666666s" repeatCount="indefinite"></animate>
            </rect>
        </g><g transform="rotate(30 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.8333333333333334s" repeatCount="indefinite"></animate>
        </rect>
    </g><g transform="rotate(60 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.75s" repeatCount="indefinite"></animate>
        </rect>
    </g><g transform="rotate(90 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.6666666666666666s" repeatCount="indefinite"></animate>
        </rect>
    </g><g transform="rotate(120 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5833333333333334s" repeatCount="indefinite"></animate>
        </rect>
    </g><g transform="rotate(150 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5s" repeatCount="indefinite"></animate>
        </rect>
    </g><g transform="rotate(180 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.4166666666666667s" repeatCount="indefinite"></animate>
        </rect>
    </g><g transform="rotate(210 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.3333333333333333s" repeatCount="indefinite"></animate>
        </rect>
    </g><g transform="rotate(240 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.25s" repeatCount="indefinite"></animate>
        </rect>
    </g><g transform="rotate(270 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.16666666666666666s" repeatCount="indefinite"></animate>
        </rect>
    </g><g transform="rotate(300 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.08333333333333333s" repeatCount="indefinite"></animate>
        </rect>
    </g><g transform="rotate(330 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d0e0b">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animate>
        </rect>
    </g>
</svg></div>)

const Poker = () => {
    return (<DndProvider backend={HTML5Backend}>
        <SelectCards/>
        <div className='' style={{
            position: 'fixed',
            zIndex: 0,
            height: '100vh',
            width: '100vw',
            opacity: '.5'
        }}>
            <BG/>
        </div>

    </DndProvider>)
}

export default Poker

