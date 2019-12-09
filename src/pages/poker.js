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
    act,
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

    const restart = () => {
        game = act(game, ACTION.GAME_RESTART)
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
        let ngame = getGame()
        ngame.update = updateGame.bind(this)
        game.player_cards_selected = []
        let root = getGameRoot()

        if (root) {
            let node = build(root.playerCards, root.computerCards)
            for (let i = 0; i < game.node_history.length && i <= game.node_position; i++) {
                node = matchNext(node, game.node_history[i])
                node = findNext(node)
            }
            ngame.node = node
        }
        updateGame(ngame)
    }, [])

    return (
        <div>
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
                    <button className='poker-button' onClick={() => {
                        if (checkCardsSelected()) {
                            game = act(game, ACTION.GAME_START)
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
                            onClick={() => {
                                if (checkCardsSelected()) {
                                    let pcards, ccards, node,res;
                                    pcards = getCards(game.selection_b)
                                    ccards = getCards(game.selection_a)
                                    if (game.player_first) {
                                        node = build(pcards, ccards)
                                        res = !!node.minmax
                                    } else {
                                        node = build(ccards, pcards)
                                        res = !node.minmax
                                    }

                                    alert(res?'有机会赢':'没机会赢')
                                }
                            }}>我的赢面
                    </button>

                    {/*<button style={{margin: '0 10px'}} onClick={() => {*/}
                    {/*    game = act(game, ACTION.SELECT_TOP)*/}
                    {/*}}>选上面*/}
                    {/*</button>*/}

                    <div style={{lineHeight: '40px', fontSize: '30px', margin: '0 10px'}}>我先手出牌</div>

                    <div onClick={() => {
                        game = act(game, ACTION.SELECT_TOGGLE_FIRST)
                    }} className={`poker-checkbox ${game.player_first ? 'checked' : ''}`}></div>

                    {/*<div style={{margin: '0 30px'}}>我准备拿{game.player_side == PLAYER_SIDE.TOP ? '上' : '下'}面的牌</div>*/}
                    {/*<button style={{margin: '0 10px'}} onClick={() => {*/}
                    {/*    game = act(game, ACTION.SELECT_DOWN)*/}
                    {/*}}>选下面*/}
                    {/*</button>*/}
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

