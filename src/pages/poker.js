import React, {useState, useEffect} from "react"
import CardSelector from "../components/poker/cardSelector"
import Layout from "../components/layout"
import CardTaker from "../components/poker/cardTaker"
import {ACTION, GAME_STATUS, PLAYER_SIDE} from "../components/poker/constants"
import {
    save as saveGame,
    get as getGame,
    DEFAULT as defaultGame,
    act,
    getRoot as getGameRoot
} from "../components/poker/machine"
import {build, findNext, matchNext, onlyToPass} from "../components/poker/algo"

const DefaultCardPool = [...Array(18).keys()].map(n => [n < 16 ? 4 : 1, 0, 0])

const Match = ({game}) => {
    const confirmCards = () => {
        if (!game.player_cards_selected.length && !onlyToPass(game.node)) {
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

        if(game.node.end){
            game = act(game, ACTION.GAME_END)
        }
    }

    const restart = ()=>{
        game = act(game, ACTION.GAME_RESTART)
    }

    return (
        <div>
            <div style={{position: "absolute", top: 0}}><CardTaker side={PLAYER_SIDE.TOP} game={game}/></div>

            <div style={{
                position:'absolute',
                bottom: '40px',
                zIndex:'3',
                width:'100vw',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {game.status==GAME_STATUS.GAMEOVER?
                    <div>
                        <button onClick={restart}>重新开始
                        </button>
                    </div>
                :
                    <div>
                        <button onClick={confirmCards}>出牌
                        </button>
                        <button onClick={() => {
                            game = act(game, ACTION.GAME_CLEAR_SELECTION)
                        }}>清空
                        </button>
                    </div>
                }

            </div>

            <div style={{position: "absolute", bottom: 0}}><CardTaker side={PLAYER_SIDE.BOTTOM} game={game}/></div>
        </div>
    )
}

const SelectCards = () => {
    let [game, updateGame] = useState(defaultGame)

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
            <div style={{display: game.status == GAME_STATUS.SELECT ? 'inherit' : 'none'}}>
                <CardSelector game={game} side={PLAYER_SIDE.TOP}/>

                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                    <button style={{margin: '0 10px'}} onClick={() => {
                        game = act(game, ACTION.GAME_START)
                    }}>开始游戏
                    </button>
                    <button style={{margin: '0 10px'}} onClick={() => {
                        game = act(game, ACTION.SELECT_TOP)
                    }}>选上面
                    </button>
                    <div style={{margin: '0 30px'}}>我准备拿{game.player_side == PLAYER_SIDE.TOP ? '上' : '下'}面的牌</div>
                    <button style={{margin: '0 10px'}} onClick={() => {
                        game = act(game, ACTION.SELECT_DOWN)
                    }}>选下面
                    </button>
                </div>

                <CardSelector game={game} side={PLAYER_SIDE.BOTTOM}/>
            </div>
            <div
                style={{display: game.status == GAME_STATUS.GAMING || game.status == GAME_STATUS.GAMEOVER ? 'inherit' : 'none'}}>
                <Match game={game}/>
            </div>
        </div>
    )
}

export default SelectCards