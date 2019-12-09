import {GAME_STATUS, PLAYER_SIDE, ACTION} from "./constants"
import {build, findNext, matchNext,removeItems} from './algo'
import _ from "lodash";

const checkEnv = () => {
    let res = true
    try {
        let res = !!(window && window.localStorage)
    } catch (e) {
        return false
    }
    return res
}

const KEY = "POKER"
const KEY_ROOT = "POKER_ROOT"

//every thing must be basic type or basic type arrays except "node"
let card_pool = [...Array(18).keys()].fill(4)

card_pool[0] = 0
card_pool[1] = 0
card_pool[2] = 0
card_pool[16] = 1
card_pool[17] = 1

const DEFAULT = {
    _version: "1.0.0",
    status: GAME_STATUS.SELECT,
    selection_alert:[],
    card_pool: card_pool,
    selection_a: [...Array(18).keys()].fill(0),
    selection_b: [...Array(18).keys()].fill(0),
    selection_animating:0,
    player_side: PLAYER_SIDE.BOTTOM,
    player_first:1,
    round: 0,
    player_cards: [],
    player_cards_show: [],
    player_cards_selected: [],
    player_cards_selected_suit: [],
    player_cards_selected_suit_last: [],
    player_cards_selected_each:[],
    player_cards_selected_each_suit:[],
    show_computer_cards:1,
    computer_cards: [],
    computer_cards_show: [],
    node_history: [],
    node_position: -1,
    node: null,
    update: null,
}

const saveRoot = (node)=>{
    if (checkEnv()) {
            if (node !== null && !node.parent) {
            window.localStorage.setItem(KEY_ROOT, JSON.stringify({
                playerCards: node.playerCards,
                computerCards: node.computerCards,
            }))
        }
    }
}

const save = (game = DEFAULT, str) => {
    if (checkEnv()) {
        let node = game.node

        //saving root
        saveRoot(node)

        let [backup1, backup2] = [game.node, game.update]
        game.node = null
        game.update= null

        game = JSON.parse(JSON.stringify(game))
        window.localStorage.setItem(KEY, str?str:JSON.stringify(game))

        game.node = backup1
        game.update = backup2
        return game
    }
    return null
}

const get = () => {
    if (checkEnv()) {
        let object = window.localStorage.getItem(KEY)
        return object ? JSON.parse(object) : save()
    }
    return null
}
const getRoot = ()=>{
    if (checkEnv()) {
        let object = window.localStorage.getItem(KEY_ROOT)
        return object ? JSON.parse(object) : null
    }
    return null
}
const defaultSelection = (selection)=>{
    return [...Array(selection.length).keys()].fill(0)
}

const getCards = (selection)=>{
    let cards = []
    selection.forEach((s,i)=>{
        for (let j = 0; j < s; j++) {
            cards.push(i)
        }
    })

    return cards.sort((a,b)=>a-b)
}

const act = (game, action, params) => {
    switch (action) {
        case ACTION.SELECT_STOP_ANIMATION:
            if(!game.selection_animating) return game
            game.selection_animating = 0
            break

        case ACTION.SELECT_ALERT_BOTH:
            if(game.selection_animating) return game
            game.selection_animating = 1
            game.selection_alert = [PLAYER_SIDE.BOTTOM,PLAYER_SIDE.TOP]
            break
        case ACTION.SELECT_ALERT_A:
            if(game.selection_animating) return game
            game.selection_alert = [PLAYER_SIDE.TOP]
            game.selection_animating = 1
            break

        case ACTION.SELECT_ALERT_B:
            if(game.selection_animating) return game
            game.selection_alert = [PLAYER_SIDE.BOTTOM]
            game.selection_animating = 1
            break

        case ACTION.SELECT_TOGGLE_FIRST:
            game.player_first = 1- game.player_first
            break

        case ACTION.SELECT_TOP:
            game.player_side = PLAYER_SIDE.TOP
            break

        case ACTION.SELECT_DOWN:
            game.player_side = PLAYER_SIDE.BOTTOM
            break

        case ACTION.SELECT_ADDCARD:
            var [number, count, side] = params
            var cards = side === PLAYER_SIDE.TOP ? game.selection_a : game.selection_b

            if (game.card_pool[number] >= count) {
                game.card_pool[number] -= count
                cards[number] += count
            }

            break

        case ACTION.SELECT_REMOVECARD:
            var [number, count, side] = params
            var cards = side === PLAYER_SIDE.TOP ? game.selection_a : game.selection_b

            if (cards[number] >= count) {
                game.card_pool[number] += count
                cards[number] -= count
            }

            game.player_side = PLAYER_SIDE.TOP
            break

        case ACTION.GAME_SHOWCARDS:
            game.round++
            var chosen = game.player_cards_selected
            chosen = chosen.sort((a,b)=>a-b)
            let next = matchNext(game.node, chosen)

            game.player_cards = next.playerCards = removeItems([...game.node.playerCards],chosen)
            game.computer_cards = next.computerCards = [...game.node.computerCards]
            game.player_cards_show = chosen
            game.player_cards_selected_suit_last = [...game.player_cards_selected_suit]

            let nextForComputer = findNext(next)
            if(nextForComputer){
                game.round++
                game.computer_cards = nextForComputer.computerCards = removeItems([...next.computerCards],nextForComputer.choice)
                game.player_cards = nextForComputer.playerCards = [...next.playerCards]
                game.computer_cards_show = nextForComputer.choice
                game.node = nextForComputer
            }else{//computer lose
                game.node = next
            }

            game.player_cards_selected = []
            game.player_cards_selected_suit = []
            break

        case ACTION.GAME_CLEAR_SELECTION:
            game.player_cards_selected_each = defaultSelection(game.player_cards)
            game.player_cards_selected = []
            game.player_cards_selected_suit = []
            break

        case ACTION.SELECT_EXCHANGE:
            let temp = game.selection_a
            game.selection_a =game.selection_b
            game.selection_b = temp
            break

        case ACTION.GAME_RESELECT:
            game.status = GAME_STATUS.SELECT
            break

        case ACTION.GAME_SELECT:
            var [number, index] = params
            var selected = game.player_cards_selected_each[index]
            if(!selected){//add
                game.player_cards_selected.push(number)
                game.player_cards_selected_suit.push(game.player_cards_selected_each_suit[index])
            }else{//remove
                let removeIndex = game.player_cards_selected.indexOf(number)
                game.player_cards_selected.splice(removeIndex,1)
                game.player_cards_selected_suit.splice(removeIndex,1)
            }
            game.player_cards_selected_each[index] = 1-game.player_cards_selected_each[index]

            break
        case ACTION.GAME_TOGGLE_COMPUTER:
            game.show_computer_cards = 1-game.show_computer_cards
            break
        case ACTION.GAME_END:
            game.status = GAME_STATUS.GAMEOVER
            break

        case ACTION.GAME_RESTART:
            let node = game.node
            while(node.parent!=null) node = node.parent
            game.node = node

            if (getRoot()) {
                // let node = build(root.playerCards, root.computerCards)
                if(!game.player_first){
                    game = act(game,ACTION.GAME_SHOWCARDS)
                }

                game.player_cards_selected = []
                game.player_cards_selected_suit = []
                game.player_cards_selected_each = defaultSelection(game.player_cards)
                game.player_cards_selected_each_suit = defaultSelection(game.player_cards).map(i=>-~(Math.random()*4)-1)
                game.player_cards_show = []
                game.status = GAME_STATUS.GAMING
                game.round = 0
            }

            break

        case ACTION.GAME_START:
            game.round = 0
            game.status = GAME_STATUS.GAMING
            game.computer_cards_show = []
            game.player_cards_show = []

            if(game.side==PLAYER_SIDE.TOP){
                game.player_cards = getCards(game.selection_a)
                game.computer_cards = getCards(game.selection_b)
            }else{
                game.player_cards = getCards(game.selection_b)
                game.computer_cards = getCards(game.selection_a)
            }

            game.node = build(game.player_cards,game.computer_cards,game.player_first)
            game.node.playerCards = [...game.player_cards]
            game.node.computerCards = [...game.computer_cards]
            if(!game.player_first){
                saveRoot(game.node)
                game = act(game,ACTION.GAME_SHOWCARDS)
            }

            // if(!game.player_first){
            //     saveRoot(game.node)
            //     game.round++
            //     game.node = build(game.computer_cards,game.player_cards)
            //     //saving root
            //
            //     //auto select
            //     var Node = game.node
            //     if (Node.turn) return _.minBy(Node.nexts, next => next.minmax)
            //     var Next = _.maxBy(Node.nexts, next => next.minmax)
            //     // return maxMinmax
            //     // let next = findNext(game.node)
            //     game.computer_cards = Next.playerCardsSaved
            //     game.computer_cards_show = Next.choice
            //     game.player_cards = Next.computerCardsSaved
            //     game.node = Next
            // }else{
            //     game.computer_cards_show = []
            // }
            game.player_cards_selected_each = defaultSelection(game.player_cards)
            game.player_cards_selected_each_suit = defaultSelection(game.player_cards).map((_,i)=>game.player_cards[i]>15?game.player_cards[i]-15:-~(Math.random()*4)-1)

            break
    }

    //save
    game = save(game)
    if(game.update) game.update(game)
    return game
}

export {save, get, DEFAULT, act,getRoot,getCards}