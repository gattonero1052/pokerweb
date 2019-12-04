import {GAME_STATUS, PLAYER_SIDE, ACTION} from "./constants"
import {build, findNext, matchNext} from './algo'

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
    card_pool: card_pool,
    selection_a: [...Array(18).keys()].fill(0),
    selection_b: [...Array(18).keys()].fill(0),
    player_side: PLAYER_SIDE.BOTTOM,
    round: 0,
    player_cards: [],
    player_cards_show: [],
    player_cards_selected: [],
    player_cards_selected_each:[],
    computer_cards: [],
    computer_cards_show: [],
    node_history: [],
    node_position: -1,
    node: null,
    update: null,
}

const save = (game = DEFAULT, str) => {
    if (checkEnv()) {
        let node = game.node

        //saving root
        if (node !== null && !node.parent) {
            window.localStorage.setItem(KEY_ROOT, JSON.stringify({
                playerCards: node.playerCards,
                computerCards: node.computerCards,
            }))
        }

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
const addHistory = (game)=>{
    let choice = game.node.choice || [] //no choice for first node
    game.node_history[++game.node_position] = choice
}
const defaultSelection = (selection)=>{
    return [...Array(selection.length).keys()].fill(0)
}

const act = (game, action, params) => {
    switch (action) {
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
            var chosen = game.player_cards_selected
            chosen = chosen.sort((a,b)=>a-b)
            let next = matchNext(game.node, chosen)
            if(!next){return false}
            game.player_cards = next.playerCardsSaved
            game.player_cards_show = chosen
            next = findNext(next)
            game.node = next
            game.computer_cards = next.computerCardsSaved
            game.computer_cards_show = next.choice
            addHistory(game,next)
            game.player_cards_selected = []
            break

        case ACTION.GAME_CLEAR_SELECTION:
            game.player_cards_selected_each = defaultSelection(game.player_cards)
            game.player_cards_selected = []
            break

        case ACTION.GAME_SELECT:
            var [number, index] = params
            var selected = game.player_cards_selected_each[index]
            if(!selected){//add
                game.player_cards_selected.push(number)
            }else{//remove
                game.player_cards_selected.splice(game.player_cards_selected.indexOf(number),1)
            }
            game.player_cards_selected_each[index] = 1-game.player_cards_selected_each[index]

            break

        case ACTION.GAME_END:
            game.status = GAME_STATUS.GAMEOVER
            break

        case ACTION.GAME_RESTART:
            let root = getRoot()

            if (root) {
                let node = build(root.playerCards, root.computerCards)
                game.node = node
                game.player_cards = node.playerCards
                game.computer_cards = node.computerCards
                game.computer_cards_show = []
                game.player_cards_selected = []
                game.player_cards_selected_each = defaultSelection(game.player_cards)
                game.player_cards_show = []
                game.status = GAME_STATUS.GAMING
            }

            break

        case ACTION.GAME_START:
            const getCards = (selection)=>{
                let cards = []
                selection.forEach((s,i)=>{
                    for (let j = 0; j < s; j++) {
                        cards.push(i)
                    }
                })

                return cards.sort((a,b)=>a-b)
            }

            game.status = GAME_STATUS.GAMING

            if(game.side==PLAYER_SIDE.TOP){
                game.player_cards = getCards(game.selection_a)
                game.computer_cards = getCards(game.selection_b)
            }else{
                game.player_cards = getCards(game.selection_b)
                game.computer_cards = getCards(game.selection_a)
            }

            game.node = build(game.player_cards,game.computer_cards)
            game.player_cards_selected_each = defaultSelection(game.player_cards)
            break
    }

    //save
    game = save(game)
    game.update(game)
    return game
}

export {save, get, DEFAULT, act,getRoot}