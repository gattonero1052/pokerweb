import _ from 'lodash'

const removeItems = (arr, toremove) => {
    toremove = toremove||[]

    for (let i of toremove) {
        let k = 0
        while (k < arr.length) {
            if (k < arr.length && arr[k] === i) {
                arr.splice(k, 1)
                break
            }
            k++
        }
    }
    
    return arr
}

//Decision Tree
class Node {
    constructor(parent = null, turn = 0, player, computer, choice = null, level, choiceHistory) {
        this.parent = parent
        this.minmax = 0
        this.turn = turn
        this.nexts = []
        this.player = player
        this.computer = computer
        this.current = turn ? computer : player
        this.playerCards = player.cards
        this.computerCards = computer.cards
        // this
        this.choice = choice
        this.end = 0
    }

    tryUpdate() {
        if (!this.turn && !this.computerCards.length) {
            // console.log('B wins: ' + choiceHistory.join(','))
            this.update(0)
        }

        if (this.turn && !this.playerCards.length) {
            // console.log('A wins: ' + choiceHistory.join('+'))
            this.update(1)
        }
    }

    add(node) {
        this.nexts.push(node)
        return node
    }

    update(value) {
        this.end = 1
        this.minmax = value
        let cur = this.parent

        while (cur != null) {
            let res = cur.turn

            for (let next of cur.nexts) {
                res = cur.turn ? (res & next.minmax) : (res | next.minmax)
            }

            cur.minmax = res
            cur = cur.parent
        }
    }
}

const isPokerMatch = (sample, b) => {
    if (!sample || !sample.length) return true
    if (b && !b.length) return true

    let lens = sample.length, lenb = b.length
    let allSameS = new Set(sample).size === 1, allSameB = new Set(b).size === 1
    let firstMatch = b[0] > sample[0]

//16+17
    if (lenb === 2 && b[0] + b[1] === 33) return true

//bomb
    if (lenb === 4 && allSameB) {
        return !(lens === 4 && allSameS && !firstMatch)
    }

//1 or 2 or 3
    if (lens < 4) {
        return lenb === lens && firstMatch
    }

    if (lens === 4) {
        if (allSameS) {//4
            return lenb === 4 && allSameB && firstMatch
        } else {//3+1
            return lenb === 4 && !allSameB && firstMatch
        }
    }

//3+2
    if (lens === 5 && new Set(sample).size === 2) {
        return new Set(b).size === 2 && firstMatch
    }

//12345..
    return lenb === lens && firstMatch
}

class Player {
    constructor(cards = [], goFirst) {
        this.cards = cards
        this.goFirst = goFirst
        this.cards = this.cards.sort((a, b) => a - b)
    }

    choices(choice = null) {
        if(choice===null && !this.goFirst)
            return [[]]

        let consecs = [], ones = [], twos = [], threes = [],
            consec = [], sameCount = 1, kings = [], bombs = []

        const addToSec = () => {
            if (consec.length > 4) {
                for (let j = 0; j < consec.length - 4; j++)
                    for (let k = j + 5; k <= consec.length; k++)
                        consecs.push(_.slice(consec, j, k))
            }

            consec = []
        }

        for (let i = 0; i < this.cards.length; i++) {
            let cur = this.cards[i]
            let last = _.last(consec)

            ones.push([cur])

            if (last !== cur) {
                //end of previous consective cards
                if ((cur < 15 && cur !== last + 1) || cur === 15) addToSec()

                consec.push(cur)

                //kings
                if (cur === 17 && last === 16) kings.push([17, 16])
                sameCount = 1
            } else {
                sameCount++
                twos.push([cur, cur])
                if (sameCount === 3) threes.push([cur, cur, cur])
                if (sameCount === 4) bombs.push([cur, cur, cur, cur])
            }
        }

        addToSec()

        let threeOnes = [], threeTwos = []

        for (let i = 0; i < threes.length; i++) {
            for (let j = 0; j < this.cards.length; j++) {
                if (this.cards[j] != threes[i][0]) {
                    threeOnes.push(_.concat(threes[i], [this.cards[j]]))
                }
            }

            for (let j = 0; j < twos.length; j++) {
                if (twos[j][0] != threes[i][0]) {
                    threeTwos.push(_.concat(threes[i], twos[j]))
                }
            }
        }

        let all = [consecs, ones, twos, threes, kings, bombs, threeOnes, threeTwos]

        //no choice is a choice, but if you go first, you can not pass
        if (choice && choice.length)
            all.push([[]])

        return all.reduce((p, c) => _.concat(p, _.uniqBy(c, JSON.stringify)), [])
            .filter(isPokerMatch.bind(this, choice))
    }

    remove(choice) {
        removeItems(this.cards, choice)
    }

    update(choice) {
        // this.cards.splice(0)
        let j = 0
        for (let i of choice) {
            for (; j <= this.cards.length; j++) {
                if (j == this.cards.length || this.cards[j] > i) {
                    this.cards.splice(j, 0, i)
                    break
                }
            }
        }
    }
}

//   let a = '3 4 4 6 6 8 8 17'.split(' ').map(Number), b = '7 9 9'.split(' ').map(Number)
//   let root = new Node(null, 0, a, b)

const buildTree = (node = null, level, choiceHistory) => {
    if (node.end) return
    let choices = node.current.choices(node.choice)

    for (let choice of choices) {
        let stashed = [...choice]
        node.current.remove(choice)
        choiceHistory.push(stashed)
        let child = node.add(new Node(node, 1 - node.turn, node.player, node.computer, stashed, level, choiceHistory))
        child.tryUpdate()
        buildTree(child, level + 1, choiceHistory)
        choiceHistory.pop()
        node.current.update(stashed)
    }
}

//   buildTree(root, 0, [])

//player: player's cards
//computer: computer's cards
const build = (player, computer,playerFirst) => {
    let root = new Node(null, 0, new Player(player,playerFirst), new Player(computer,!playerFirst))

    buildTree(root, 0, [])

    return root
}

//只能过
const onlyToPass = (node) => {
    return node.nexts.length == 1 && !node.nexts[0].choice.length
}

const findNext = (node) => {
    if (node.turn) return _.minBy(node.nexts, next => next.minmax)
    let maxMinmax = _.maxBy(node.nexts, next => next.minmax)
    return maxMinmax
}

const matchNext = (node, chosen) => {
    return node.nexts.filter(next => _.isEqual(next.choice, chosen))[0]
}

const randomMatch = (min, max) => {
    const randomInt = (min, max) => {
        return Math.floor(Math.random() * ((max - min) + 1)) + min
    }

    const cardPool = [...Array(18)].fill(4)
        , cards1 = [...Array(18)].map((_, i) => {
        return [i, 0]
    })
        , cards2 = [...Array(18)].map((_, i) => {
        return [i, 0]
    })
    cardPool[17] = 1
    cardPool[16] = 1

    let cardTotal1 = randomInt(min, max), cardTotal2 = randomInt(min, max)

    Array(cardTotal1).fill(0).forEach(() => {
        for (; ;) {
            let card = randomInt(3, 17)
            if (cardPool[card] > 0) {
                cardPool[card]--
                cards1[card][1]++
                break
            }
        }
    })

    Array(cardTotal2).fill(0).forEach(() => {
        for (; ;) {
            let card = randomInt(3, 17)
            if (cardPool[card] > 0) {
                cardPool[card]--
                cards2[card][1]++
                break
            }
        }
    })

    return [_.chain(cards1).filter(card => card[1]).flatMap(card => [...Array(card[1])].fill(card[0])).value(),
        _.chain(cards2).filter(card => card[1]).flatMap(card => [...Array(card[1])].fill(card[0])).value()]
}

const getGoodMatch = (target) => {

    let res = 1

    while (res >= target || !res) {
        try {
            const [player, computer] = randomMatch(3, 7)
            //example good match
            // let bstr = '7 9 9', astr = '3 4 4 6 6 8 8 17'
            // let a = new Player(astr.split(' ').map(Number)), b = new Player(bstr.split(' ').map(Number))
            let a = new Player(player), b = new Player(computer)

            let root = new Node(null, 0, a, b)

            buildTree(root, 0, [])

            let win = 0
            for (let next of root.nexts) {
                win += next.minmax
            }

            res = win / root.nexts.length
            if (root.minmax && res > 0 && res < target) {
                console.log(`got ${win} winning choices of total ${root.nexts.length}`)
                console.log(`The start cards are: ${player}, ${computer}`)
            }
        } catch (e) {
            console.log(e)
        }
    }
}

const buildRootFromStr = (astr,bstr,aGoFirst)=>{
    let a = new Player(astr.split(',').map(Number),aGoFirst), b = new Player(bstr.split(',').map(Number),!aGoFirst)

    let root = new Node(null, 0, a, b)

    buildTree(root, 0, [])

    return root
}

export {build, findNext, matchNext, onlyToPass,removeItems}